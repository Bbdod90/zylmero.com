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
        className={cn(
          "overflow-hidden rounded-2xl border bg-card shadow-sm",
          "border-border/60 dark:border-white/[0.08]",
        )}
      >
        <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3 dark:border-white/[0.06]">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border dark:bg-white/15" aria-hidden />
            <span className="size-2.5 rounded-full bg-border dark:bg-white/15" aria-hidden />
            <span className="size-2.5 rounded-full bg-border dark:bg-white/15" aria-hidden />
          </div>
          <div className="ml-2 flex min-w-0 flex-1 items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
              {BRAND_LOGO_MONOGRAM}
            </div>
            <p className="truncate text-xs font-medium text-muted-foreground">{BRAND_NAME}</p>
          </div>
        </div>
        <div className="space-y-0 divide-y divide-border/50 dark:divide-white/[0.06]">
          {STEPS.map((s) => (
            <div key={s.label} className="flex items-start gap-4 px-5 py-5 sm:px-6 sm:py-6">
              <span className="mt-0.5 w-20 shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {s.label}
              </span>
              <p className="text-base font-medium leading-snug text-foreground sm:text-lg">{s.line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
