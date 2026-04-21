"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CalendarClock,
  Globe,
  Inbox,
  Kanban,
  Sparkles,
} from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
};

export function LandingPlatformBento() {
  return (
    <motion.section
      id="platform"
      className="scroll-mt-28 border-t border-border/45 py-28 md:py-36 dark:border-white/[0.08]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Platform</p>
        <h2 className="mx-auto mt-4 max-w-[820px] text-balance text-center text-3xl font-semibold tracking-[-0.035em] text-foreground md:text-5xl md:leading-[1.05]">
          Alles wat je nodig hebt om aanvragen om te zetten in omzet
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-muted-foreground">
          Geen losse tools — één systeem voor intake, gesprek en opvolging.
        </p>

        <div className="mt-16 grid gap-4 md:grid-cols-12 md:gap-5">
          <div className="cf-landing-pro-card md:col-span-7 md:row-span-2 md:flex md:min-h-[280px] md:flex-col md:justify-between md:p-10 p-8">
            <div>
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
                <Inbox className="size-6" strokeWidth={1.6} aria-hidden />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground md:text-2xl">Eén inbox voor elke aanvraag</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Mail, WhatsApp en website-widget komen samen — geen zoeken tussen apps, geen dubbele threads.
              </p>
            </div>
            <p className="mt-8 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary/90 md:mt-10">
              Centraal · realtime · overzichtelijk
            </p>
          </div>

          <div className="cf-landing-pro-card md:col-span-5 md:p-8 p-8">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
              <Bot className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">AI die meedenkt</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Antwoorden met context, doorvragen waar nodig, en altijd in jouw toon — geen robotachtige standaardzinnen.
            </p>
          </div>

          <div className="cf-landing-pro-card md:col-span-5 md:p-8 p-8">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
              <Sparkles className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">Serieuze leads eerst</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Filter ruis: spoed, budget, planning — jij ziet wie echt door wil.
            </p>
          </div>

          <div className="cf-landing-pro-card md:col-span-4 md:p-8 p-8">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
              <CalendarClock className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">Afspraken ingeboekt</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Voorstellen die klant en agenda matchen — minder heen-en-weer.
            </p>
          </div>

          <div className="cf-landing-pro-card md:col-span-4 md:p-8 p-8">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
              <Globe className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">Widget op je site</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Bezoekers starten direct een gesprek — zonder extra formulieren.
            </p>
          </div>

          <div className="cf-landing-pro-card md:col-span-4 md:p-8 p-8">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
              <Kanban className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">Pipeline &amp; opvolging</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Geen vergeten leads: status, taken en ritme dat bij jouw proces past.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
