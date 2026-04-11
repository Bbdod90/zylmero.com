"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { isDemoMode } from "@/lib/env";
import type { KnowledgeSnippet } from "@/lib/types";

export type SettingsFormState = { ok?: boolean; error?: string };

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
    ...(auto ? { note: auto } : {}),
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

  const website = String(formData.get("ai_knowledge_website") || "").trim();
  const document = String(formData.get("ai_knowledge_document") || "").trim();
  if (document.length > 48_000) {
    return { error: "Tekst is te lang (max. 48.000 tekens)." };
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

  const automation_preferences = {
    ...prevAi,
    ai_knowledge_website: website || null,
    ai_knowledge_document: document || null,
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
