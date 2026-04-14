import type { SupabaseClient } from "@supabase/supabase-js";
import type { Quote } from "@/lib/types";
import { parseQuoteRow } from "@/lib/quotes/parse-quote";

/** Alle offertes voor het bedrijf (geen kunstmatige limiet zoals in het dashboard-bundle). */
export async function fetchQuotesForCompany(
  supabase: SupabaseClient,
  companyId: string,
): Promise<Quote[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("fetchQuotesForCompany", error.message);
    return [];
  }

  return (data || []).map((r) =>
    parseQuoteRow(r as Record<string, unknown>),
  );
}
