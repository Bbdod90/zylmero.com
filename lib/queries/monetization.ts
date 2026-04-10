import type { SupabaseClient } from "@supabase/supabase-js";

export type UpgradeNudgeReason = "leads" | "quotes" | "ai";

export interface UpgradeNudgeSignals {
  leadCount: number;
  quoteCount: number;
  aiUsage: number;
  /** Trial users who hit product thresholds */
  shouldNudge: boolean;
  /** Welke drempel eerst geldt (voor copy in modal) */
  nudgeReason: UpgradeNudgeReason | null;
}

export async function getUpgradeNudgeSignals(
  supabase: SupabaseClient,
  companyId: string,
): Promise<UpgradeNudgeSignals> {
  const [{ count: leadCount }, { count: quoteCount }, { data: settings }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId),
      supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId),
      supabase
        .from("company_settings")
        .select("ai_usage_count")
        .eq("company_id", companyId)
        .maybeSingle(),
    ]);

  const lc = leadCount ?? 0;
  const qc = quoteCount ?? 0;
  const aiUsage =
    typeof settings?.ai_usage_count === "number" ? settings.ai_usage_count : 0;

  const shouldNudge = lc >= 3 || qc >= 1 || aiUsage >= 5;

  let nudgeReason: UpgradeNudgeReason | null = null;
  if (shouldNudge) {
    if (lc >= 3) nudgeReason = "leads";
    else if (qc >= 1) nudgeReason = "quotes";
    else if (aiUsage >= 5) nudgeReason = "ai";
  }

  return {
    leadCount: lc,
    quoteCount: qc,
    aiUsage,
    shouldNudge,
    nudgeReason,
  };
}
