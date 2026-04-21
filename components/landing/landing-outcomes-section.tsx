"use client";

import { motion } from "framer-motion";

const LINES = [
  "Minder gemiste klanten",
  "Sneller contact",
  "Meer afspraken",
  "Meer omzet",
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
      id="resultaat"
      className="scroll-mt-28 border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[640px] px-4 md:px-8">
        <h2 className="text-center text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
          Wat het oplevert
        </h2>
        <ul className="mt-14 space-y-3 text-center text-xl font-semibold text-foreground md:text-2xl">
          {LINES.map((line) => (
            <li key={line} className="border-b border-border/30 pb-3 last:border-0 dark:border-white/[0.08]">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
