import type { SupabaseClient } from "@supabase/supabase-js";

export interface RevenueMetrics {
  /** Sum of accepted quote totals (EUR) */
  wonRevenueEur: number;
  acceptedQuotes: number;
  /** Month key YYYY-MM -> total */
  byMonth: Record<string, number>;
}

export async function fetchRevenueMetrics(
  supabase: SupabaseClient,
  companyId: string,
): Promise<RevenueMetrics> {
  const { data: quotes } = await supabase
    .from("quotes")
    .select("total, status, updated_at")
    .eq("company_id", companyId)
    .eq("status", "accepted");

  let wonRevenueEur = 0;
  const byMonth: Record<string, number> = {};
  for (const q of quotes || []) {
    const t = Number(q.total) || 0;
    wonRevenueEur += t;
    const d = new Date(q.updated_at as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = (byMonth[key] || 0) + t;
  }

  return {
    wonRevenueEur,
    acceptedQuotes: quotes?.length ?? 0,
    byMonth,
  };
}
