import type { BillingPlanId } from "@/lib/types";

/** Max website-embed chatbots per company — uitbreidbaar per plan. */
export function maxEmbeddedChatbotsForPlan(plan: BillingPlanId): number {
  switch (plan) {
    case "pro":
      return 25;
    case "growth":
      return 5;
    case "starter":
    case "trial":
      return 2;
    default:
      return 2;
  }
}
