import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FounderSalesProspect,
  FounderSalesReminder,
  FounderSalesSettings,
  FounderSalesStats,
} from "@/lib/types";

function mapProspect(row: Record<string, unknown>): FounderSalesProspect {
  return {
    id: String(row.id),
    business_name: String(row.business_name ?? ""),
    contact_name: (row.contact_name as string) ?? null,
    channel: row.channel as FounderSalesProspect["channel"],
    status: row.status as FounderSalesProspect["status"],
    last_contact_at: (row.last_contact_at as string) ?? null,
    next_follow_up_at: (row.next_follow_up_at as string) ?? null,
    notes: (row.notes as string) ?? null,
    last_outbound_at: (row.last_outbound_at as string) ?? null,
    first_reply_at: (row.first_reply_at as string) ?? null,
    instagram_handle: (row.instagram_handle as string) ?? null,
    contact_email: (row.contact_email as string) ?? null,
    whatsapp_e164: (row.whatsapp_e164 as string) ?? null,
    messages_sent_count: Number(row.messages_sent_count ?? 0),
    replies_received_count: Number(row.replies_received_count ?? 0),
    demos_sent_count: Number(row.demos_sent_count ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function mapSettings(row: Record<string, unknown>): FounderSalesSettings {
  return {
    id: String(row.id),
    daily_contact_goal: Number(row.daily_contact_goal ?? 20),
    contacts_completed_today: Number(row.contacts_completed_today ?? 0),
    goal_date: String(row.goal_date ?? "").slice(0, 10),
    updated_at: String(row.updated_at ?? ""),
  };
}

export function computeFounderStats(
  prospects: FounderSalesProspect[],
): FounderSalesStats {
  let messagesSent = 0;
  let replies = 0;
  let demos = 0;
  let closed = 0;
  let lost = 0;
  for (const p of prospects) {
    messagesSent += p.messages_sent_count;
    replies += p.replies_received_count;
    demos += p.demos_sent_count;
    if (p.status === "closed") closed += 1;
    if (p.status === "lost") lost += 1;
  }
  const total = prospects.length;
  const conversionRate = total === 0 ? 0 : closed / total;
  const denom = closed + lost;
  const winRate = denom === 0 ? 0 : closed / denom;
  return {
    messagesSent,
    replies,
    demos,
    closed,
    lost,
    total,
    conversionRate,
    winRate,
  };
}

export function buildFounderReminders(
  prospects: FounderSalesProspect[],
): FounderSalesReminder[] {
  const out: FounderSalesReminder[] = [];
  const now = Date.now();
  const startToday = new Date();
  startToday.setUTCHours(0, 0, 0, 0);

  for (const p of prospects) {
    if (p.status === "closed" || p.status === "lost") continue;

    if (p.next_follow_up_at) {
      const d = new Date(p.next_follow_up_at);
      d.setUTCHours(0, 0, 0, 0);
      if (d.getTime() <= startToday.getTime()) {
        out.push({
          id: p.id,
          business_name: p.business_name,
          kind: "follow_up_today",
        });
      }
    }

    if (
      p.status === "contacted" &&
      p.last_outbound_at &&
      !p.first_reply_at
    ) {
      const hours =
        (now - new Date(p.last_outbound_at).getTime()) / 3_600_000;
      if (hours >= 24) {
        out.push({
          id: p.id,
          business_name: p.business_name,
          kind: "no_response_24h",
        });
      }
    }
  }
  return out;
}

export function pipelineCounts(prospects: FounderSalesProspect[]) {
  let contacted = 0;
  let replied = 0;
  let demo = 0;
  let closed = 0;
  for (const p of prospects) {
    if (p.status === "contacted") contacted += 1;
    else if (p.status === "replied" || p.status === "interested") replied += 1;
    else if (p.status === "demo_sent") demo += 1;
    else if (p.status === "closed") closed += 1;
  }
  return { contacted, replied, demo, closed };
}

export async function fetchFounderSalesBundle(
  supabase: SupabaseClient,
): Promise<{
  prospects: FounderSalesProspect[];
  settings: FounderSalesSettings;
  reminders: FounderSalesReminder[];
  stats: FounderSalesStats;
  pipeline: ReturnType<typeof pipelineCounts>;
}> {
  const { data: prospectsRows, error: pe } = await supabase
    .from("founder_sales_prospects")
    .select("*")
    .order("next_follow_up_at", { ascending: true, nullsFirst: false });

  if (pe) throw pe;

  const prospects = (prospectsRows ?? []).map((r) =>
    mapProspect(r as Record<string, unknown>),
  );

  const { data: settingsRows } = await supabase
    .from("founder_sales_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  const todayUtc = new Date().toISOString().slice(0, 10);
  let settings: FounderSalesSettings;

  if (!settingsRows) {
    const { data: inserted, error: insErr } = await supabase
      .from("founder_sales_settings")
      .insert({
        daily_contact_goal: 20,
        contacts_completed_today: 0,
        goal_date: todayUtc,
      })
      .select("*")
      .single();
    if (insErr) throw insErr;
    settings = mapSettings(inserted as Record<string, unknown>);
  } else {
    settings = mapSettings(settingsRows as Record<string, unknown>);
    if (settings.goal_date !== todayUtc) {
      const { data: upd, error: uErr } = await supabase
        .from("founder_sales_settings")
        .update({
          contacts_completed_today: 0,
          goal_date: todayUtc,
        })
        .eq("id", settings.id)
        .select("*")
        .single();
      if (!uErr && upd) {
        settings = mapSettings(upd as Record<string, unknown>);
      }
    }
  }

  const reminders = buildFounderReminders(prospects);
  const stats = computeFounderStats(prospects);
  const pipeline = pipelineCounts(prospects);

  return { prospects, settings, reminders, stats, pipeline };
}

export async function fetchFounderRemindersOnly(
  supabase: SupabaseClient,
): Promise<FounderSalesReminder[]> {
  const { data, error } = await supabase
    .from("founder_sales_prospects")
    .select("*");

  if (error || !data) return [];
  const prospects = data.map((r) =>
    mapProspect(r as Record<string, unknown>),
  );
  return buildFounderReminders(prospects);
}
