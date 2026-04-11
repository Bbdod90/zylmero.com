import type { BillingPlanId, Company, SubscriptionStatus } from "@/lib/types";

function asPlan(raw: unknown): BillingPlanId {
  const s = String(raw || "trial");
  if (s === "starter" || s === "growth" || s === "pro" || s === "trial") {
    return s;
  }
  return "trial";
}

function asSubStatus(raw: unknown): SubscriptionStatus | null {
  if (raw == null || raw === "") return null;
  const s = String(raw);
  if (
    s === "trialing" ||
    s === "active" ||
    s === "past_due" ||
    s === "canceled" ||
    s === "unpaid" ||
    s === "incomplete" ||
    s === "incomplete_expired" ||
    s === "paused"
  ) {
    return s;
  }
  return null;
}

export function mapCompanyRow(row: Record<string, unknown>): Company {
  return {
    id: row.id as string,
    name: row.name as string,
    owner_user_id: row.owner_user_id as string,
    onboarding_completed: Boolean(row.onboarding_completed),
    profile_intake_completed:
      row.profile_intake_completed === false ? false : true,
    niche: (row.niche as string) ?? null,
    contact_email: (row.contact_email as string) ?? null,
    contact_phone: (row.contact_phone as string) ?? null,
    trial_starts_at: (row.trial_starts_at as string) ?? null,
    trial_ends_at: (row.trial_ends_at as string) ?? null,
    plan: asPlan(row.plan),
    is_active: row.is_active != null ? Boolean(row.is_active) : true,
    stripe_customer_id: (row.stripe_customer_id as string) ?? null,
    stripe_subscription_id: (row.stripe_subscription_id as string) ?? null,
    subscription_status: asSubStatus(row.subscription_status),
    current_period_end: (row.current_period_end as string) ?? null,
    value_moment_completed_at:
      (row.value_moment_completed_at as string) ?? null,
    referral_code: (row.referral_code as string) ?? null,
    widget_embed_token: (row.widget_embed_token as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
