"use client";

import { motion } from "framer-motion";
import { MessageSquareOff, Moon, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    line: "Je reageert te laat → klant is weg",
    Icon: Timer,
  },
  {
    line: "Je mist berichten buiten werktijd",
    Icon: Moon,
  },
  {
    line: "Je bent constant bezig met appen/mailen",
    Icon: MessageSquareOff,
  },
] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingPainCostSection({ className }: { className?: string }) {
  return (
    <section id="probleem" className={cn("border-t border-border/40 py-24 md:py-32 dark:border-white/[0.08]", className)}>
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <motion.div {...fade}>
          <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Het probleem</p>
          <h2 className="mx-auto mt-4 max-w-[920px] text-balance text-center text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-5xl md:leading-[1.06]">
            Dit gebeurt nu waarschijnlijk in jouw bedrijf
          </h2>
          <ul className="mx-auto mt-14 grid max-w-[960px] gap-4 md:grid-cols-3 md:gap-5">
            {ITEMS.map(({ line, Icon }) => (
              <li
                key={line}
                className="cf-landing-pro-card group flex flex-col gap-5 p-6 md:min-h-[11rem] md:p-7"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/18 dark:bg-primary/15 dark:ring-primary/25">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="text-[15px] font-medium leading-snug tracking-tight text-foreground md:text-base">{line}</p>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-14 max-w-xl text-center text-lg font-semibold tracking-tight text-foreground md:text-xl">
            Dat kost je klanten.{" "}
            <span className="text-muted-foreground font-medium">Elke dag opnieuw.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
