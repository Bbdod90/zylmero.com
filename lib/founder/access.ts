import type { SupabaseClient } from "@supabase/supabase-js";
import { ANONYMOUS_DEMO_USER_ID } from "@/lib/auth/constants";

/**
 * Founder-only internal CRM. Set FOUNDER_USER_IDS (comma-separated UUIDs) and/or
 * insert into founder_access (or visit /dashboard/sales once with env set to auto-bootstrap).
 */
export function getFounderUserIdsFromEnv(): string[] {
  const raw = process.env.FOUNDER_USER_IDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function isFounderUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  if (!userId || userId === ANONYMOUS_DEMO_USER_ID) return false;
  if (getFounderUserIdsFromEnv().includes(userId)) return true;
  const { data } = await supabase
    .from("founder_access")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}
