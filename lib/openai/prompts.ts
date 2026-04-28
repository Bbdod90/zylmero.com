import type { CompanySettings } from "@/lib/types";
import { getNicheConfig } from "@/lib/niches";

export function businessContextBlock(
  companyName: string,
  settings: CompanySettings | null,
  nicheId?: string | null,
) {
  const fromPrefs = (
    settings?.automation_preferences as { niche_key?: string } | undefined
  )?.niche_key;
  const resolved = nicheId ?? fromPrefs ?? undefined;
  const niche = getNicheConfig(resolved);
  const services = settings?.services?.length
    ? settings.services.join(", ")
    : niche.defaultServices.join(", ");
  const displayNiche =
    settings?.niche?.trim() || niche.label;

  const prefs = settings?.automation_preferences as
    | {
        niche_intake?: Record<string, string>;
        ai_knowledge_crawled_document?: string;
        chatbot_company_description?: string;
        chatbot_opening_line?: string;
        chatbot_extra_info?: string;
      }
    | undefined;
  const intake =
    settings?.niche_intake && Object.keys(settings.niche_intake).length > 0
      ? settings.niche_intake
      : prefs?.niche_intake;
  const intakeLines =
    intake && Object.keys(intake).length
      ? `Branche-intake (intern):\n${Object.entries(intake)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join("\n")}`
      : "";

  const q = niche.ai.qualifyingQuestions;

  return [
    `Bedrijf: ${companyName}`,
    `Branche / positie: ${displayNiche}`,
    `Branche-id (config): ${niche.id}`,
    niche.ai.contextExtra ? `Branche-instructie: ${niche.ai.contextExtra}` : "",
    `Diensten: ${services}`,
    settings?.pricing_hints
      ? `Prijsrichting (intern): ${settings.pricing_hints}`
      : `Prijsrichting (intern): ${niche.defaultPricingHints}`,
    settings?.business_hours
      ? `Openingstijden / bereikbaarheid: ${JSON.stringify(settings.business_hours)}`
      : "",
    settings?.booking_link ? `Boekingslink: ${settings.booking_link}` : "",
    settings?.tone ? `Toon: ${settings.tone}` : `Toon (standaard niche): ${niche.defaultTone}`,
    settings?.reply_style
      ? `Antwoordstijl: ${settings.reply_style}`
      : `Antwoordstijl (standaard niche): ${niche.defaultReplyStyle}`,
    `Taal output: ${settings?.language || "nl"}`,
    `Typische kwalificatievragen voor deze branche: ${q.join(" | ")}`,
    prefs?.chatbot_company_description
      ? `Bedrijfsomschrijving (chatbot builder): ${prefs.chatbot_company_description}`
      : "",
    prefs?.chatbot_opening_line
      ? `Voorkeur openingszin chatbot: ${prefs.chatbot_opening_line}`
      : "",
    prefs?.chatbot_extra_info
      ? `Extra info uit chatbot builder:\n${prefs.chatbot_extra_info}`
      : "",
    intakeLines,
    settings?.faq?.length
      ? `FAQ:\n${settings.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}`
      : "",
    settings?.knowledge_snippets?.length
      ? `Extra kennisbank:\n${settings.knowledge_snippets
          .map((k) => `${k.title}: ${k.body}`)
          .join("\n")}`
      : "",
    settings?.ai_knowledge_website
      ? `Website (bron voor context): ${settings.ai_knowledge_website}`
      : "",
    settings?.ai_knowledge_document
      ? `Document / vrije kennis voor AI:\n${settings.ai_knowledge_document}`
      : "",
    prefs?.ai_knowledge_crawled_document
      ? `Automatisch gescande website-pagina's:\n${prefs.ai_knowledge_crawled_document}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
