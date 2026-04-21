"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

const STATS = [
  {
    label: "Kosten van gemiste kansen",
    value: "€400 – €2.000+",
    sub: "per week bij een paar gemiste aanvragen — afhankelijk van je orderwaarde",
  },
  {
    label: "Prijs van traagheid",
    value: "10 – 30%",
    sub: "minder kans op een afspraak dan bij een snelle reactie",
  },
  {
    label: "Terugverdiend",
    value: "1 extra klus",
    sub: "betaalt je tooling vaak al terug",
  },
] as const;

const BENEFITS = [
  "Minder gemiste klanten",
  "Sneller contact met elke aanvraag",
  "Minder stress in je hoofd",
  "Meer overzicht in je inbox",
  "Betere opvolging zonder extra uren",
  "Meer omzet uit bestaande aanvragen",
] as const;

export function LandingOutcomesSection() {
  return (
    <motion.section
      id="resultaat"
      className="relative scroll-mt-28 border-b border-border/30 bg-gradient-to-b from-background via-muted/20 to-background py-20 md:py-28 dark:border-white/[0.06] dark:via-white/[0.02]"
      {...fade}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="cf-landing-eyebrow">Resultaat</p>
          <h2 className="cf-landing-h2 mt-4">Wat je er concreet voor terugkrijgt</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Geen beloftes van “groei hacks”. Wel minder lekken aan de voorkant van je zaak — waar klanten beslissen of ze
            bij jou blijven.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-3">
          {STATS.map((card) => (
            <div key={card.label} className="cf-landing-pro-card flex flex-col p-7 md:p-8">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-4 font-mono text-xl font-bold tabular-nums tracking-tight text-foreground sm:text-2xl md:text-3xl">
                {card.value}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <p className="text-center text-sm font-medium text-foreground">Hard voordeel</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {BENEFITS.map((label) => (
              <li
                key={label}
                className="flex items-start gap-3 rounded-xl border border-border/40 bg-card/60 px-4 py-3.5 text-left text-sm font-medium leading-snug text-foreground dark:border-white/[0.08] dark:bg-white/[0.03]"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/20">
                  <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            Indicaties; jouw cijfers verschillen per branche en prijs.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
