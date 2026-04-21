"use client";

import { Clock, Layers, Shield, Zap } from "lucide-react";

const STATS = [
  {
    Icon: Zap,
    title: "Live in minuten",
    sub: "Geen maanden implementatie — koppel en ga.",
  },
  {
    Icon: Layers,
    title: "Alle kanalen één plek",
    sub: "Site, WhatsApp en mail in één stroom.",
  },
  {
    Icon: Clock,
    title: "Altijd eerste reactie",
    sub: "Ook buiten jouw werkuren.",
  },
  {
    Icon: Shield,
    title: "Jij bewaakt de grenzen",
    sub: "Regels die jij instelt — geen chaos.",
  },
] as const;

export function LandingStatsStrip() {
  return (
    <section
      aria-label="Waarom teams voor Zylmero kiezen"
      className="border-b border-border/45 bg-gradient-to-r from-muted/40 via-muted/25 to-muted/40 py-10 dark:border-white/[0.07] dark:from-white/[0.04] dark:via-white/[0.02] dark:to-white/[0.04] md:py-12"
    >
      <div className="mx-auto grid max-w-[1180px] gap-6 px-4 sm:grid-cols-2 sm:gap-8 sm:px-6 lg:grid-cols-4 lg:px-8">
        {STATS.map(({ Icon, title, sub }) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-transparent px-2 py-1 md:block md:py-0">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25 dark:bg-primary/15">
              <Icon className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-foreground">{title}</p>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
