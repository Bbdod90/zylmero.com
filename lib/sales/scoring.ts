import type { Lead } from "@/lib/types";

export type LeadTemperature = "hot" | "warm" | "cold";

const INTENT_BOOST =
  /prijs|offerte|quote|spoed|asap|vandaag|nu|direct|bellen|whatsapp|apk|rem|schade|lek|motor/i;

/** Composite score for display (0–100) using DB score + intent + contact completeness. */
export function computeDisplayScore(
  lead: Lead,
  opts?: { staleReply?: boolean },
): number {
  let s = lead.score ?? 55;
  const intent = `${lead.intent || ""} ${lead.summary || ""}`.toLowerCase();
  if (INTENT_BOOST.test(intent)) s += 12;
  if (lead.email && lead.phone) s += 6;
  else if (lead.email || lead.phone) s += 3;
  if (lead.estimated_value && lead.estimated_value >= 500) s += 5;
  if (opts?.staleReply) s -= 14;
  return Math.min(100, Math.max(0, Math.round(s)));
}

export function leadTemperature(lead: Lead, displayScore?: number): LeadTemperature {
  const raw = lead.custom_fields?.priority_override;
  if (raw === "hot" || raw === "warm" || raw === "cold") {
    return raw;
  }
  const score = displayScore ?? computeDisplayScore(lead);
  const last = lead.last_message_at
    ? (Date.now() - new Date(lead.last_message_at).getTime()) / 3600000
    : 999;

  if (score >= 78 && last < 36) return "hot";
  if (score >= 60 || last < 72) return "warm";
  return "cold";
}

export function isHighValueLead(lead: Lead, displayScore?: number): boolean {
  const score = displayScore ?? computeDisplayScore(lead);
  return (lead.estimated_value ?? 0) >= 750 || score >= 85;
}
