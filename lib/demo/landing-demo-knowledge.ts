import type { NicheDefinition } from "@/lib/niches";

/**
 * Vaste demo-kennis voor /api/ai (homepage-chat): alles wat de gebruiker "aan de AI levert"
 * via niche-config — het model moet hierop kunnen antwoorden zonder tegenstrijdige hallucinaties.
 */
export function formatLandingDemoKnowledgeBlock(cfg: NicheDefinition): string {
  const services =
    cfg.defaultServices.length > 0
      ? cfg.defaultServices.map((s) => `• ${s}`).join("\n")
      : "• Vraag gerust wat we voor je kunnen doen — we kwalificeren kort je aanvraag.";
  const faq = cfg.defaultFaqTemplate.trim() || "(Geen apart FAQ-blok in config — gebruik algemene intake.)";
  const chunks: string[] = [
    `Zaaktype: ${cfg.label}`,
    `Omschrijving: ${cfg.description}`,
    `Diensten / werkzaamheden (dit bied je aan):\n${services}`,
    `Tarief- en prijsindicaties (richting; definitief na inspectie/bezoek waar van toepassing): ${cfg.defaultPricingHints}`,
    `FAQ / veelgestelde vragen (template — gebruik deze antwoorden als de klant iets vergelijks vraagt):\n${faq}`,
    `Werkwijze & context: ${cfg.ai.contextExtra || "(standaard lokale service.)"}`,
    `Rol in communicatie: ${cfg.ai.replySystemPersona}`,
    `Voorbeeld intake-vragen: ${cfg.ai.qualifyingQuestions.join(" · ")}`,
    `Toon: ${cfg.defaultTone}`,
    `Stijl: ${cfg.defaultReplyStyle}`,
  ];
  if (cfg.ai.landingVakKennis?.trim()) {
    chunks.push(
      `VAKKENNIS (gebruik dit voor inhoudelijke antwoorden — zoals ChatGPT dat zou doen binnen dit vak; varieer formulering, geen vaste standaardparagraph):\n${cfg.ai.landingVakKennis.trim()}`,
    );
  }
  return chunks.join("\n\n");
}
