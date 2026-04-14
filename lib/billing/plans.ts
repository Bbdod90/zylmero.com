import type { BillingPlanId } from "@/lib/types";

export interface PlanDefinition {
  id: BillingPlanId;
  name: string;
  description: string;
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
    description: "Snel antwoorden, overzicht in aanvragen.",
    priceEur: 79,
    leadCapLabel: "Tot 100 leads / mnd",
    features: [
      "Direct antwoord — minder weglopers",
      "Indicatie wat een lead waard is",
      "Alle aanvragen op één plek",
      "Support via e-mail",
    ],
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  {
    id: "growth",
    name: "Growth",
    description: "Meer volume: sneller naar ja en afspraak.",
    priceEur: 149,
    leadCapLabel: "Tot 500 leads / mnd",
    features: [
      "Alles uit Starter",
      "Sneller offertes afronden",
      "Automatische herinneringen",
      "Prioriteit per e-mail",
    ],
    popular: true,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Teams die maximaal uit elke aanvraag willen halen.",
    priceEur: 299,
    leadCapLabel: "Onbeperkt leads",
    features: [
      "Alles uit Growth",
      "Tone of voice en playbook op maat",
      "Named support (binnenkort)",
      "Voorrang op grootste kansen",
    ],
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
];

export function getPlanById(id: BillingPlanId): PlanDefinition | undefined {
  if (id === "trial") return undefined;
  return BILLING_PLANS.find((p) => p.id === id);
}
