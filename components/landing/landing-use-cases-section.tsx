"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const INDUSTRIES = ["Schilders", "Loodgieters", "Garages", "Monteurs"] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingUseCasesSection() {
  return (
    <motion.section
      id="voor-wie"
      className="scroll-mt-28 border-t border-border/40 py-28 md:py-36 dark:border-white/[0.08]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/55 bg-card/90 px-4 py-2 text-[13px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.04]">
            <Briefcase className="size-4 text-primary" strokeWidth={1.75} aria-hidden />
            Voor wie
          </span>
        </div>
        <h2 className="mx-auto max-w-[920px] text-balance text-center text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-5xl md:leading-[1.06]">
          Bedrijven die afhankelijk zijn van aanvragen
        </h2>
        <ul className="mx-auto mt-14 flex max-w-[760px] flex-wrap justify-center gap-3 md:gap-4">
          {INDUSTRIES.map((label) => (
            <li
              key={label}
              className="rounded-full border border-border/55 bg-gradient-to-b from-card/95 to-card/80 px-7 py-3 text-[15px] font-semibold tracking-tight text-foreground shadow-[0_8px_30px_-18px_rgb(0_0_0/0.35)] ring-1 ring-black/[0.03] backdrop-blur-sm dark:border-white/[0.12] dark:from-white/[0.06] dark:to-white/[0.02] dark:ring-white/[0.05]"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
