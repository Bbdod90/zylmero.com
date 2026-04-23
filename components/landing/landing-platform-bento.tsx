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
      className="scroll-mt-24 border-t border-border/45 py-9 md:py-12 dark:border-white/[0.08]"
      {...fade}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <p className="cf-landing-eyebrow text-center">Platform</p>
        <h2 className="cf-landing-h2 mx-auto mt-2 max-w-[860px] text-center">
          Van aanvraag naar omzet — één systeem
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground md:text-[15px]">
          Intake, gesprek en opvolging zonder losse tools.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-12 md:gap-3">
          <div className="cf-landing-pro-card md:col-span-7 md:row-span-2 md:flex md:min-h-[240px] md:flex-col md:justify-between md:p-8 p-6">
            <div>
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
                <Inbox className="size-6" strokeWidth={1.6} aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground md:text-xl">Eén inbox voor elke aanvraag</h3>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                Mail, WhatsApp en widget — één stroom, geen dubbele threads.
              </p>
            </div>
            <p className="mt-6 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-primary/90 md:mt-8">
              Centraal · realtime
            </p>
          </div>

          <div className="cf-landing-pro-card md:col-span-5 md:p-6 p-6">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
              <Bot className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">AI die meedenkt</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              Context, doorvragen, jouw toon — geen standaardrobotteksten.
            </p>
          </div>

          <div className="cf-landing-pro-card md:col-span-5 md:p-6 p-6">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
              <Sparkles className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">Serieuze leads eerst</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              Spoed, budget, planning — jij ziet wie door wil.
            </p>
          </div>

          <div className="cf-landing-pro-card md:col-span-4 md:p-6 p-6">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
              <CalendarClock className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">Afspraken ingeboekt</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              Slots die klant en agenda matchen.
            </p>
          </div>

          <div className="cf-landing-pro-card md:col-span-4 md:p-6 p-6">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
              <Globe className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">Widget op je site</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              Gesprek starten zonder rommelige formulieren.
            </p>
          </div>

          <div className="cf-landing-pro-card md:col-span-4 md:p-6 p-6">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25">
              <Kanban className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">Pipeline &amp; opvolging</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              Status en ritme — niets meer kwijt.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
