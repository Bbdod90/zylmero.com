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
    description: "Voor zzp en kleine instroom.",
    audience: "Eerste stroom aanvragen onder controle.",
    priceEur: 29,
    leadCapLabel: "Tot 100 leads / mnd",
    features: ["Voor zzp en kleine instroom", "Directe reacties", "Basis leadoverzicht"],
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  {
    id: "growth",
    name: "Pro",
    description: "Voor groeiende bedrijven.",
    audience: "Team met groeiend aantal aanvragen.",
    priceEur: 49,
    leadCapLabel: "Tot 500 leads / mnd",
    features: ["Voor groeiende bedrijven", "Alles in Starter", "Opvolging en meer capaciteit"],
    popular: true,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
  },
  {
    id: "pro",
    name: "Business",
    description: "Voor meer volume.",
    audience: "Aanvragen zijn je motor.",
    priceEur: 79,
    leadCapLabel: "Onbeperkt leads",
    features: ["Voor meer volume", "Alles in Pro", "Volledige ruimte en prioriteit"],
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
];

export function getPlanById(id: BillingPlanId): PlanDefinition | undefined {
  if (id === "trial") return undefined;
  return BILLING_PLANS.find((p) => p.id === id);
}
