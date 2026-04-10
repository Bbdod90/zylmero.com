import type { SupabaseClient } from "@supabase/supabase-js";
import type { Message } from "@/lib/types";

const STALE_HOURS = 4;

export interface SlaAnalysis {
  avgResponseHours: number | null;
  staleReplyLeadIds: Set<string>;
}

/**
 * Estimates reply SLA from messages + flags conversations where the customer
 * spoke last and no staff reply within STALE_HOURS.
 */
export async function analyzeSla(
  supabase: SupabaseClient,
  companyId: string,
): Promise<SlaAnalysis> {
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, lead_id")
    .eq("company_id", companyId);

  const leadByConversation = new Map<string, string>();
  const ids = (convs || []).map((c) => {
    const row = c as { id: string; lead_id: string };
    leadByConversation.set(row.id, row.lead_id);
    return row.id;
  });
  if (!ids.length) {
    return { avgResponseHours: null, staleReplyLeadIds: new Set() };
  }

  const { data: raw } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", ids)
    .order("created_at", { ascending: true });

  const messages = (raw || []) as Message[];
  const byConv = new Map<string, Message[]>();
  for (const m of messages) {
    const list = byConv.get(m.conversation_id) || [];
    list.push(m);
    byConv.set(m.conversation_id, list);
  }

  const deltas: number[] = [];
  const stale = new Set<string>();

  const now = Date.now();

  for (const [convId, list] of Array.from(byConv.entries())) {
    for (let i = 0; i < list.length; i++) {
      const m = list[i]!;
      if (m.role !== "user") continue;
      const nextStaff = list.slice(i + 1).find((x) => x.role === "staff");
      if (nextStaff) {
        const a = new Date(m.created_at).getTime();
        const b = new Date(nextStaff.created_at).getTime();
        deltas.push((b - a) / 3600000);
      }
    }

    const last = list[list.length - 1];
    if (last?.role === "user") {
      const hours = (now - new Date(last.created_at).getTime()) / 3600000;
      if (hours >= STALE_HOURS) {
        const leadId = leadByConversation.get(convId);
        if (leadId) stale.add(leadId);
      }
    }
  }

  const avgResponseHours =
    deltas.length === 0
      ? null
      : Math.round((deltas.reduce((a, b) => a + b, 0) / deltas.length) * 10) /
        10;

  return { avgResponseHours, staleReplyLeadIds: stale };
}
