"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Euro, Hourglass } from "lucide-react";

const ITEMS = [
  { line: "Sneller reageren", Icon: Clock },
  { line: "Meer afspraken", Icon: Calendar },
  { line: "Minder tijd kwijt", Icon: Hourglass },
  { line: "Meer omzet uit dezelfde aanvragen", Icon: Euro },
] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingOutcomesSection() {
  return (
    <motion.section
      id="resultaten"
      className="scroll-mt-28 border-t border-border/40 py-28 md:py-36 dark:border-white/[0.08]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Resultaat</p>
        <h2 className="mt-4 text-center text-balance text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-5xl md:leading-[1.06]">
          Wat dit je oplevert
        </h2>
        <div className="mx-auto mt-14 grid max-w-[900px] gap-4 sm:grid-cols-2 sm:gap-5">
          {ITEMS.map(({ line, Icon }) => (
            <div
              key={line}
              className="cf-landing-pro-card flex items-start gap-4 p-5 md:p-6"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/15 dark:bg-primary/15">
                <Icon className="size-[18px]" strokeWidth={1.85} aria-hidden />
              </span>
              <p className="pt-0.5 text-[15px] font-semibold leading-snug tracking-tight text-foreground md:text-base">{line}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-[900px]">
          <div className="cf-landing-pro-card cf-landing-feature-ring relative overflow-hidden px-8 py-10 text-center md:px-12 md:py-11">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,hsl(var(--primary)/0.12),transparent_55%)]"
              aria-hidden
            />
            <div className="relative">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Indicatief</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-4xl">+32% meer conversie</p>
              <p className="mt-3 text-sm text-muted-foreground">Resultaat verschilt per branche en aanbod.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
