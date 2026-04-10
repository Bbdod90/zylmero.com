/**
 * Stripe integration — wire checkout + webhooks here.
 * Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_* (see lib/billing/plans.ts)
 */

export type StripeCheckoutMode = "subscription" | "payment";

export interface CreateCheckoutSessionParams {
  companyId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

/** Placeholder — replace with stripe.checkout.sessions.create */
export async function createCheckoutSessionPlaceholder(
  params: CreateCheckoutSessionParams,
): Promise<{ url: string }> {
  void params;
  throw new Error(
    "Stripe checkout not wired yet — use Upgrade page CTA to contact sales or enable STRIPE_SECRET_KEY.",
  );
}
