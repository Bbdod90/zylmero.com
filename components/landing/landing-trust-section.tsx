"use client";

import { motion } from "framer-motion";

const PLACEHOLDERS = [
  {
    quote: "Ik sta op locatie. Nu antwoordt er wél iets. Ik zie nog wat openstaat.",
    name: "R. de Vries",
    role: "Installatie",
  },
  {
    quote: "Te laat = weg. Zo hoeft niet meer alles van mij af te hangen.",
    name: "M. Jansen",
    role: "Garage",
  },
  {
    quote: "Geen gedoe. Gewoon overzicht.",
    name: "S. Öztürk",
    role: "Salon",
  },
] as const;

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

export function LandingTrustSection() {
  return (
    <motion.section
      id="vertrouwen"
      className="scroll-mt-28 border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[1000px] px-4 md:px-8">
        <h2 className="text-center text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Wat anderen merken
        </h2>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {PLACEHOLDERS.map((t) => (
            <li key={t.name} className="rounded-2xl border border-border/40 bg-card/40 p-6 dark:border-white/[0.08]">
              <p className="text-sm font-medium leading-relaxed text-foreground md:text-base">“{t.quote}”</p>
              <p className="mt-4 text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
