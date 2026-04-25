"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import {
  isNonPublicKnowledgeHost,
  normalizeKnowledgeWebsiteUrl,
} from "@/lib/url/public-site-url";
import { isDemoMode } from "@/lib/env";
import {
  AI_KNOWLEDGE_MAX_DEPTH,
  AI_KNOWLEDGE_MAX_PAGES,
} from "@/lib/ai/knowledge-crawl-config";
import type { AiKnowledgePage, KnowledgeSnippet } from "@/lib/types";

export type SettingsFormState = { ok?: boolean; error?: string };

const MAX_TEXT_PER_PAGE = 2200;

type CrawlResult = {
  pages: AiKnowledgePage[];
  crawledDocument: string;
  /** True als er nog URL’s in de wachtrij zaten (we stoppen bij het maximum). */
  capped: boolean;
};

function parseKnowledgeSnippets(raw: string): KnowledgeSnippet[] {
  const out: KnowledgeSnippet[] = [];
  for (const block of raw
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean)) {
    const i = block.indexOf("||");
    if (i === -1) continue;
    const title = block.slice(0, i).trim();
    const body = block.slice(i + 2).trim();
    if (title && body) out.push({ title, body });
  }
  return out;
}

function stripHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(raw: string): string {
  let s = raw
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : "";
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : "";
    });
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    hellip: "…",
  };
  s = s.replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
  return s;
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const raw = m?.[1]?.replace(/\s+/g, " ").trim() || "";
  return decodeHtmlEntities(raw.replace(/<[^>]+>/g, "").trim());
}

async function fetchSitemapBody(url: URL): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(url.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "ZylmeroKnowledgeBot/1.0 (+https://zylmero.com)" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("xml") && !ct.includes("text") && !ct.includes("html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Haalt pagina-URL’s uit sitemap(s); volgt geneste .xml-sitemaps (bijv. Shopify index). */
async function discoverUrlsFromSitemaps(origin: URL): Promise<URL[]> {
  const pageUrls: URL[] = [];
  const seenXml = new Set<string>();
  const seeds = [
    new URL("/sitemap.xml", origin),
    new URL("/sitemap_index.xml", origin),
    new URL("/sitemap_products_1.xml", origin),
  ];

  async function walkXmlSitemap(xmlUrl: URL, depth: number): Promise<void> {
    const key = xmlUrl.toString();
    if (depth > 4 || seenXml.has(key)) return;
    seenXml.add(key);
    const body = await fetchSitemapBody(xmlUrl);
    if (!body) return;
    const locRe = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
    let m: RegExpExecArray | null;
    while ((m = locRe.exec(body))) {
      try {
        const u = new URL(m[1]);
        u.hash = "";
        if (u.host !== origin.host) continue;
        if (!["http:", "https:"].includes(u.protocol)) continue;
        if (u.pathname !== "/" && u.pathname.endsWith("/")) u.pathname = u.pathname.slice(0, -1);
        if (/\.xml$/i.test(u.pathname)) {
          await walkXmlSitemap(u, depth + 1);
        } else {
          pageUrls.push(u);
        }
      } catch {
        continue;
      }
    }
  }

  for (const sm of seeds) {
    await walkXmlSitemap(sm, 0);
  }
  return pageUrls;
}

function extractLinks(html: string, baseUrl: URL): URL[] {
  const links: URL[] = [];
  const re = /href\s*=\s*["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null = null;
  while ((match = re.exec(html))) {
    try {
      const raw = match[1]?.trim();
      if (!raw) continue;
      if (raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) continue;
      const u = new URL(raw, baseUrl);
      u.hash = "";
      if (u.pathname !== "/" && u.pathname.endsWith("/")) u.pathname = u.pathname.slice(0, -1);
      links.push(u);
    } catch {
      continue;
    }
  }
  return links;
}

async function crawlKnowledgeWebsite(startWebsite: string): Promise<CrawlResult> {
  const start = new URL(startWebsite);
  const startHost = start.host;
  const queue: Array<{ url: URL; depth: number }> = [{ url: start, depth: 0 }];
  const seen = new Set<string>();
  const pages: AiKnowledgePage[] = [];

  try {
    const fromSitemap = await discoverUrlsFromSitemaps(start);
    for (const u of fromSitemap) {
      const k = u.toString();
      if (!seen.has(k)) queue.push({ url: u, depth: 0 });
    }
  } catch {
    /* sitemap optioneel */
  }

  while (queue.length > 0 && pages.length < AI_KNOWLEDGE_MAX_PAGES) {
    const next = queue.shift();
    if (!next) break;
    const key = next.url.toString();
    if (seen.has(key)) continue;
    seen.add(key);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12_000);
      const res = await fetch(key, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "ZylmeroKnowledgeBot/1.0 (+https://zylmero.com)" },
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) continue;
      const html = await res.text();
      const title = extractTitle(html) || next.url.pathname || next.url.host;
      const text = stripHtml(html).slice(0, MAX_TEXT_PER_PAGE);
      if (text.length < 80) continue;
      pages.push({
        url: key,
        title: title.slice(0, 140),
        excerpt: text.slice(0, 320),
        saved_at: new Date().toISOString(),
      });

      if (next.depth >= AI_KNOWLEDGE_MAX_DEPTH) continue;
      const links = extractLinks(html, next.url);
      for (const link of links) {
        if (link.host !== startHost) continue;
        if (!["http:", "https:"].includes(link.protocol)) continue;
        if (/\.(png|jpe?g|gif|webp|svg|pdf|zip|mp4|mp3|woff2?)$/i.test(link.pathname)) continue;
        const lk = link.toString();
        if (!seen.has(lk)) queue.push({ url: link, depth: next.depth + 1 });
      }
    } catch {
      continue;
    }
  }

  const capped =
    pages.length >= AI_KNOWLEDGE_MAX_PAGES && queue.length > 0;

  const crawledDocument = pages
    .map((p) => `URL: ${p.url}\nTitel: ${p.title}\nSamenvatting: ${p.excerpt}`)
    .join("\n\n---\n\n");
  return { pages, crawledDocument, capped };
}

export async function updateBusinessProfileAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Niet ingelogd." };
  }

  const name = String(formData.get("company_name") || "").trim();
  const contact_email = String(formData.get("contact_email") || "").trim();
  const contact_phone = String(formData.get("contact_phone") || "").trim();
  const niche = String(formData.get("niche") || "").trim();
  const services = String(formData.get("services") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const booking_link = String(formData.get("booking_link") || "").trim();

  if (!name) return { error: "Bedrijfsnaam verplicht." };

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const prevPrefs =
    (settingsRow?.automation_preferences as Record<string, unknown>) || {};

  const { error: e1 } = await supabase
    .from("companies")
    .update({
      name,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      profile_intake_completed: true,
    })
    .eq("id", auth.company.id);

  if (e1) return { error: e1.message };

  const { error: e2 } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: niche || prev?.niche || null,
      services: services.length ? services : prev?.services ?? [],
      faq: prev?.faq ?? [],
      pricing_hints: prev?.pricing_hints ?? null,
      business_hours: prev?.business_hours ?? {},
      booking_link: booking_link || null,
      tone: prev?.tone ?? null,
      reply_style: prev?.reply_style ?? null,
      language: prev?.language ?? "nl",
      automation_preferences: {
        ...prevPrefs,
        niche_key: auth.company.niche ?? prevPrefs.niche_key,
      },
      whatsapp_channel: prev?.whatsapp_channel ?? {
        provider: "mock",
        connected: false,
      },
      auto_reply_enabled: prev?.auto_reply_enabled ?? false,
      auto_reply_delay_seconds: prev?.auto_reply_delay_seconds ?? 30,
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets: prev?.knowledge_snippets ?? [],
      white_label_logo_url: prev?.white_label_logo_url ?? null,
      white_label_primary: prev?.white_label_primary ?? null,
    },
    { onConflict: "company_id" },
  );

  if (e2) return { error: e2.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function updateKnowledgeAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Niet ingelogd." };
  }

  const faqPairs = String(formData.get("faq") || "")
    .split("\n\n")
    .map((block) => {
      const [q, a] = block.split("||");
      return { q: q?.trim() || "", a: a?.trim() || "" };
    })
    .filter((row) => row.q && row.a);
  const pricing_hints = String(formData.get("pricing_hints") || "").trim();
  const hoursRaw = String(formData.get("business_hours") || "").trim();
  const snippetsRaw = String(formData.get("knowledge_snippets") || "");

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const knowledge_snippets = parseKnowledgeSnippets(snippetsRaw);

  const { error } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: prev?.niche ?? null,
      services: prev?.services ?? [],
      faq: faqPairs.length ? faqPairs : [],
      pricing_hints: pricing_hints || null,
      business_hours: hoursRaw
        ? ({ text: hoursRaw } as Record<string, string>)
        : {},
      booking_link: prev?.booking_link ?? null,
      tone: prev?.tone ?? null,
      reply_style: prev?.reply_style ?? null,
      language: prev?.language ?? "nl",
      automation_preferences: prev?.automation_preferences ?? {},
      whatsapp_channel: prev?.whatsapp_channel ?? {
        provider: "mock",
        connected: false,
      },
      auto_reply_enabled: prev?.auto_reply_enabled ?? false,
      auto_reply_delay_seconds: prev?.auto_reply_delay_seconds ?? 30,
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets,
      white_label_logo_url: prev?.white_label_logo_url ?? null,
      white_label_primary: prev?.white_label_primary ?? null,
    },
    { onConflict: "company_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/ai");
  return { ok: true };
}

export async function updateWhiteLabelAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Niet ingelogd." };
  }

  const white_label_logo_url = String(
    formData.get("white_label_logo_url") || "",
  ).trim();
  let white_label_primary = String(
    formData.get("white_label_primary") || "",
  ).trim();
  if (white_label_primary && !/^#[0-9A-Fa-f]{6}$/.test(white_label_primary)) {
    return { error: "Primaire kleur: gebruik hex, bv. #2563eb" };
  }
  if (!white_label_primary) white_label_primary = "";

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);

  const { error } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: prev?.niche ?? null,
      services: prev?.services ?? [],
      faq: prev?.faq ?? [],
      pricing_hints: prev?.pricing_hints ?? null,
      business_hours: prev?.business_hours ?? {},
      booking_link: prev?.booking_link ?? null,
      tone: prev?.tone ?? null,
      reply_style: prev?.reply_style ?? null,
      language: prev?.language ?? "nl",
      automation_preferences: prev?.automation_preferences ?? {},
      whatsapp_channel: prev?.whatsapp_channel ?? {
        provider: "mock",
        connected: false,
      },
      auto_reply_enabled: prev?.auto_reply_enabled ?? false,
      auto_reply_delay_seconds: prev?.auto_reply_delay_seconds ?? 30,
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets: prev?.knowledge_snippets ?? [],
      white_label_logo_url: white_label_logo_url || null,
      white_label_primary: white_label_primary || null,
    },
    { onConflict: "company_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function updateAiSettingsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Niet ingelogd." };
  }

  const tone = String(formData.get("tone") || "").trim();
  const reply_style = String(formData.get("reply_style") || "").trim();
  const language = String(formData.get("language") || "").trim();
  const auto = String(formData.get("automation_preferences") || "").trim();

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const prevAi =
    (settingsRow?.automation_preferences as Record<string, unknown>) || {};
  const automation_preferences = {
    ...prevAi,
    note: auto,
    niche_key: auth.company.niche ?? prevAi.niche_key,
  };

  const { error } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: prev?.niche ?? null,
      services: prev?.services ?? [],
      faq: prev?.faq ?? [],
      pricing_hints: prev?.pricing_hints ?? null,
      business_hours: prev?.business_hours ?? {},
      booking_link: prev?.booking_link ?? null,
      tone: tone || null,
      reply_style: reply_style || null,
      language: language || "nl",
      automation_preferences,
      whatsapp_channel: prev?.whatsapp_channel ?? {
        provider: "mock",
        connected: false,
      },
      auto_reply_enabled: prev?.auto_reply_enabled ?? false,
      auto_reply_delay_seconds: prev?.auto_reply_delay_seconds ?? 30,
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets: prev?.knowledge_snippets ?? [],
      white_label_logo_url: prev?.white_label_logo_url ?? null,
      white_label_primary: prev?.white_label_primary ?? null,
    },
    { onConflict: "company_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/ai");
  return { ok: true };
}

export async function updateWhatsAppSettingsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Niet ingelogd." };
  }

  const providerRaw = String(formData.get("provider") || "mock");
  const provider =
    providerRaw === "twilio" || providerRaw === "meta" ? providerRaw : "mock";
  const connected = formData.get("connected") === "on";
  const phone_number = String(formData.get("phone_number") || "").trim();
  const external_id = String(formData.get("external_id") || "").trim();
  const auto_reply_enabled = formData.get("auto_reply_enabled") === "on";
  const auto_reply_delay_seconds = Number(
    formData.get("auto_reply_delay_seconds") || 30,
  );

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const prevCh = (settingsRow?.whatsapp_channel as Record<string, unknown>) || {};

  const { error } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: prev?.niche ?? null,
      services: prev?.services ?? [],
      faq: prev?.faq ?? [],
      pricing_hints: prev?.pricing_hints ?? null,
      business_hours: prev?.business_hours ?? {},
      booking_link: prev?.booking_link ?? null,
      tone: prev?.tone ?? null,
      reply_style: prev?.reply_style ?? null,
      language: prev?.language ?? "nl",
      automation_preferences: prev?.automation_preferences ?? {},
      whatsapp_channel: {
        provider,
        connected,
        phone_number: phone_number || null,
        external_id: external_id || null,
        last_sync_at:
          typeof prevCh.last_sync_at === "string" ? prevCh.last_sync_at : null,
      },
      auto_reply_enabled,
      auto_reply_delay_seconds: Math.min(
        Math.max(Math.floor(auto_reply_delay_seconds), 0),
        300,
      ),
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets: prev?.knowledge_snippets ?? [],
      white_label_logo_url: prev?.white_label_logo_url ?? null,
      white_label_primary: prev?.white_label_primary ?? null,
    },
    { onConflict: "company_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function updateEmailInboundSettingsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  if (isDemoMode()) {
    return { error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Niet ingelogd." };
  }

  const email_inbound_enabled = formData.get("email_inbound_enabled") === "on";

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const prevPrefs =
    (settingsRow?.automation_preferences as Record<string, unknown>) || {};

  const automation_preferences = {
    ...prevPrefs,
    email_inbound_enabled,
    niche_key: auth.company.niche ?? prevPrefs.niche_key,
  };

  const { error } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: prev?.niche ?? null,
      services: prev?.services ?? [],
      faq: prev?.faq ?? [],
      pricing_hints: prev?.pricing_hints ?? null,
      business_hours: prev?.business_hours ?? {},
      booking_link: prev?.booking_link ?? null,
      tone: prev?.tone ?? null,
      reply_style: prev?.reply_style ?? null,
      language: prev?.language ?? "nl",
      automation_preferences,
      whatsapp_channel: prev?.whatsapp_channel ?? {
        provider: "mock",
        connected: false,
      },
      auto_reply_enabled: prev?.auto_reply_enabled ?? false,
      auto_reply_delay_seconds: prev?.auto_reply_delay_seconds ?? 30,
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets: prev?.knowledge_snippets ?? [],
      white_label_logo_url: prev?.white_label_logo_url ?? null,
      white_label_primary: prev?.white_label_primary ?? null,
    },
    { onConflict: "company_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/ai-koppelingen");
  return { ok: true };
}

export async function updateAiKnowledgeAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  if (isDemoMode()) {
    return { error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Niet ingelogd." };
  }

  const website = normalizeKnowledgeWebsiteUrl(
    String(formData.get("ai_knowledge_website") || ""),
  );
  const document = String(formData.get("ai_knowledge_document") || "").trim();
  if (document.length > 48_000) {
    return { error: "Tekst is te lang (max. 48.000 tekens)." };
  }
  if (website && isNonPublicKnowledgeHost(website)) {
    return {
      error:
        "Gebruik je publieke website (bijv. https://jouwdomein.nl), geen localhost. Lokaal testen kan in .env, niet in dit veld.",
    };
  }

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const prevAi =
    (settingsRow?.automation_preferences as Record<string, unknown>) || {};

  let pages: AiKnowledgePage[] = [];
  let crawledDocument = "";
  let crawlCapped = false;
  if (website) {
    try {
      const crawled = await crawlKnowledgeWebsite(website);
      pages = crawled.pages;
      crawledDocument = crawled.crawledDocument;
      crawlCapped = crawled.capped;
    } catch {
      // Non-blocking: user can still save manual knowledge.
    }
  }

  const automation_preferences = {
    ...prevAi,
    ai_knowledge_website: website || null,
    ai_knowledge_document: document || null,
    ai_knowledge_pages: pages,
    ai_knowledge_crawled_document: crawledDocument || null,
    ai_knowledge_last_scanned_at: new Date().toISOString(),
    ai_knowledge_crawl_capped: website ? crawlCapped : false,
    niche_key: auth.company.niche ?? prevAi.niche_key,
  };

  const { error } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: prev?.niche ?? null,
      services: prev?.services ?? [],
      faq: prev?.faq ?? [],
      pricing_hints: prev?.pricing_hints ?? null,
      business_hours: prev?.business_hours ?? {},
      booking_link: prev?.booking_link ?? null,
      tone: prev?.tone ?? null,
      reply_style: prev?.reply_style ?? null,
      language: prev?.language ?? "nl",
      automation_preferences,
      whatsapp_channel: prev?.whatsapp_channel ?? {
        provider: "mock",
        connected: false,
      },
      auto_reply_enabled: prev?.auto_reply_enabled ?? false,
      auto_reply_delay_seconds: prev?.auto_reply_delay_seconds ?? 30,
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets: prev?.knowledge_snippets ?? [],
      white_label_logo_url: prev?.white_label_logo_url ?? null,
      white_label_primary: prev?.white_label_primary ?? null,
    },
    { onConflict: "company_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/ai-knowledge");
  revalidatePath("/dashboard/ai");
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function removeAiKnowledgePageAction(
  formData: FormData,
): Promise<SettingsFormState> {
  if (isDemoMode()) {
    return { error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Niet ingelogd." };
  }

  const targetUrl = String(formData.get("url") || "").trim();
  if (!targetUrl) return { error: "Geen URL gekozen." };

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const prevAi =
    (settingsRow?.automation_preferences as Record<string, unknown>) || {};
  const rawPages = Array.isArray(prevAi.ai_knowledge_pages)
    ? (prevAi.ai_knowledge_pages as AiKnowledgePage[])
    : [];
  const nextPages = rawPages.filter((p) => p && typeof p.url === "string" && p.url !== targetUrl);
  const nextCrawled = nextPages
    .map((p) => `URL: ${p.url}\nTitel: ${p.title}\nSamenvatting: ${p.excerpt}`)
    .join("\n\n---\n\n");

  const { error } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: prev?.niche ?? null,
      services: prev?.services ?? [],
      faq: prev?.faq ?? [],
      pricing_hints: prev?.pricing_hints ?? null,
      business_hours: prev?.business_hours ?? {},
      booking_link: prev?.booking_link ?? null,
      tone: prev?.tone ?? null,
      reply_style: prev?.reply_style ?? null,
      language: prev?.language ?? "nl",
      automation_preferences: {
        ...prevAi,
        ai_knowledge_pages: nextPages,
        ai_knowledge_crawled_document: nextCrawled || null,
        ai_knowledge_last_scanned_at: new Date().toISOString(),
        niche_key: auth.company.niche ?? prevAi.niche_key,
      },
      whatsapp_channel: prev?.whatsapp_channel ?? {
        provider: "mock",
        connected: false,
      },
      auto_reply_enabled: prev?.auto_reply_enabled ?? false,
      auto_reply_delay_seconds: prev?.auto_reply_delay_seconds ?? 30,
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets: prev?.knowledge_snippets ?? [],
      white_label_logo_url: prev?.white_label_logo_url ?? null,
      white_label_primary: prev?.white_label_primary ?? null,
    },
    { onConflict: "company_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/ai-knowledge");
  revalidatePath("/dashboard/ai");
  return { ok: true };
}

export async function removeAiKnowledgePageSubmitAction(
  formData: FormData,
): Promise<void> {
  await removeAiKnowledgePageAction(formData);
}

export async function updateQuoteTemplateAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  if (isDemoMode()) {
    return { error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Niet ingelogd." };
  }

  const quote_intro = String(formData.get("quote_intro") || "").trim() || null;
  const quote_footer = String(formData.get("quote_footer") || "").trim() || null;
  const quote_include_pricing_hints =
    formData.get("quote_include_pricing_hints") === "on";
  const quote_include_zylmero_notice =
    formData.get("quote_include_zylmero_notice") === "on";

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const prevPrefs =
    (settingsRow?.automation_preferences as Record<string, unknown>) || {};

  const automation_preferences = {
    ...prevPrefs,
    quote_intro,
    quote_footer,
    quote_include_pricing_hints,
    quote_include_zylmero_notice,
    niche_key: auth.company.niche ?? prevPrefs.niche_key,
  };

  const { error } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: prev?.niche ?? null,
      services: prev?.services ?? [],
      faq: prev?.faq ?? [],
      pricing_hints: prev?.pricing_hints ?? null,
      business_hours: prev?.business_hours ?? {},
      booking_link: prev?.booking_link ?? null,
      tone: prev?.tone ?? null,
      reply_style: prev?.reply_style ?? null,
      language: prev?.language ?? "nl",
      automation_preferences,
      whatsapp_channel: prev?.whatsapp_channel ?? {
        provider: "mock",
        connected: false,
      },
      auto_reply_enabled: prev?.auto_reply_enabled ?? false,
      auto_reply_delay_seconds: prev?.auto_reply_delay_seconds ?? 30,
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets: prev?.knowledge_snippets ?? [],
      white_label_logo_url: prev?.white_label_logo_url ?? null,
      white_label_primary: prev?.white_label_primary ?? null,
    },
    { onConflict: "company_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/quotes");
  return { ok: true };
}
