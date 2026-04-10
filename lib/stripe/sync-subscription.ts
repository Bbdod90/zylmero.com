import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BillingPlanId, SubscriptionStatus } from "@/lib/types";
import { priceIdToPlanId } from "@/lib/stripe/plan-from-price";

function firstItemPriceId(sub: Stripe.Subscription): string | null {
  const item = sub.items.data[0];
  return item?.price?.id ?? null;
}

function planFromSubscription(sub: Stripe.Subscription): BillingPlanId | null {
  const meta = sub.metadata?.plan_id;
  if (
    meta === "starter" ||
    meta === "growth" ||
    meta === "pro"
  ) {
    return meta;
  }
  const priceId = firstItemPriceId(sub);
  if (!priceId) return null;
  return priceIdToPlanId(priceId);
}

function asSubStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (
    status === "trialing" ||
    status === "active" ||
    status === "past_due" ||
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete" ||
    status === "incomplete_expired" ||
    status === "paused"
  ) {
    return status;
  }
  return "canceled";
}

export async function upsertCompanyFromStripeSubscription(
  admin: SupabaseClient,
  companyId: string,
  sub: Stripe.Subscription,
  stripeCustomerId: string,
): Promise<void> {
  const plan = planFromSubscription(sub);
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  const patch: Record<string, unknown> = {
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: sub.id,
    subscription_status: asSubStatus(sub.status),
    current_period_end: periodEnd,
  };
  if (plan) {
    patch.plan = plan;
  }
  const blocked =
    sub.status === "canceled" ||
    sub.status === "unpaid" ||
    sub.status === "paused" ||
    sub.status === "incomplete_expired";
  patch.is_active = !blocked;

  const { error } = await admin
    .from("companies")
    .update(patch)
    .eq("id", companyId);
  if (error) throw new Error(error.message);
}
