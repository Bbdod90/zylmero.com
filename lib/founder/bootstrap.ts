import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getFounderUserIdsFromEnv } from "@/lib/founder/access";

/**
 * Inserts founder_access for env-listed user IDs (service role). Safe: only IDs in FOUNDER_USER_IDS.
 */
export async function ensureFounderAccess(userId: string): Promise<void> {
  if (!getFounderUserIdsFromEnv().includes(userId)) return;
  try {
    const admin = createAdminClient();
    await admin.from("founder_access").upsert(
      { user_id: userId },
      { onConflict: "user_id" },
    );
  } catch {
    /* missing service key in dev — founder can insert via SQL */
  }
}
