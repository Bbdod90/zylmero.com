"use client";

import { motion } from "framer-motion";
import { CalendarClock, Filter, Zap } from "lucide-react";

const BLOCKS = [
  { line: "Reageert direct op elke aanvraag", Icon: Zap },
  { line: "Filtert serieuze klanten", Icon: Filter },
  { line: "Plant afspraken automatisch", Icon: CalendarClock },
] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingSolutionSection() {
  return (
    <motion.section
      id="oplossing"
      className="scroll-mt-28 border-t border-border/40 py-28 md:py-36 dark:border-white/[0.08]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">De oplossing</p>
        <h2 className="mx-auto mt-4 max-w-[880px] text-center text-balance text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-5xl md:leading-[1.06]">
          Zylmero pakt dit volledig voor je op
        </h2>
        <ul className="mx-auto mt-14 grid max-w-[960px] gap-4 md:grid-cols-3 md:gap-5">
          {BLOCKS.map(({ line, Icon }) => (
            <li
              key={line}
              className="cf-landing-pro-card group flex flex-col gap-5 p-6 transition-transform duration-300 hover:-translate-y-1 md:min-h-[10rem] md:p-7"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/18 dark:bg-primary/15 dark:ring-primary/25">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <p className="text-[15px] font-semibold leading-snug tracking-tight text-foreground md:text-lg">{line}</p>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
