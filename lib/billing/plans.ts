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
    description: "Voor overzicht en snelle reacties.",
    audience: "Zzp en kleine zaak: vooral rust in de inbox en tempo naar de eerste reactie.",
    priceEur: 79,
    leadCapLabel: "Tot 100 leads / mnd",
    features: [
      "Eén plek voor aanvragen — minder zoeken, minder missers",
      "Sneller eerste antwoord zonder de hele dag online te zijn",
      "Later uitbreiden met website-chat en automatisering",
      "E-mailsupport",
    ],
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  {
    id: "growth",
    name: "Growth",
    description: "Voor meer afspraken en automatisering.",
    audience: "Teams met meer volume — salon, garage, monteur, praktijk.",
    priceEur: 149,
    leadCapLabel: "Tot 500 leads / mnd",
    features: [
      "Alles uit Starter — meer uit dezelfde stroom aanvragen",
      "Ruimte voor website-chatbot en slimme opvolging",
      "Minder leads die stilletjes verdwijnen",
      "Snellere support bij groeiende drukte",
    ],
    popular: true,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Voor maximale controle en groei.",
    audience: "Als aanvragen je hoofdzaak zijn en je grip én maatwerk wilt.",
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
