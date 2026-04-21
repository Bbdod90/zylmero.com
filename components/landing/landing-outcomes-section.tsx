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
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
};

export function LandingOutcomesSection() {
  return (
    <motion.section id="resultaten" className="scroll-mt-28 border-t border-border/45 py-28 md:py-36 dark:border-white/[0.08]" {...fade}>
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Resultaat</p>
        <h2 className="mt-5 text-center text-balance text-3xl font-semibold tracking-[-0.038em] text-foreground md:text-[2.65rem] md:leading-[1.08]">
          Wat dit je oplevert
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-muted-foreground">
          Geen marketing-trucs — dit zijn de hefbomen waar teams op sturen.
        </p>

        <div className="mx-auto mt-14 max-w-[960px] divide-y divide-border/45 rounded-2xl border border-border/50 bg-gradient-to-b from-card/90 to-card/70 shadow-[var(--shadow-md)] dark:divide-white/[0.07] dark:border-white/[0.09] dark:from-[hsl(222_28%_10%/0.9)] dark:to-[hsl(222_32%_8%/0.95)]">
          {ITEMS.map(({ line, Icon }) => (
            <div key={line} className="flex items-center gap-5 px-6 py-6 md:gap-6 md:px-8 md:py-7">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/18 dark:bg-primary/15">
                <Icon className="size-5" strokeWidth={1.65} aria-hidden />
              </span>
              <p className="text-[17px] font-semibold tracking-[-0.02em] text-foreground md:text-lg">{line}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-[960px] overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-card to-card p-[1px] shadow-[0_24px_80px_-48px_hsl(var(--primary)/0.45)] dark:from-primary/[0.18] dark:via-[hsl(222_30%_10%)] dark:to-[hsl(222_34%_7%)]">
          <div className="rounded-[15px] bg-card/95 px-8 py-10 text-center dark:bg-[hsl(222_30%_9%/0.92)]">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Indicatief</p>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-foreground md:text-5xl">+32% meer conversie</p>
            <p className="mt-4 text-sm text-muted-foreground">Resultaat verschilt per branche en aanbod.</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
