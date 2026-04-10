import type { SupabaseClient } from "@supabase/supabase-js";

/** Call after a successful AI operation (reply, summary, quote draft, etc.). */
export async function incrementAiUsage(
  supabase: SupabaseClient,
  companyId: string,
): Promise<void> {
  const { data } = await supabase
    .from("company_settings")
    .select("ai_usage_count")
    .eq("company_id", companyId)
    .maybeSingle();
  const n = typeof data?.ai_usage_count === "number" ? data.ai_usage_count : 0;
  await supabase
    .from("company_settings")
    .update({ ai_usage_count: n + 1 })
    .eq("company_id", companyId);
}
