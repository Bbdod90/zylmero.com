"use server";

import { redirect } from "next/navigation";
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

export type AiSetupState = { error?: string };

export async function runAiSetupAction(
  _prev: AiSetupState,
  _formData: FormData,
): Promise<AiSetupState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();

  const mapped = mapCompanySettingsRow(raw as Record<string, unknown>);
  if (mapped?.ai_setup_completed_at) {
    redirect("/dashboard/value-moment");
  }

  const nicheKey: NicheId =
    auth.company.niche && isNicheId(auth.company.niche)
      ? auth.company.niche
      : "garage";
  const cfg = getNicheConfig(nicheKey);

  let services = [...cfg.defaultServices];
  let faqPairs = parseFaq(cfg.defaultFaqTemplate);
  let tone = cfg.defaultTone;
  let reply_style = cfg.defaultReplyStyle;
  let pricing_hints = cfg.defaultPricingHints;

  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = getOpenAI();
      const res = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        response_format: { type: "json_object" },
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
      });
      const txt = res.choices[0]?.message?.content?.trim();
      if (txt) {
        const parsed = JSON.parse(txt) as {
          services?: string[];
          faq?: { q: string; a: string }[];
          tone?: string;
          reply_style?: string;
          pricing_hints?: string;
        };
        if (parsed.services?.length) services = parsed.services.slice(0, 12);
        if (parsed.faq?.length)
          faqPairs = parsed.faq
            .filter((x) => x.q && x.a)
            .slice(0, 8)
            .map((x) => ({ q: x.q.trim(), a: x.a.trim() }));
        if (parsed.tone) tone = parsed.tone;
        if (parsed.reply_style) reply_style = parsed.reply_style;
        if (parsed.pricing_hints) pricing_hints = parsed.pricing_hints;
      }
    } catch {
      /* fallback cfg */
    }
  }

  const auto = await createDefaultAutomations();
  if (auto.error) {
    return { error: auto.error };
  }

  const now = new Date().toISOString();
  const { error: uErr } = await supabase
    .from("company_settings")
    .update({
      services,
      faq: faqPairs,
      tone,
      reply_style,
      pricing_hints,
      ai_setup_completed_at: now,
    })
    .eq("company_id", auth.company.id);

  if (uErr) {
    return { error: uErr.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/value-moment");
}
