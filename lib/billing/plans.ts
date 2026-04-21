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
    description: "Voor zzp en micro-bedrijven: overzicht en snelle reacties.",
    audience: "Echt klein: jij bent de inbox — hier krijg je rust en tempo naar de eerste reactie.",
    priceEur: 79,
    leadCapLabel: "Tot 100 leads / mnd",
    features: [
      "Eén plek voor aanvragen — minder zoeken, minder missers",
      "Sneller eerste antwoord zonder de hele dag online te zijn",
      "Later uitbreiden met website-widget en automatisering",
      "E-mailsupport",
    ],
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  {
    id: "growth",
    name: "Growth",
    description: "Voor een klein team met meer aanvragen.",
    audience: "2–10 mensen met groeiend volume — denk salon, garage, monteur, praktijk, ambacht.",
    priceEur: 149,
    leadCapLabel: "Tot 500 leads / mnd",
    features: [
      "Alles uit Starter — meer uit dezelfde stroom aanvragen",
      "Ruimte voor website-widget en slimme opvolging",
      "Minder leads die stilletjes verdwijnen",
      "Snellere support bij groeiende drukte",
    ],
    popular: true,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Maximale controle voor een klein bedrijf dat groot wil blijven voelen.",
    audience: "Aanvragen zijn je hoofdzaak — je wilt grip en maatwerk zonder enterprise-gedoe.",
    priceEur: 299,
    leadCapLabel: "Onbeperkt leads",
    features: [
      "Alles uit Growth — maximale ruimte voor modules en maatwerk",
      "Prioriteit bij vragen en grotere kansen",
      "Geschikt als Zylmero je centrale klantmotor wordt",
      "Named support waar beschikbaar",
    ],
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
];

export function getPlanById(id: BillingPlanId): PlanDefinition | undefined {
  if (id === "trial") return undefined;
  return BILLING_PLANS.find((p) => p.id === id);
}
