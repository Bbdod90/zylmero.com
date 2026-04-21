"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getNicheConfig, isNicheId, type NicheId } from "@/lib/niches";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";
import { createDefaultAutomations } from "@/actions/automations";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";

function parseFaq(source: string) {
  return source
    .split("\n\n")
    .map((block) => {
      const [q, a] = block.split("||");
      return { q: q?.trim() || "", a: a?.trim() || "" };
    })
    .filter((row) => row.q && row.a);
}

function withoutKeys(
  row: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  const next = { ...row };
  for (const k of keys) delete next[k];
  return next;
}

/**
 * Alleen kolommen die AI-setup echt schrijft + bestaande waarden om overschrijven te voorkomen.
 * Geen whatsapp/auto_reply/ai_usage/white_label — die ontbreken vaak op oudere productie-DB's en
 * hoeven hier niet geüpdatet te worden (PostgREST upsert wijzigt alleen meegestuurde keys).
 */
function buildAiSetupSlimUpsertPayload(
  companyId: string,
  existing: Record<string, unknown> | null,
  patch: {
    niche: string;
    services: string[];
    faq: { q: string; a: string }[];
    tone: string;
    reply_style: string;
    pricing_hints: string;
    ai_setup_completed_at: string;
  },
): Record<string, unknown> {
  const e = existing || {};
  return {
    company_id: companyId,
    niche: patch.niche,
    services: patch.services,
    faq: patch.faq,
    pricing_hints: patch.pricing_hints,
    business_hours:
      (e.business_hours as object) ?? ({} as Record<string, unknown>),
    booking_link: (e.booking_link as string | null) ?? null,
    tone: patch.tone,
    reply_style: patch.reply_style,
    language: (e.language as string) || "nl",
    automation_preferences:
      (e.automation_preferences as object) ?? ({} as Record<string, unknown>),
    niche_intake: (e.niche_intake as object) ?? ({} as Record<string, unknown>),
    knowledge_snippets: (e.knowledge_snippets as object) ?? [],
    ai_setup_completed_at: patch.ai_setup_completed_at,
  };
}

function aiSetupUpsertAttempts(slim: Record<string, unknown>): Record<string, unknown>[] {
  return [
    slim,
    withoutKeys(slim, ["knowledge_snippets"]),
    withoutKeys(slim, ["knowledge_snippets", "niche_intake"]),
    withoutKeys(slim, [
      "knowledge_snippets",
      "niche_intake",
      "automation_preferences",
    ]),
    withoutKeys(slim, [
      "knowledge_snippets",
      "niche_intake",
      "automation_preferences",
      "business_hours",
      "booking_link",
    ]),
    withoutKeys(slim, [
      "knowledge_snippets",
      "niche_intake",
      "automation_preferences",
      "business_hours",
      "booking_link",
      "language",
    ]),
    {
      company_id: slim.company_id,
      niche: slim.niche,
      services: slim.services,
      faq: slim.faq,
      pricing_hints: slim.pricing_hints,
      tone: slim.tone,
      reply_style: slim.reply_style,
      ai_setup_completed_at: slim.ai_setup_completed_at,
    },
    {
      company_id: slim.company_id,
      services: slim.services,
      faq: slim.faq,
      pricing_hints: slim.pricing_hints,
      tone: slim.tone,
      reply_style: slim.reply_style,
      ai_setup_completed_at: slim.ai_setup_completed_at,
    },
  ];
}

/** Geen redirect() hier: met useFormState/navigatie faalt dat vaak stil → eeuwige “pending”. Client navigeert bij ok. */
export type AiSetupState = { error?: string; ok?: true };

/**
 * Geen upsert: sommige productie-DB's missen PRIMARY KEY/UNIQUE op company_id, dan faalt ON CONFLICT.
 */
async function writeCompanySettingsRow(
  supabase: SupabaseClient,
  companyId: string,
  body: Record<string, unknown>,
  rowExists: boolean,
): Promise<{ error: { message: string } | null }> {
  if (rowExists) {
    const { error } = await supabase
      .from("company_settings")
      .update(body)
      .eq("company_id", companyId);
    return { error: error ? { message: error.message } : null };
  }
  const { error: insErr } = await supabase.from("company_settings").insert(body);
  if (!insErr) return { error: null };
  const msg = insErr.message || "";
  if (/duplicate|already exists|unique/i.test(msg)) {
    const { error: upErr } = await supabase
      .from("company_settings")
      .update(body)
      .eq("company_id", companyId);
    return { error: upErr ? { message: upErr.message } : null };
  }
  return { error: { message: msg } };
}

async function persistAiSetup(
  services: string[],
  faqPairs: { q: string; a: string }[],
  tone: string,
  reply_style: string,
  pricing_hints: string,
  runOpenAi: boolean,
): Promise<AiSetupState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Je sessie is verlopen. Log opnieuw in." };
  }

  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();

  const existing = raw as Record<string, unknown> | null;
  const mapped = mapCompanySettingsRow(existing);
  if (mapped?.ai_setup_completed_at) {
    revalidatePath("/", "layout");
    return { ok: true };
  }

  const nicheKey: NicheId =
    auth.company.niche && isNicheId(auth.company.niche)
      ? auth.company.niche
      : "general_services";
  const cfg = getNicheConfig(nicheKey);

  let servicesOut = [...services];
  let faqPairsOut = [...faqPairs];
  let toneOut = tone;
  let replyOut = reply_style;
  let pricingOut = pricing_hints;

  const auto = await createDefaultAutomations();
  if (auto.error) {
    return { error: auto.error };
  }

  if (runOpenAi && process.env.OPENAI_API_KEY) {
    try {
      const openai = getOpenAI();
      const signal = AbortSignal.timeout(22_000);
      const res = await openai.chat.completions.create(
        {
          model: OPENAI_MODEL,
          response_format: { type: "json_object" },
          max_tokens: 2500,
          messages: [
            {
              role: "system",
              content:
                "Je bent een NL copywriter voor servicebedrijven. Antwoord alleen met geldige JSON.",
            },
            {
              role: "user",
              content: `Bedrijf: ${auth.company.name}. Branche: ${cfg.label}.
Genereer JSON met keys: services (array van 6-10 korte dienstregels), faq (array van {q,a}, 4-6 items), tone (string), reply_style (string), pricing_hints (string met richtprijzen).
Taal: Nederlands. Toon: professioneel, verkopend, helder.`,
            },
          ],
        },
        { signal },
      );
      const txt = res.choices[0]?.message?.content?.trim();
      if (txt) {
        const parsed = JSON.parse(txt) as {
          services?: string[];
          faq?: { q: string; a: string }[];
          tone?: string;
          reply_style?: string;
          pricing_hints?: string;
        };
        if (parsed.services?.length)
          servicesOut = parsed.services.slice(0, 12);
        if (parsed.faq?.length)
          faqPairsOut = parsed.faq
            .filter((x) => x.q && x.a)
            .slice(0, 8)
            .map((x) => ({ q: x.q.trim(), a: x.a.trim() }));
        if (parsed.tone) toneOut = parsed.tone;
        if (parsed.reply_style) replyOut = parsed.reply_style;
        if (parsed.pricing_hints) pricingOut = parsed.pricing_hints;
      }
    } catch {
      /* timeout, netwerk of parse — branche-defaults blijven staan */
    }
  }

  const now = new Date().toISOString();
  const nicheLabel =
    (existing?.niche as string) ||
    mapped?.niche ||
    cfg.label;

  const slim = buildAiSetupSlimUpsertPayload(auth.company.id, existing, {
    niche: nicheLabel,
    services: servicesOut,
    faq: faqPairsOut,
    tone: toneOut,
    reply_style: replyOut,
    pricing_hints: pricingOut,
    ai_setup_completed_at: now,
  });

  const attempts = aiSetupUpsertAttempts(slim);
  const rowExists = existing != null;
  let lastMsg: string | null = null;
  for (const body of attempts) {
    const { error: uErr } = await writeCompanySettingsRow(
      supabase,
      auth.company.id,
      body,
      rowExists,
    );
    if (!uErr) {
      revalidatePath("/", "layout");
      return { ok: true };
    }
    lastMsg = uErr.message;
  }

  return { error: lastMsg ?? "Opslaan mislukt." };
}

export async function runAiSetupAction(
  prev: AiSetupState,
  formData: FormData,
): Promise<AiSetupState> {
  void prev;
  void formData;
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Je sessie is verlopen. Log opnieuw in." };
  }

  const nicheKey: NicheId =
    auth.company.niche && isNicheId(auth.company.niche)
      ? auth.company.niche
      : "general_services";
  const cfg = getNicheConfig(nicheKey);

  const services = [...cfg.defaultServices];
  const faqPairs = parseFaq(cfg.defaultFaqTemplate);
  return persistAiSetup(
    services,
    faqPairs,
    cfg.defaultTone,
    cfg.defaultReplyStyle,
    cfg.defaultPricingHints,
    true,
  );
}

/** Branche-defaults zonder OpenAI — zelfde pad als “genereren” maar direct door naar volgende stap. */
export async function skipAiSetupAction(): Promise<AiSetupState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Je sessie is verlopen. Log opnieuw in." };
  }

  const nicheKey: NicheId =
    auth.company.niche && isNicheId(auth.company.niche)
      ? auth.company.niche
      : "general_services";
  const cfg = getNicheConfig(nicheKey);

  const services = [...cfg.defaultServices];
  const faqPairs = parseFaq(cfg.defaultFaqTemplate);
  return persistAiSetup(
    services,
    faqPairs,
    cfg.defaultTone,
    cfg.defaultReplyStyle,
    cfg.defaultPricingHints,
    false,
  );
}
