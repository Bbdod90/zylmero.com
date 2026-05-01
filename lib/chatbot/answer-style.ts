/**
 * Gedeelde logica voor preview + widget: lengte en gedrag uit company_settings,
 * met fallback naar legacy widget-json op chatbots.settings.
 */

export type AnswerLengthKind = "kort" | "normaal" | "uitgebreid";

/** Hoofdbron: automation_preferences.chatbot_answer_length ("short" | "normal"). */
export function resolveAnswerLengthKind(input: {
  widgetSettings: Record<string, unknown>;
  automationPrefs: Record<string, unknown>;
}): AnswerLengthKind {
  const raw = String(input.automationPrefs.chatbot_answer_length ?? "")
    .trim()
    .toLowerCase();
  if (raw === "normal") return "normaal";
  if (raw === "short") return "kort";

  const legacy = String(input.widgetSettings.antwoord_lengte ?? "")
    .trim()
    .toLowerCase();
  if (legacy === "normaal") return "normaal";
  if (legacy === "uitgebreid") return "uitgebreid";
  return "kort";
}

export function lengthInstructionNl(kind: AnswerLengthKind): string {
  if (kind === "uitgebreid") {
    return "Lengte: uitgebreid — maximaal ~8 zinnen als de vraag dat nodig heeft; geen overbodige herhaling.";
  }
  if (kind === "normaal") {
    return "Lengte: normaal — meestal 3–6 zinnen; je mag kort uitleggen en voorbeelden geven als dat de vraag beter beantwoordt.";
  }
  return "Lengte: kort — standaard 1–3 zinnen. Alleen iets langer (max. ~5 zinnen) als de klant expliciet om prijzen, modellen of een vergelijking vraagt; dan mag een beknopte prijsopsomming uit de context.";
}

/** Voorkomt prijslijsten bij levering/reparatie/etc.; caps bepalen extra opties. */
export function relevanceAndCapabilityRulesNl(input: {
  capabilities: unknown;
}): string {
  const coreLines: string[] = [
    "RELEVANTIE (belangrijk):",
    '- Beantwoord alleen wat bij de laatste klantvraag hoort. Geen volledige product- of prijslijst als de vraag daar niet om vraagt (bijv. levering naar een land, reparatie/remmen, contact — dan géén catalogus/prijzen tenzij de klant erom vraagt).',
    '- Voeg alleen prijzen en modellen toe als de klant expliciet naar kosten, prijs, “wat kost”, modellen of assortiment vraagt, of bij “bestellen/kopen”.',
    '- Bij een prijsvraag: gebruik een beknopte opsomming uit de context; bij lengte “kort” maximaal ~4–6 modelregels.',
  ];

  if (!Array.isArray(input.capabilities)) {
    return coreLines.join("\n");
  }

  const caps = input.capabilities.map((x) => String(x).toLowerCase());
  const joined = caps.join(" ");
  const productAdvies = joined.includes("productadvies");
  const faq = joined.includes("faq");
  const doorContact =
    joined.includes("doorzetten") || joined.includes("complexe");
  const alleenOpVerzoek = joined.includes("op verzoek");

  const lines = [...coreLines];

  if (!productAdvies) {
    lines.push(
      "- Productadvies staat uit: geen uitgebreide koopadviezen of upsell; alleen feiten uit context als ze direct de vraag raken.",
    );
  }
  if (!faq) {
    lines.push(
      "- FAQ-modus uit: geen lange algemene FAQ; alleen antwoord op wat gevraagd is.",
    );
  }
  if (!doorContact) {
    lines.push(
      "- Doorschakelen naar contact staat uit: vermijd “bel ons voor alles”; alleen kort doorverwijzen als het zonder context echt niet kan.",
    );
  }
  if (alleenOpVerzoek) {
    lines.push(
      "- Geen offerte- of afspraak-push tenzij de klant daar expliciet om vraagt.",
    );
  }

  return lines.join("\n");
}

export function maxTokensForAnswerKind(kind: AnswerLengthKind): number {
  if (kind === "uitgebreid") return 900;
  if (kind === "normaal") return 620;
  return 380;
}
