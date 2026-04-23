"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Euro, Hourglass } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ITEMS: Array<{ line: string; Icon: LucideIcon }> = [
  { line: "Sneller reageren", Icon: Clock },
  { line: "Meer afspraken", Icon: Calendar },
  { line: "Minder tijd kwijt", Icon: Hourglass },
  { line: "Meer omzet uit dezelfde aanvragen", Icon: Euro },
];

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingOutcomesSection() {
  return (
    <motion.section id="resultaten" className="scroll-mt-24 border-t border-border/45 py-9 md:py-11 dark:border-white/[0.08]" {...fade}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <p className="cf-landing-eyebrow text-center">Resultaat</p>
        <h2 className="cf-landing-h2 mx-auto mt-2 max-w-3xl text-center">Wat dit je oplevert</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
          Geen trucs — dit zijn de hefbomen waar teams op sturen.
        </p>

        <div className="mx-auto mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ line, Icon }) => (
            <div
              key={line}
              className="cf-landing-pro-card flex items-start gap-3 p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/18 dark:bg-primary/15">
                <Icon className="size-[18px]" strokeWidth={1.65} aria-hidden />
              </span>
              <p className="text-[14px] font-semibold leading-snug tracking-[-0.02em] text-foreground">{line}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-5 max-w-[720px] overflow-hidden rounded-[1.1rem] border border-primary/22 bg-gradient-to-br from-primary/[0.09] via-card to-card p-[1px] dark:from-primary/[0.14] dark:via-[hsl(222_30%_10%)] dark:to-[hsl(222_34%_7%)]">
          <div className="rounded-[1.05rem] bg-card/95 px-5 py-5 text-center dark:bg-[hsl(222_30%_9%/0.92)]">
            <p className="cf-landing-eyebrow text-center">Indicatief</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-4xl">+32% meer conversie</p>
            <p className="mt-2 text-xs text-muted-foreground">Verschil per branche en aanbod.</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
