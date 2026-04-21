"use client";

import { motion } from "framer-motion";
import { CalendarClock, Layers, Zap } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

const BLOCKS = [
  {
    title: "Direct antwoord",
    body: "Klant blijft hangen — geen stilte van uren of dagen meer.",
    Icon: Zap,
  },
  {
    title: "Alle aanvragen op één plek",
    body: "Overzicht en rust: je ziet wat spoed heeft en wat wacht.",
    Icon: Layers,
  },
  {
    title: "Meer afspraken",
    body: "Zonder harder werken: minder zoeken, minder vergeten.",
    Icon: CalendarClock,
  },
] as const;

export function LandingSolutionSection() {
  return (
    <motion.section
      className="border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            Dit verandert er als je Zylmero gebruikt
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Speciaal als je het zelf regelt of met een klein team werkt — geen aparte binnendienst of IT nodig.
          </p>
        </div>
        <ul className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
          {BLOCKS.map(({ title, body, Icon }) => (
            <li key={title} className="cf-landing-pro-card p-7 md:p-8">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
