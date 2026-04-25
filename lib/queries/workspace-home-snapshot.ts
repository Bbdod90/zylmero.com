import type { SupabaseClient } from "@supabase/supabase-js";
import { isDemoCompanyId } from "@/lib/billing/trial";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { countUnreadNotifications } from "@/lib/queries/notifications";

export type HomeRecentMessage = {
  id: string;
  content: string;
  lead_name: string | null;
  created_at: string;
};

export type HomeUpcomingAppointment = {
  id: string;
  starts_at: string;
  label: string;
};

export type WorkspaceHomeSnapshot = {
  leadCount: number;
  conversationCount: number;
  quoteCount: number;
  unreadNotifications: number;
  recentMessages: HomeRecentMessage[];
  upcomingAppointments: HomeUpcomingAppointment[];
};

async function fetchHomeRecentMessages(
  supabase: SupabaseClient,
  companyId: string,
  limit: number,
): Promise<HomeRecentMessage[]> {
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, lead_id")
    .eq("company_id", companyId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(14);

  const convIds = (convs || []).map((c) => (c as { id: string }).id);
  if (!convIds.length) return [];

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, content, created_at, conversation_id")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  type MsgRow = {
    id: string;
    content: string;
    created_at: string;
    conversation_id: string;
  };
  const base = (msgs || []) as MsgRow[];
  const usedConvIds = Array.from(new Set(base.map((m) => m.conversation_id)));
  if (!usedConvIds.length) return [];

  const { data: convLinks } = await supabase
    .from("conversations")
    .select("id, lead_id")
    .in("id", usedConvIds);

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

  return base.map((m) => {
    const lid = leadByConv.get(m.conversation_id);
    const lead_name =
      lid != null ? leadNameById.get(lid) ?? null : null;
    return {
      id: m.id,
      content: m.content,
      created_at: m.created_at,
      lead_name,
    };
  });
}

async function fetchHomeUpcomingAppointments(
  supabase: SupabaseClient,
  companyId: string,
  limit: number,
): Promise<HomeUpcomingAppointment[]> {
  const nowIso = new Date().toISOString();
  const { data: rows } = await supabase
    .from("appointments")
    .select("id, starts_at, notes, lead_id")
    .eq("company_id", companyId)
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(limit);

  const list = rows || [];
  const leadIds = Array.from(
    new Set(
      list
        .map((r) => (r as { lead_id: string | null }).lead_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
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

  return list.map((raw) => {
    const r = raw as {
      id: string;
      starts_at: string;
      notes: string | null;
      lead_id: string | null;
    };
    const name = r.lead_id ? leadNameById.get(r.lead_id) : undefined;
    const notes = r.notes?.trim();
    const label =
      notes && notes.length > 0
        ? notes
        : name
          ? `Met ${name}`
          : "Afspraak";
    return { id: r.id, starts_at: r.starts_at, label };
  });
}

/** Dashboard-startscherm: cijfers + compacte inbox- en agenda-feeds. */
export async function fetchWorkspaceHomeSnapshot(
  supabase: SupabaseClient,
  companyId: string,
): Promise<WorkspaceHomeSnapshot> {
  if (isDemoCompanyId(companyId)) {
    const bundle = getDemoDashboardBundle();
    const now = Date.now();
    const leadName = (id: string | null) =>
      id ? bundle.leads.find((l) => l.id === id)?.full_name : undefined;

    const upcoming = bundle.appointments
      .filter((a) => new Date(a.starts_at).getTime() >= now - 120_000)
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      )
      .slice(0, 4)
      .map((a) => ({
        id: a.id,
        starts_at: a.starts_at,
        label:
          a.notes?.trim() ||
          (leadName(a.lead_id ?? null)
            ? `Met ${leadName(a.lead_id ?? null)}`
            : "Afspraak"),
      }));

    const recentMessages: HomeRecentMessage[] = bundle.recentMessages
      .slice(0, 6)
      .map((m) => ({
        id: m.id,
        content: m.content,
        lead_name: m.lead_name ?? null,
        created_at: m.created_at,
      }));

    return {
      leadCount: 18,
      conversationCount: 6,
      quoteCount: 4,
      unreadNotifications: 2,
      recentMessages,
      upcomingAppointments: upcoming,
    };
  }

  const [
    leads,
    convs,
    quotes,
    unreadNotifications,
    recentMessages,
    upcomingAppointments,
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId),
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId),
    supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId),
    countUnreadNotifications(supabase, companyId),
    fetchHomeRecentMessages(supabase, companyId, 6),
    fetchHomeUpcomingAppointments(supabase, companyId, 4),
  ]);

  return {
    leadCount: leads.count ?? 0,
    conversationCount: convs.count ?? 0,
    quoteCount: quotes.count ?? 0,
    unreadNotifications,
    recentMessages,
    upcomingAppointments,
  };
}
