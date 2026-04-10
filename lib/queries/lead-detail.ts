import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Appointment,
  Conversation,
  Lead,
  Message,
  Quote,
} from "@/lib/types";
import { fetchLeadRow } from "@/lib/queries/mappers";

export interface LeadDetailPayload {
  lead: Lead;
  conversation: Conversation | null;
  messages: Message[];
  quotes: Quote[];
  appointments: Appointment[];
}

export async function fetchLeadDetail(
  supabase: SupabaseClient,
  companyId: string,
  leadId: string,
): Promise<LeadDetailPayload | null> {
  const { data: leadRow, error: le } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (le || !leadRow) return null;

  const { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let messages: Message[] = [];
  if (conv) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    messages = (msgs || []) as Message[];
  }

  const [{ data: quoteRows }, { data: apptRows }] = await Promise.all([
    supabase
      .from("quotes")
      .select("*")
      .eq("company_id", companyId)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false }),
    supabase
      .from("appointments")
      .select("*")
      .eq("company_id", companyId)
      .eq("lead_id", leadId)
      .order("starts_at", { ascending: true }),
  ]);

  return {
    lead: fetchLeadRow(leadRow as Record<string, unknown>),
    conversation: conv ? (conv as Conversation) : null,
    messages,
    quotes: (quoteRows || []) as Quote[],
    appointments: (apptRows || []) as Appointment[],
  };
}
