"use client";

import { motion } from "framer-motion";

const LINES = [
  "Sneller reageren",
  "Meer afspraken",
  "Minder tijd kwijt",
  "Meer omzet uit dezelfde aanvragen",
] as const;

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

export function LandingOutcomesSection() {
  return (
    <motion.section
      id="resultaten"
      className="scroll-mt-28 border-t border-border/40 py-24 md:py-32 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[720px] px-4 md:px-8">
        <h2 className="text-center text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
          Wat dit je oplevert
        </h2>
        <ul className="mt-14 space-y-3 text-center text-xl font-semibold text-foreground md:text-2xl">
          {LINES.map((line) => (
            <li key={line} className="border-b border-border/40 pb-3 last:border-0 dark:border-white/[0.08]">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-2xl font-semibold tabular-nums text-primary md:text-3xl">+32% meer conversie</p>
        <p className="mt-2 text-center text-sm text-muted-foreground">Indicatief — resultaat verschilt per branche.</p>
      </div>
    </motion.section>
  );
}
