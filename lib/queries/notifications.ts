import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppNotification } from "@/lib/types";
import { mapNotificationRow } from "@/lib/notifications/create";

export async function fetchNotificationsForCompany(
  supabase: SupabaseClient,
  companyId: string,
  limit = 30,
): Promise<AppNotification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []).map((r) =>
    mapNotificationRow(r as Record<string, unknown>),
  );
}

export async function countUnreadNotifications(
  supabase: SupabaseClient,
  companyId: string,
): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .is("read_at", null);
  return count ?? 0;
}
