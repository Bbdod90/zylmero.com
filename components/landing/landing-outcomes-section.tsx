"use client";

import { motion } from "framer-motion";

const LINES = [
  "Sneller reageren",
  "Meer afspraken",
  "Minder tijd kwijt",
  "Meer omzet uit dezelfde aanvragen",
] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingOutcomesSection() {
  return (
    <motion.section
      id="resultaten"
      className="scroll-mt-28 border-t border-border/40 py-28 md:py-36 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-5xl md:leading-[1.08]">
          Wat dit je oplevert
        </h2>
        <div className="mx-auto mt-16 grid max-w-[900px] gap-4 sm:grid-cols-2 sm:gap-5">
          {LINES.map((line) => (
            <div
              key={line}
              className="cf-landing-pro-card flex items-center px-6 py-5 text-[15px] font-semibold text-foreground md:text-lg"
            >
              {line}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-[900px]">
          <div className="cf-landing-pro-card relative overflow-hidden px-8 py-10 text-center md:px-12 md:py-12">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Indicatief</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">+32% meer conversie</p>
            <p className="mt-3 text-sm text-muted-foreground">Resultaat verschilt per branche en aanbod.</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
