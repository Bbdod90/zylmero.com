import type { SupabaseClient } from "@supabase/supabase-js";

export async function logTeamActivity(
  supabase: SupabaseClient,
  input: {
    company_id: string;
    user_id: string | null;
    event_type: string;
    entity_type?: string | null;
    entity_id?: string | null;
    meta?: Record<string, unknown>;
  },
): Promise<void> {
  await supabase.from("team_activity").insert({
    company_id: input.company_id,
    user_id: input.user_id,
    event_type: input.event_type,
    entity_type: input.entity_type ?? null,
    entity_id: input.entity_id ?? null,
    meta: input.meta ?? {},
  });
}
