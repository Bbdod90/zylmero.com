import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppNotification, NotificationType } from "@/lib/types";

export async function insertNotificationIfNew(
  supabase: SupabaseClient,
  row: {
    company_id: string;
    type: NotificationType;
    title: string;
    body?: string | null;
    dedupe_key?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  if (row.dedupe_key) {
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("company_id", row.company_id)
      .eq("dedupe_key", row.dedupe_key)
      .maybeSingle();
    if (existing) return;
  }
  await supabase.from("notifications").insert({
    company_id: row.company_id,
    type: row.type,
    title: row.title,
    body: row.body ?? null,
    dedupe_key: row.dedupe_key ?? null,
    metadata: row.metadata ?? {},
  });
}

export function mapNotificationRow(row: Record<string, unknown>): AppNotification {
  return {
    id: row.id as string,
    company_id: row.company_id as string,
    type: row.type as AppNotification["type"],
    title: row.title as string,
    body: (row.body as string) ?? null,
    read_at: (row.read_at as string) ?? null,
    dedupe_key: (row.dedupe_key as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) || {},
    created_at: row.created_at as string,
  };
}
