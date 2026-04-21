"use client";

import { cn } from "@/lib/utils";
import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";

const STEPS = [
  { label: "Klant", line: "Kan morgen rond 14:00?" },
  { label: "Antwoord", line: "Ja — ik check de agenda." },
  { label: "Afspraak", line: "Wo 14:00 staat vast." },
  { label: "Lead", line: "Klaar in je overzicht." },
] as const;

export function LandingHeroProductVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-b from-primary/[0.12] via-transparent to-transparent blur-2xl dark:from-primary/[0.2]"
        aria-hidden
      />
      <div className="cf-landing-pro-card relative shadow-[var(--shadow-lg)] dark:shadow-[var(--shadow-lg)]">
        <div className="cf-landing-grain absolute inset-0 rounded-[inherit]" aria-hidden />
        <div className="relative flex items-center gap-2 border-b border-border/50 px-5 py-4 dark:border-white/[0.08]">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400/90" aria-hidden />
            <span className="size-2.5 rounded-full bg-amber-400/90" aria-hidden />
            <span className="size-2.5 rounded-full bg-emerald-500/85" aria-hidden />
          </div>
          <div className="ml-2 flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
              {BRAND_LOGO_MONOGRAM}
            </div>
            <p className="truncate font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {BRAND_NAME}
            </p>
          </div>
        </div>
        <div className="relative divide-y divide-border/45 dark:divide-white/[0.07]">
          {STEPS.map((s) => (
            <div key={s.label} className="flex items-start gap-4 px-5 py-5 sm:px-6 sm:py-6">
              <span className="mt-0.5 w-[4.5rem] shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {s.label}
              </span>
              <p className="text-[15px] font-medium leading-relaxed text-foreground sm:text-base">{s.line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
