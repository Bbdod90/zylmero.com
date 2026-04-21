import type { BillingPlanId } from "@/lib/types";

export interface PlanDefinition {
  id: BillingPlanId;
  name: string;
  /** Korte pitch op de landingspagina */
  description: string;
  /** Voor wie dit pakket bedoeld is (landingspagina) */
  audience: string;
  priceEur: number;
  leadCapLabel: string;
  features: string[];
  popular?: boolean;
  stripePriceId?: string;
}

export const BILLING_PLANS: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Start klein. Alles op één plek.",
    audience: "Eerste stroom aanvragen onder controle.",
    priceEur: 29,
    leadCapLabel: "Tot 100 leads / mnd",
    features: ["Kanalen gekoppeld", "Directe reacties", "Leadoverzicht"],
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  {
    id: "growth",
    name: "Pro",
    description: "Meer volume. Sneller groeien.",
    audience: "Team met groeiend aantal aanvragen.",
    priceEur: 49,
    leadCapLabel: "Tot 500 leads / mnd",
    features: ["Alles in Starter", "Widget & opvolging", "Meer capaciteit"],
    popular: true,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
  },
  {
    id: "pro",
    name: "Business",
    description: "Maximaal tempo. Geen plafond.",
    audience: "Aanvragen zijn je motor.",
    priceEur: 79,
    leadCapLabel: "Onbeperkt leads",
    features: ["Alles in Pro", "Prioriteit support", "Volledige ruimte"],
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
];

export function getPlanById(id: BillingPlanId): PlanDefinition | undefined {
  if (id === "trial") return undefined;
  return BILLING_PLANS.find((p) => p.id === id);
}
