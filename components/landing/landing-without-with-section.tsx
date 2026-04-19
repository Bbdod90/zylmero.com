"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ZONDER = [
  "Antwoord blijft uren of dagen liggen",
  "Klant belt al door naar de volgende op Google",
  "Je weet niet welke aanvraag het dringendst is",
  "Alles in losse stukjes verspreid — geen rust in je hoofd",
  "Opvolgen schiet erbij in als je druk bent",
] as const;

const MET = [
  "Alles wat binnenkomt op één overzichtelijke plek",
  "Sneller eerste antwoord — ook als jij op de klus zit",
  "Zien wat urgent is en wat kan wachten",
  "Minder zoeken tussen apps en notities",
  "Meer kans dat de klant bij jou boekt in plaats van elders",
] as const;

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

export function LandingWithoutWithSection({ className }: { className?: string }) {
  return (
    <section
      id="vergelijking"
      className={cn("border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]", className)}
    >
      <div className="relative mx-auto max-w-[1180px] px-4 md:px-8">
        <motion.div className="mx-auto max-w-2xl text-center" {...fade}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Even scherp</p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Zonder Zylmero · met Zylmero
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-muted-foreground md:text-lg">
            Structuur en snelheid — minder omzetverlies door trage reacties.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 md:gap-6">
          <motion.div
            className="cf-landing-pro-card p-6 md:p-7"
            {...fade}
            transition={{ ...fade.transition, delay: 0.05 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Zonder</p>
            <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-foreground md:text-[0.9375rem]">
              {ZONDER.map((line) => (
                <li key={line} className="flex gap-3">
                  <X className="mt-0.5 size-4 shrink-0 text-destructive/85" strokeWidth={2} aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.09] via-card/80 to-card/60 p-6 shadow-[0_22px_60px_-38px_hsl(var(--primary)/0.45)] ring-1 ring-primary/15 dark:from-primary/[0.14] dark:via-card/50 dark:to-[hsl(228_28%_6%/0.95)] md:p-7"
            {...fade}
            transition={{ ...fade.transition, delay: 0.1 }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/20 blur-3xl" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Met Zylmero</p>
            <ul className="relative mt-5 space-y-3.5 text-sm leading-relaxed text-foreground md:text-[0.9375rem]">
              {MET.map((line) => (
                <li key={line} className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
