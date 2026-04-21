"use client";

import { motion } from "framer-motion";

const BLOCKS = [
  "Reageert direct op elke aanvraag",
  "Filtert serieuze klanten",
  "Plant afspraken automatisch",
] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingSolutionSection() {
  return (
    <motion.section
      id="oplossing"
      className="scroll-mt-28 border-t border-border/40 py-28 md:py-36 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-[880px] text-center text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-5xl md:leading-[1.08]">
          Zylmero pakt dit volledig voor je op
        </h2>
        <ul className="mx-auto mt-16 grid max-w-[960px] gap-4 md:grid-cols-3 md:gap-5">
          {BLOCKS.map((line) => (
            <li
              key={line}
              className="cf-landing-pro-card flex min-h-[6.5rem] items-center px-6 py-6 text-[15px] font-semibold leading-snug tracking-tight text-foreground transition-transform duration-300 hover:-translate-y-0.5 md:min-h-[7rem] md:text-lg"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
