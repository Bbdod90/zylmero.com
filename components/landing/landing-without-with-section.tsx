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
      <div className="relative mx-auto max-w-[900px] px-4 md:px-8">
        <motion.div className="mx-auto max-w-xl text-center" {...fade}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Even scherp</p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Zonder Zylmero · met Zylmero
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-muted-foreground md:text-lg">
            Structuur en snelheid — minder omzetverlies door trage reacties.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12">
          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.05 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Zonder</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground md:text-[0.9375rem]">
              {ZONDER.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <X className="mt-0.5 size-4 shrink-0 text-destructive/80" strokeWidth={2} aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.1 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Met Zylmero</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground md:text-[0.9375rem]">
              {MET.map((line) => (
                <li key={line} className="flex gap-2.5">
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
