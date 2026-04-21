"use client";

import { motion } from "framer-motion";
import { Brush, Briefcase, CarFront, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CASES: Array<{ label: string; line: string; Icon: LucideIcon }> = [
  {
    label: "Schilders",
    line: "Offerte-aanvragen die nooit meer blijven hangen.",
    Icon: Brush,
  },
  {
    label: "Loodgieters",
    line: "Spoed en planning — zonder dat jij elk nummer hoeft af te pakken.",
    Icon: Wrench,
  },
  {
    label: "Garages",
    line: "Kentekens, werkplaats-capaciteit — context meteen bij de eerste reactie.",
    Icon: CarFront,
  },
  {
    label: "Monteurs",
    line: "Routes en urgente klussen — gefilterd voordat jij belt.",
    Icon: Briefcase,
  },
];

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
};

export function LandingUseCasesSection() {
  return (
    <motion.section id="voor-wie" className="scroll-mt-28 border-t border-border/45 bg-muted/[0.2] py-28 md:py-36 dark:border-white/[0.08] dark:bg-white/[0.02]" {...fade}>
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Segmenten</p>
        <h2 className="mx-auto mt-5 max-w-[920px] text-balance text-center text-3xl font-semibold tracking-[-0.038em] text-foreground md:text-[2.65rem] md:leading-[1.08]">
          Voor bedrijven waar aanvragen omzet zijn
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-muted-foreground">
          Zelfde platform — verschillende werkdagen. Kies waar jij staat.
        </p>

        <ul className="mx-auto mt-14 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {CASES.map(({ label, line, Icon }) => (
            <li
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-7 shadow-[0_20px_60px_-44px_rgb(15_23_42/0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_28px_70px_-40px_hsl(var(--primary)/0.22)] dark:border-white/[0.09] dark:bg-[hsl(222_30%_9%/0.85)] dark:hover:border-primary/30"
            >
              <div className="flex items-start gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/18 dark:bg-primary/15">
                  <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{label}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{line}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
