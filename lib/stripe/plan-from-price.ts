import type { BillingPlanId } from "@/lib/types";

const envPrice = (k: string | undefined) => (k && k.length ? k : null);

export function priceIdToPlanId(priceId: string): BillingPlanId | null {
  const starter = envPrice(process.env.STRIPE_PRICE_STARTER);
  const growth = envPrice(process.env.STRIPE_PRICE_GROWTH);
  const pro = envPrice(process.env.STRIPE_PRICE_PRO);
  if (starter && priceId === starter) return "starter";
  if (growth && priceId === growth) return "growth";
  if (pro && priceId === pro) return "pro";
  return null;
}

export function planIdToPriceId(planId: Exclude<BillingPlanId, "trial">): string | null {
  switch (planId) {
    case "starter":
      return envPrice(process.env.STRIPE_PRICE_STARTER);
    case "growth":
      return envPrice(process.env.STRIPE_PRICE_GROWTH);
    case "pro":
      return envPrice(process.env.STRIPE_PRICE_PRO);
    default:
      return null;
  }
}
