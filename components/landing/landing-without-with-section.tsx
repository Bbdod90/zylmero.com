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
      className={cn(
        "relative overflow-hidden border-b border-border/40 py-16 md:py-20 lg:py-24 dark:border-white/[0.06]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-5%,hsl(var(--primary)/0.11),transparent_58%),radial-gradient(ellipse_50%_40%_at_100%_80%,hsl(262_45%_50%/0.06),transparent_50%)]"
        aria-hidden
      />
      <div className="cf-landing-grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[1100px] px-4 md:px-8">
        <motion.div className="mx-auto max-w-2xl text-center" {...fade}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Even scherp
          </p>
          <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Zonder Zylmero · Met Zylmero
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Geen truc — structuur en snelheid waar je direct minder omzetverlies door hebt.
          </p>
        </motion.div>

        <div className="relative mt-12 lg:mt-14">
          <div
            className="pointer-events-none absolute left-1/2 top-12 hidden -translate-x-1/2 lg:block"
            aria-hidden
          >
            <div className="flex size-[3.25rem] items-center justify-center rounded-full border border-primary/40 bg-gradient-to-b from-primary/15 to-background text-[0.7rem] font-black uppercase tracking-[0.12em] text-primary shadow-[0_0_48px_-10px_hsl(var(--primary)/0.85),inset_0_1px_0_0_hsl(0_0%_100%/0.08)] ring-[5px] ring-background dark:from-primary/25 dark:to-[hsl(228_28%_8%/0.98)] dark:ring-[hsl(228_28%_5%/0.98)]">
              vs
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
            <motion.div
              {...fade}
              transition={{ ...fade.transition, delay: 0.05 }}
              className={cn(
                "relative rounded-3xl border p-6 md:p-8",
                "border-border/55 bg-gradient-to-b from-muted/35 to-muted/10 dark:border-white/[0.07] dark:from-white/[0.04] dark:to-transparent",
              )}
            >
              <div
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-destructive/25 to-transparent"
                aria-hidden
              />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Zonder Zylmero
              </p>
              <ul className="mt-6 space-y-4">
                {ZONDER.map((line) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-foreground md:text-[0.9375rem]">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive/12 text-destructive ring-1 ring-destructive/20 dark:bg-destructive/18">
                      <X className="size-3.5" strokeWidth={2.5} aria-hidden />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              {...fade}
              transition={{ ...fade.transition, delay: 0.12 }}
              className={cn(
                "relative rounded-3xl border p-6 shadow-[0_24px_60px_-40px_hsl(var(--primary)/0.35)] md:p-8",
                "border-primary/35 bg-gradient-to-br from-primary/[0.09] via-card/90 to-primary/[0.04]",
                "dark:border-primary/40 dark:from-primary/[0.12] dark:via-[hsl(228_26%_9%/0.85)] dark:to-primary/[0.06]",
              )}
            >
              <div
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                aria-hidden
              />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Met Zylmero</p>
              <ul className="mt-6 space-y-4">
                {MET.map((line) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-foreground md:text-[0.9375rem]">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/18 text-primary ring-1 ring-primary/25 dark:bg-primary/22">
                      <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
