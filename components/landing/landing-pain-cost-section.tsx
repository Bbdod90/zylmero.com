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
    <section id="probleem" className={cn("scroll-mt-24 border-t border-border/40 py-9 md:py-11 dark:border-white/[0.08]", className)}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <motion.div {...fade}>
          <p className="cf-landing-eyebrow text-center">Het probleem</p>
          <h2 className="cf-landing-h2 mx-auto mt-2 max-w-[880px] text-center">
            Dit gebeurt nu waarschijnlijk in jouw bedrijf
          </h2>
          <ul className="mx-auto mt-6 grid max-w-[960px] gap-3 md:grid-cols-3 md:gap-3">
            {ITEMS.map(({ line, Icon }) => (
              <li
                key={line}
                className="cf-landing-pro-card group flex flex-col gap-3 p-5 md:p-6"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/18 dark:bg-primary/15 dark:ring-primary/25">
                  <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="text-[14px] font-medium leading-snug tracking-tight text-foreground md:text-[15px]">{line}</p>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-6 max-w-xl text-center text-sm font-semibold tracking-tight text-foreground md:text-base">
            Dat kost je klanten — <span className="font-medium text-muted-foreground">elke dag.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
