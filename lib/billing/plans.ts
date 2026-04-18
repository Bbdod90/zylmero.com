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
    description: "Rust in je inbox en sneller eerste antwoord — zonder extra gedoe.",
    audience: "Zzp en kleine eenmanszaken die vooral structuur en snelheid willen.",
    priceEur: 79,
    leadCapLabel: "Tot 100 leads / mnd",
    features: [
      "Minder gemiste aanvragen door overzicht op één plek",
      "Sneller reageren zonder de hele dag online te zijn",
      "Zien wat nog wacht — minder vergeten opvolging",
      "E-mailsupport bij vragen",
    ],
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  {
    id: "growth",
    name: "Growth",
    description: "Meer volume eruit halen: sneller naar ja, afspraak en opvolging.",
    audience: "Kleine teams met meer aanvragen — salon, garage, monteur, praktijk.",
    priceEur: 149,
    leadCapLabel: "Tot 500 leads / mnd",
    features: [
      "Alles uit Starter",
      "Meer afspraken uit dezelfde stroom leads",
      "Herinneringen zodat niemand tussen wal en schip valt",
      "Snellere support bij groeiende drukte",
    ],
    popular: true,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Maximale grip en maatwerk — als aanvragen je hoofdzaak zijn.",
    audience: "Ondernemers die het onderste uit de kan willen en extra begeleiding zoeken.",
    priceEur: 299,
    leadCapLabel: "Onbeperkt leads",
    features: [
      "Alles uit Growth",
      "Playbook en toon afgestemd op jouw zaak",
      "Prioriteit bij vragen en grotere kansen",
      "Named support waar beschikbaar",
    ],
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
];

export function getPlanById(id: BillingPlanId): PlanDefinition | undefined {
  if (id === "trial") return undefined;
  return BILLING_PLANS.find((p) => p.id === id);
}
