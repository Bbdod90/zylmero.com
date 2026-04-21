"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BULLETS = [
  "Je reageert te laat → klant is weg",
  "Je mist berichten buiten werktijd",
  "Je bent constant bezig met appen/mailen",
] as const;

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

export function LandingPainCostSection({ className }: { className?: string }) {
  return (
    <section
      id="probleem"
      className={cn("border-t border-border/40 py-24 md:py-32 dark:border-white/[0.06]", className)}
    >
      <div className="mx-auto max-w-[720px] px-4 md:px-8">
        <motion.div {...fade}>
          <h2 className="text-balance text-center text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
            Dit gebeurt nu waarschijnlijk in jouw bedrijf
          </h2>
          <ul className="mt-14 space-y-4 text-center text-lg font-medium text-foreground md:text-xl md:leading-snug">
            {BULLETS.map((line) => (
              <li key={line} className="border-b border-border/40 pb-4 last:border-0 dark:border-white/[0.08]">
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-12 text-center text-xl font-semibold text-foreground md:text-2xl">
            Dat kost je klanten. Elke dag opnieuw.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
