"use client";

import { motion } from "framer-motion";

const INDUSTRIES = ["Schilders", "Loodgieters", "Garages", "Monteurs"] as const;

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

export function LandingUseCasesSection() {
  return (
    <motion.section
      id="voor-wie"
      className="scroll-mt-28 border-t border-border/40 py-24 md:py-32 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[900px] px-4 md:px-8">
        <h2 className="mx-auto max-w-2xl text-balance text-center text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
          Voor bedrijven die afhankelijk zijn van aanvragen
        </h2>
        <ul className="mx-auto mt-14 flex max-w-xl flex-wrap justify-center gap-3 md:gap-4">
          {INDUSTRIES.map((label) => (
            <li
              key={label}
              className="rounded-full border border-border/50 bg-muted/30 px-5 py-2.5 text-sm font-semibold text-foreground dark:border-white/[0.1] dark:bg-white/[0.04] md:text-base"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
