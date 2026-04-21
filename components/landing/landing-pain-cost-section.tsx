"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BULLETS = [
  "Je reageert te laat → klant is weg",
  "Je mist berichten buiten werktijd",
  "Je bent constant bezig met appen/mailen",
] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingPainCostSection({ className }: { className?: string }) {
  return (
    <section id="probleem" className={cn("border-t border-border/40 py-24 md:py-32 dark:border-white/[0.06]", className)}>
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <motion.div {...fade}>
          <h2 className="mx-auto max-w-[920px] text-balance text-center text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-5xl md:leading-[1.08]">
            Dit gebeurt nu waarschijnlijk in jouw bedrijf
          </h2>
          <ul className="mx-auto mt-16 grid max-w-[960px] gap-4 md:grid-cols-3 md:gap-5">
            {BULLETS.map((line) => (
              <li
                key={line}
                className="cf-landing-pro-card flex min-h-[7.5rem] items-center justify-center px-5 py-6 text-center text-[15px] font-medium leading-snug text-foreground md:min-h-[8.25rem] md:px-6 md:text-base"
              >
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-14 text-center text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Dat kost je klanten. Elke dag opnieuw.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
