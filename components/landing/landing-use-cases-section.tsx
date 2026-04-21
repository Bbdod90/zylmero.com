"use client";

import { motion } from "framer-motion";

const INDUSTRIES = ["Schilders", "Loodgieters", "Garages", "Monteurs"] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingUseCasesSection() {
  return (
    <motion.section
      id="voor-wie"
      className="scroll-mt-28 border-t border-border/40 py-28 md:py-36 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-[920px] text-balance text-center text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-5xl md:leading-[1.08]">
          Voor bedrijven die afhankelijk zijn van aanvragen
        </h2>
        <ul className="mx-auto mt-16 flex max-w-[720px] flex-wrap justify-center gap-3 md:gap-4">
          {INDUSTRIES.map((label) => (
            <li
              key={label}
              className="rounded-full border border-border/55 bg-card/80 px-6 py-2.5 text-[15px] font-semibold tracking-tight text-foreground shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.04] md:px-7 md:py-3 md:text-base"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
