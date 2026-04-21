"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const BULLETS = [
  "Reageert direct",
  "Houdt gesprekken gaande",
  "Filtert serieuze klanten",
  "Jij pakt alleen de deals",
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
      className="scroll-mt-28 border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[640px] px-4 md:px-8">
        <h2 className="text-center text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
          Dit pakt Zylmero voor je op
        </h2>
        <ul className="mt-14 space-y-4">
          {BULLETS.map((line) => (
            <li
              key={line}
              className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/20 px-5 py-4 text-lg font-semibold text-foreground dark:border-white/[0.08] md:text-xl"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-4" strokeWidth={2.5} aria-hidden />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
