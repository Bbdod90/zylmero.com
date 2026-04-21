"use client";

import { motion } from "framer-motion";

const BLOCKS = [
  "Reageert direct op elke aanvraag",
  "Filtert serieuze klanten",
  "Plant afspraken automatisch",
] as const;

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

export function LandingSolutionSection() {
  return (
    <motion.section
      id="oplossing"
      className="scroll-mt-28 border-t border-border/40 py-24 md:py-32 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[720px] px-4 md:px-8">
        <h2 className="text-center text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
          Zylmero pakt dit volledig voor je op
        </h2>
        <ul className="mt-14 space-y-4">
          {BLOCKS.map((line) => (
            <li
              key={line}
              className="rounded-2xl border border-border/50 bg-muted/20 px-6 py-5 text-lg font-semibold text-foreground dark:border-white/[0.08] md:text-xl"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
