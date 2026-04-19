"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ITEMS = [
  "Minder stress",
  "Meer afspraken",
  "Geen gemiste klanten",
  "Meer omzet zonder harder werken",
] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export function LandingResultSection() {
  return (
    <motion.section className="border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]" {...fade}>
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Wat dit voor jou betekent
          </h2>
        </div>
        <ul className="mx-auto mt-12 grid max-w-2xl gap-3 sm:grid-cols-2">
          {ITEMS.map((label) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl border border-border/45 bg-muted/25 px-4 py-4 text-left text-sm font-medium text-foreground dark:border-white/[0.08] dark:bg-white/[0.04]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20">
                <Check className="size-4" aria-hidden />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
