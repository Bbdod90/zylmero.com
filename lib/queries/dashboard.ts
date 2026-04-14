import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Appointment,
  Conversation,
  Lead,
  Message,
  Quote,
} from "@/lib/types";
import { fetchLeadRow } from "@/lib/queries/mappers";

export interface DashboardBundle {
  leads: Lead[];
  conversations: (Conversation & { lead: Lead; preview?: string })[];
  quotes: Quote[];
  appointments: Appointment[];
  recentMessages: (Message & { lead_name?: string | null })[];
}

export async function fetchDashboardBundle(
  supabase: SupabaseClient,
  companyId: string,
): Promise<DashboardBundle> {
  const [{ data: leads }, { data: convs }, { data: quotes }, { data: apts }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .eq("company_id", companyId)
        .order("last_message_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("conversations")
        .select("*")
        .eq("company_id", companyId)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(20),
      supabase
        .from("quotes")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("appointments")
        .select("*")
        .eq("company_id", companyId)
        .order("starts_at", { ascending: true })
        .limit(120),
    ]);

  const leadRows = (leads || []).map((r) =>
    fetchLeadRow(r as Record<string, unknown>),
  );
  const leadMap = new Map(leadRows.map((l) => [l.id, l]));

  const convIds = (convs || []).map((c) => (c as { id: string }).id);
  const previewByConv = new Map<string, string>();
  if (convIds.length) {
    const { data: previews } = await supabase.rpc(
      "last_message_preview_for_conversations",
      { p_ids: convIds },
    );
    for (const row of previews || []) {
      const r = row as { conversation_id: string; content: string };
      previewByConv.set(r.conversation_id, r.content);
    }
  }

  const conversations: DashboardBundle["conversations"] = [];
  for (const raw of convs || []) {
    const c = raw as Record<string, unknown>;
    const lead = leadMap.get(c.lead_id as string);
    if (!lead) continue;
    const preview = previewByConv.get(c.id as string);
    conversations.push({
      id: c.id as string,
      company_id: c.company_id as string,
      lead_id: c.lead_id as string,
      channel: (c.channel as string) || "inbox",
      title: (c.title as string) ?? null,
      last_message_at: (c.last_message_at as string) ?? null,
      created_at: c.created_at as string,
      updated_at: c.updated_at as string,
      lead,
      preview: preview?.slice(0, 140),
    });
  }

  const convIdsForRecent = (convs || []).map((c) => (c as { id: string }).id);
  let recentMessages: DashboardBundle["recentMessages"] = [];
  if (convIdsForRecent.length) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", convIdsForRecent)
      .order("created_at", { ascending: false })
      .limit(15);
    const base = (msgs || []) as Message[];
    const convIds = Array.from(
      new Set(base.map((m) => m.conversation_id)),
    );
    if (convIds.length) {
      const { data: convLinks } = await supabase
        .from("conversations")
        .select("id, lead_id")
        .in("id", convIds);
      const leadByConv = new Map<string, string | null>();
      for (const row of convLinks || []) {
        const r = row as { id: string; lead_id: string | null };
        leadByConv.set(r.id, r.lead_id);
      }
      const leadIds = Array.from(
        new Set(
          Array.from(leadByConv.values()).filter(
            (id): id is string => typeof id === "string" && id.length > 0,
          ),
        ),
      );
      const leadNameById = new Map<string, string>();
      if (leadIds.length) {
        const { data: names } = await supabase
          .from("leads")
          .select("id, full_name")
          .in("id", leadIds);
        for (const row of names || []) {
          const r = row as { id: string; full_name: string };
          leadNameById.set(r.id, r.full_name);
        }
      }
      recentMessages = base.map((m) => {
        const lid = leadByConv.get(m.conversation_id);
        const lead_name =
          lid != null ? leadNameById.get(lid) ?? null : null;
        return { ...m, lead_name };
      });
    } else {
      recentMessages = base;
    }
  }

  return {
    leads: leadRows,
    conversations,
    quotes: (quotes || []) as Quote[],
    appointments: (apts || []) as Appointment[],
    recentMessages,
  };
}
