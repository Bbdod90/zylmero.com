import type { Lead, Message, Quote } from "@/lib/types";

export interface FollowUpRiskView {
  /** Short label for badges */
  tag: string | null;
  /** Longer explanation */
  detail: string;
  /** Whether to emphasize “send follow-up now” */
  sendNow: boolean;
}

/**
 * Heuristic follow-up signals for garage sales workflows (no extra DB fields).
 */
export function describeFollowUpRisk(
  lead: Lead,
  messages: Pick<Message, "role" | "created_at">[],
  quotes: Pick<Quote, "status" | "updated_at" | "created_at">[],
  opts?: { staleReply?: boolean },
): FollowUpRiskView {
  if (opts?.staleReply) {
    return {
      tag: "Antwoord te laat",
      detail:
        "Laatste bericht is van de klant en nog geen teamreactie — antwoord nu voordat ze elders boeken.",
      sendNow: true,
    };
  }

  const last = messages[messages.length - 1];
  const lastUserIdx = [...messages]
    .map((m, i) => (m.role === "user" ? i : -1))
    .filter((i) => i >= 0)
    .pop();
  const lastUser = lastUserIdx != null ? messages[lastUserIdx] : null;
  const hoursSinceUser = lastUser
    ? (Date.now() - new Date(lastUser.created_at).getTime()) / 3600000
    : null;

  if (
    last?.role === "user" &&
    hoursSinceUser != null &&
    hoursSinceUser >= 2 &&
    ["new", "active", "quote_sent"].includes(lead.status)
  ) {
    return {
      tag: "Koelt af",
      detail:
        "Geen uitgaand antwoord na het laatste klantbericht — stuur een korte opvolging met een duidelijke volgende stap.",
      sendNow: hoursSinceUser >= 4,
    };
  }

  const sentQuote = quotes.find((q) => q.status === "sent");
  if (sentQuote && lead.status === "quote_sent") {
    const t = new Date(sentQuote.updated_at || sentQuote.created_at).getTime();
    const h = (Date.now() - t) / 3600000;
    if (h >= 24) {
      return {
        tag: "Offerte wacht",
        detail:
          "Offerte verstuurd maar nog geen beslissing — check in met een vriendelijke duw en bied een kort belletje aan.",
        sendNow: h >= 48,
      };
    }
  }

  const upcoming = lead.status === "appointment_booked";
  if (upcoming) {
    return {
      tag: "Niet-opkomst risico",
      detail:
        "Bevestig de afspraak met kenteken + tijd, en stuur 24u van tevoren een herinnering.",
      sendNow: false,
    };
  }

  return {
    tag: null,
    detail: "Houd vaart met een duidelijke volgende stap (bellen, offerte of boeking).",
    sendNow: false,
  };
}
