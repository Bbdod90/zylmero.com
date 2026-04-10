import { createAdminClient } from "@/lib/supabase/admin";

export type MarketingDripSource =
  | "signup"
  | "lead_capture"
  | "demo_interest";

const OFFSET_HOURS = [1, 24, 72] as const;
const TEMPLATE_KEYS = ["drip_1h", "drip_1d", "drip_3d"] as const;

/** Plant 3 follow-up e-mails (1 uur, 1 dag, 3 dagen). Vereist service role. */
export async function scheduleMarketingDrip(input: {
  email: string;
  source: MarketingDripSource;
}): Promise<boolean> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) return false;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    console.warn("[scheduleMarketingDrip] SUPABASE_SERVICE_ROLE_KEY ontbreekt");
    return false;
  }

  const now = Date.now();
  const rows = OFFSET_HOURS.map((h, i) => ({
    recipient_email: email,
    template_key: TEMPLATE_KEYS[i],
    campaign_source: input.source,
    scheduled_for: new Date(now + h * 60 * 60 * 1000).toISOString(),
    payload: { source: input.source },
  }));

  const { error } = await admin.from("marketing_email_queue").insert(rows);
  if (error) {
    console.error("[scheduleMarketingDrip]", error.message);
    return false;
  }
  return true;
}
