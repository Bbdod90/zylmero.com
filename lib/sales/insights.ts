import type { Lead } from "@/lib/types";
import { computeDisplayScore, leadTemperature } from "@/lib/sales/scoring";

export interface ConversionInsight {
  why: string;
  missing: string;
  next: string;
  urgency: "high" | "medium" | "low";
}

export function buildConversionInsight(
  lead: Lead,
  opts?: { staleReply?: boolean },
): ConversionInsight {
  const score = computeDisplayScore(lead, opts);
  const temp = leadTemperature(lead, score);
  const hours = lead.last_message_at
    ? (Date.now() - new Date(lead.last_message_at).getTime()) / 3600000
    : null;

  const why =
    temp === "hot"
      ? "Hoge intentie en recente activiteit — deze persoon staat dicht bij een beslissing."
      : temp === "warm"
        ? "Goede interesse; er is een duidelijke volgende stap nodig om niet af te koelen."
        : "Lage urgentie — pak opnieuw contact op voordat ze bij een concurrent kiezen.";

  const missingParts: string[] = [];
  if (!lead.phone) missingParts.push("telefoonnummer");
  if (!lead.email) missingParts.push("e-mail");
  if (!lead.intent && !lead.summary) missingParts.push("duidelijke servicewens");
  const missing =
    missingParts.length === 0
      ? "Niets kritisch — focus op de volgende stap richting closing."
      : `Nog nodig: ${missingParts.join(", ")}.`;

  let next =
    lead.status === "new" || lead.status === "active"
      ? "Plan een korte afspraak of stuur een offerte met 2 duidelijke opties."
      : lead.status === "quote_sent"
        ? "Check of ze de offerte hebben ontvangen en bied een kort belletje van 10 minuten aan."
        : lead.status === "appointment_booked"
          ? "Stuur een bevestiging + verminder no-show met een herinnering."
          : "Houd de relatie warm voor doorverwijzingen.";

  if (hours != null && hours > 12 && ["new", "active"].includes(lead.status)) {
    next = "Antwoord binnen een uur — snelheid wint in deze fase.";
  }

  if (opts?.staleReply) {
    next =
      "Klant wacht — antwoord nu of je verliest deze aanvraag aan een snellere concurrent.";
  }

  const urgency: ConversionInsight["urgency"] =
    opts?.staleReply ||
    temp === "hot" ||
    (hours != null && hours > 24 && lead.status !== "won")
      ? "high"
      : temp === "warm"
        ? "medium"
        : "low";

  return { why, missing, next, urgency };
}
