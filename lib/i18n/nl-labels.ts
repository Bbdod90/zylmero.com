import type { QuoteStatus } from "@/lib/types";

export function quoteStatusNl(status: QuoteStatus): string {
  const m: Record<QuoteStatus, string> = {
    draft: "Concept",
    sent: "Verstuurd",
    accepted: "Geaccepteerd",
    declined: "Afgewezen",
  };
  return m[status];
}

/** Toont vriendelijke NL-labels voor afspraakstatus uit de database. */
export function appointmentStatusNl(status: string): string {
  const k = status.trim().toLowerCase();
  const map: Record<string, string> = {
    planned: "Gepland",
    scheduled: "Gepland",
    confirmed: "Bevestigd",
    completed: "Afgerond",
    done: "Afgerond",
    cancelled: "Geannuleerd",
    canceled: "Geannuleerd",
  };
  return map[k] ?? status;
}
