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
    description: "Voor wie sneller wil antwoorden en overzicht wil in aanvragen.",
    priceEur: 79,
    leadCapLabel: "Tot 100 leads / mnd",
    features: [
      "Snel antwoord zodat klanten niet weglopen",
      "Je ziet wat een aanvraag ongeveer oplevert",
      "Alles op één plek, niet verspreid over apps",
      "Hulp via e-mail",
    ],
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  {
    id: "growth",
    name: "Growth",
    description: "Als je veel berichten hebt en meer afspraken wilt uit hetzelfde werk.",
    priceEur: 149,
    leadCapLabel: "Tot 500 leads / mnd",
    features: [
      "Alles uit Starter",
      "Offertes sneller rond krijgen",
      "Automatisch herinneren zodat niets blijft liggen",
      "Sneller antwoord van ons team per e-mail",
    ],
    popular: true,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Voor teams die het grotere werk eerst willen doen en meer uit elke aanvraag willen halen.",
    priceEur: 299,
    leadCapLabel: "Onbeperkt leads",
    features: [
      "Alles uit Growth",
      "Meer uit elke aanvraag, in jouw woorden",
      "Vast aanspreekpunt (binnenkort)",
      "Voorrang bij de grootste kansen",
    ],
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
];

export function getPlanById(id: BillingPlanId): PlanDefinition | undefined {
  if (id === "trial") return undefined;
  return BILLING_PLANS.find((p) => p.id === id);
}
