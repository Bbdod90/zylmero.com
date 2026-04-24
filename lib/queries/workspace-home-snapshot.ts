import type { SupabaseClient } from "@supabase/supabase-js";
import { isDemoCompanyId } from "@/lib/billing/trial";
import { countUnreadNotifications } from "@/lib/queries/notifications";

export type WorkspaceHomeSnapshot = {
  leadCount: number;
  conversationCount: number;
  quoteCount: number;
  unreadNotifications: number;
};

/** Lichtgewicht cijfers voor het dashboard-startscherm (één round-trip). */
export async function fetchWorkspaceHomeSnapshot(
  supabase: SupabaseClient,
  companyId: string,
): Promise<WorkspaceHomeSnapshot> {
  if (isDemoCompanyId(companyId)) {
    return {
      leadCount: 18,
      conversationCount: 6,
      quoteCount: 4,
      unreadNotifications: 2,
    };
  }

  const [leads, convs, quotes, unreadNotifications] = await Promise.all([
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
  ]);

  return {
    leadCount: leads.count ?? 0,
    conversationCount: convs.count ?? 0,
    quoteCount: quotes.count ?? 0,
    unreadNotifications,
  };
}
