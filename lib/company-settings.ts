import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompanySettings } from "@/lib/types";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";

export async function getCompanySettings(
  supabase: SupabaseClient,
  companyId: string,
): Promise<CompanySettings | null> {
  const { data } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();
  return mapCompanySettingsRow(data as Record<string, unknown> | null);
}
