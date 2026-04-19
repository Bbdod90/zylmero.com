"use client";

import { motion } from "framer-motion";
import { Clock, Inbox, MessageSquareX, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    title: "Je reageert te laat",
    body: "De klant is al weg voordat jij antwoord geeft.",
    Icon: Clock,
  },
  {
    title: "Berichten staan overal",
    body: "WhatsApp, mail, formulier — geen overzicht.",
    Icon: Inbox,
  },
  {
    title: "Opvolging schiet erbij in",
    body: "Druk → vergeten → gemiste omzet.",
    Icon: MessageSquareX,
  },
  {
    title: "Concurrent is sneller",
    body: "Niet de goedkoopste wint — de snelste die serieus antwoord geeft.",
    Icon: Zap,
  },
] as const;

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingPainCostSection({ className }: { className?: string }) {
  return (
    <section
      id="wat-het-kost"
      className={cn(
        "relative overflow-hidden border-b border-border/30 py-16 md:py-24 lg:py-28 dark:border-white/[0.06]",
        className,
      )}
    >
      <div className="relative mx-auto max-w-[1180px] px-4 md:px-8">
        <motion.div className="mx-auto max-w-2xl text-center" {...fade}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Herkenning</p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            Wat het je nu kost (zonder dat je het ziet)
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Geen verwijt — wel harde economie: als je niet op tijd reageert, verlies je klanten aan iemand die dat wél doet.
          </p>
        </motion.div>

        <motion.ul
          className="mt-14 grid gap-4 md:grid-cols-2"
          {...fade}
          transition={{ ...fade.transition, delay: 0.06 }}
        >
          {ITEMS.map(({ title, body, Icon }) => (
            <li key={title} className="cf-landing-pro-card flex gap-4 p-7 md:gap-5 md:p-8">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold leading-snug text-foreground">{title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
