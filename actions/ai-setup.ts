"use server";

import { revalidatePath } from "next/cache";
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

function buildUpsertPayload(
  companyId: string,
  existing: Record<string, unknown> | null,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const e = existing || {};
  const whatsapp =
    e.whatsapp_channel && typeof e.whatsapp_channel === "object"
      ? e.whatsapp_channel
      : { provider: "mock", connected: false };
  return {
    company_id: companyId,
    niche: (patch.niche as string) ?? (e.niche as string) ?? null,
    services: (patch.services as string[]) ?? (e.services as string[]) ?? [],
    faq: (patch.faq as object) ?? (e.faq as object) ?? [],
    pricing_hints:
      (patch.pricing_hints as string | null) ??
      (e.pricing_hints as string | null) ??
      null,
    business_hours:
      (patch.business_hours as object) ??
      (e.business_hours as object) ??
      ({} as Record<string, unknown>),
    booking_link:
      (patch.booking_link as string | null) ??
      (e.booking_link as string | null) ??
      null,
    tone: (patch.tone as string | null) ?? (e.tone as string | null) ?? null,
    reply_style:
      (patch.reply_style as string | null) ??
      (e.reply_style as string | null) ??
      null,
    language: (patch.language as string) ?? (e.language as string) ?? "nl",
    automation_preferences:
      (patch.automation_preferences as object) ??
      (e.automation_preferences as object) ??
      ({} as Record<string, unknown>),
    whatsapp_channel: (patch.whatsapp_channel as object) ?? whatsapp,
    auto_reply_enabled:
      (patch.auto_reply_enabled as boolean) ??
      Boolean(e.auto_reply_enabled),
    auto_reply_delay_seconds:
      typeof patch.auto_reply_delay_seconds === "number"
        ? patch.auto_reply_delay_seconds
        : typeof e.auto_reply_delay_seconds === "number"
          ? e.auto_reply_delay_seconds
          : 30,
    ai_usage_count:
      typeof patch.ai_usage_count === "number"
        ? patch.ai_usage_count
        : typeof e.ai_usage_count === "number"
          ? e.ai_usage_count
          : 0,
    ai_setup_completed_at:
      (patch.ai_setup_completed_at as string) ??
      (e.ai_setup_completed_at as string) ??
      null,
    niche_intake:
      (patch.niche_intake as object) ??
      (e.niche_intake as object) ??
      ({} as Record<string, unknown>),
    knowledge_snippets:
      (patch.knowledge_snippets as object) ??
      (e.knowledge_snippets as object) ??
      [],
    white_label_logo_url:
      (patch.white_label_logo_url as string | null) ??
      (e.white_label_logo_url as string | null) ??
      null,
    white_label_primary:
      (patch.white_label_primary as string | null) ??
      (e.white_label_primary as string | null) ??
      null,
  };
}

/** Geen redirect() hier: met useFormState/navigatie faalt dat vaak stil → eeuwige “pending”. Client navigeert bij ok. */
export type AiSetupState = { error?: string; ok?: true };

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
      : "garage";
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

  const payload = buildUpsertPayload(auth.company.id, existing, {
    niche: nicheLabel,
    services: servicesOut,
    faq: faqPairsOut,
    tone: toneOut,
    reply_style: replyOut,
    pricing_hints: pricingOut,
    ai_setup_completed_at: now,
  });

  const { error: uErr } = await supabase
    .from("company_settings")
    .upsert(payload, { onConflict: "company_id" });

  if (uErr) {
    return { error: uErr.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function runAiSetupAction(
  _prev: AiSetupState,
  _formData: FormData,
): Promise<AiSetupState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { error: "Je sessie is verlopen. Log opnieuw in." };
  }

  const nicheKey: NicheId =
    auth.company.niche && isNicheId(auth.company.niche)
      ? auth.company.niche
      : "garage";
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
      : "garage";
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
