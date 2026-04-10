import type { SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, Lead, Message } from "@/lib/types";
import { fetchLeadRow } from "@/lib/queries/mappers";

function mapMessageRow(raw: Record<string, unknown>): Message {
  return {
    id: raw.id as string,
    conversation_id: raw.conversation_id as string,
    role: raw.role as Message["role"],
    content: (raw.content as string) ?? "",
    channel:
      typeof raw.channel === "string" && raw.channel
        ? raw.channel
        : null,
    created_at: raw.created_at as string,
  };
}

export interface InboxThread {
  conversation: Conversation;
  lead: Lead;
  messages: Message[];
  preview: string;
  lastAt: string;
}

export async function fetchInboxThreads(
  supabase: SupabaseClient,
  companyId: string,
): Promise<InboxThread[]> {
  const { data: convs } = await supabase
    .from("conversations")
    .select("*")
    .eq("company_id", companyId)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const out: InboxThread[] = [];
  for (const raw of convs || []) {
    const c = raw as Record<string, unknown>;
    const { data: leadRow } = await supabase
      .from("leads")
      .select("*")
      .eq("id", c.lead_id as string)
      .single();
    if (!leadRow) continue;

    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", c.id as string)
      .order("created_at", { ascending: true });

    const list = (msgs || []).map((m) =>
      mapMessageRow(m as Record<string, unknown>),
    );
    const last = list[list.length - 1];
    out.push({
      conversation: {
        id: c.id as string,
        company_id: c.company_id as string,
        lead_id: c.lead_id as string,
        channel: (c.channel as string) || "inbox",
        title: (c.title as string) ?? null,
        last_message_at: (c.last_message_at as string) ?? null,
        created_at: c.created_at as string,
        updated_at: c.updated_at as string,
      },
      lead: fetchLeadRow(leadRow as Record<string, unknown>),
      messages: list,
      preview: last?.content?.slice(0, 160) || "",
      lastAt: last?.created_at || (c.created_at as string),
    });
  }
  return out;
}
