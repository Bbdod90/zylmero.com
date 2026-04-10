import type { SupabaseClient } from "@supabase/supabase-js";

export interface TeamPerformanceSnapshot {
  avgResponseMinutes: number | null;
  leadsHandled: number;
  dealsClosed: number;
  periodLabel: string;
}

export async function fetchTeamPerformance(
  supabase: SupabaseClient,
  companyId: string,
): Promise<TeamPerformanceSnapshot> {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { data: rows } = await supabase
    .from("team_activity")
    .select("event_type, meta, created_at")
    .eq("company_id", companyId)
    .gte("created_at", since);

  let totalMs = 0;
  let nResp = 0;
  let leadsHandled = 0;
  let dealsClosed = 0;

  for (const r of rows || []) {
    const ev = (r as { event_type: string; meta?: Record<string, unknown> })
      .event_type;
    const meta = (r as { meta?: Record<string, unknown> }).meta || {};
    if (ev === "first_reply" && typeof meta.response_ms === "number") {
      totalMs += meta.response_ms;
      nResp += 1;
    }
    if (ev === "lead_touched" || ev === "lead_status_changed") {
      leadsHandled += 1;
    }
    if (ev === "deal_won") {
      dealsClosed += 1;
    }
  }

  const avgResponseMinutes =
    nResp > 0 ? Math.round(totalMs / nResp / 60000) : null;

  return {
    avgResponseMinutes,
    leadsHandled,
    dealsClosed,
    periodLabel: "Laatste 30 dagen",
  };
}
