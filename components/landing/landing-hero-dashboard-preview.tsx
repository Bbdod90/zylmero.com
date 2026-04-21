"use client";

import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const ROWS = [
  { who: "Nieuwe aanvraag", ch: "Web", t: "2m", st: "Nieuw" },
  { who: "WhatsApp", ch: "App", t: "4m", st: "Beantwoord" },
  { who: "Offerte", ch: "Mail", t: "1u", st: "Follow-up" },
] as const;

export function LandingHeroDashboardPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="pointer-events-none absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-90 blur-2xl dark:from-primary/30"
        aria-hidden
      />
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.25rem] border border-border/60 bg-card shadow-[0_32px_80px_-48px_rgb(15_23_42/0.45),inset_0_1px_0_0_rgb(255_255_255/0.5)]",
          "dark:border-white/[0.1] dark:bg-[hsl(222_32%_8%)] dark:shadow-[0_40px_100px_-50px_rgb(0_0_0/0.75),inset_0_1px_0_0_rgb(255_255_255/0.04)]",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-b from-muted/50 to-transparent px-4 py-3.5 dark:border-white/[0.08] dark:from-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400/90" />
              <span className="size-2.5 rounded-full bg-amber-400/90" />
              <span className="size-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="ml-1 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <p className="text-sm font-semibold tracking-tight text-foreground">{BRAND_NAME}</p>
            </div>
          </div>
          <span className="hidden rounded-md border border-border/50 bg-background/80 px-2.5 py-1 font-mono text-[10px] font-medium text-muted-foreground sm:inline dark:border-white/[0.08] dark:bg-white/[0.03]">
            Live
          </span>
        </div>

        <div className="flex">
          <aside className="hidden w-[38%] shrink-0 border-r border-border/45 bg-muted/25 py-4 pl-4 pr-3 dark:border-white/[0.06] dark:bg-black/20 sm:block">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workspace</p>
            <nav className="mt-4 space-y-1">
              {["Inbox", "Leads", "Afspraken"].map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-lg px-2.5 py-2 text-[13px] font-medium",
                    i === 0 ? "bg-primary/12 text-primary" : "text-muted-foreground",
                  )}
                >
                  {label}
                </div>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1 py-4 pl-4 pr-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pipeline</p>
                <p className="mt-1 text-[15px] font-semibold text-foreground">Vandaag</p>
              </div>
              <div className="flex gap-3">
                <span className="rounded-lg border border-border/55 bg-background/70 px-3 py-2 text-xs font-semibold tabular-nums shadow-sm dark:border-white/[0.09] dark:bg-white/[0.03]">
                  Warm <span className="text-primary">8</span>
                </span>
                <span className="rounded-lg border border-border/55 bg-background/70 px-3 py-2 text-xs font-semibold tabular-nums shadow-sm dark:border-white/[0.09] dark:bg-white/[0.03]">
                  Nieuw <span className="text-primary">5</span>
                </span>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-border/45 dark:border-white/[0.07]">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 border-b border-border/45 bg-muted/35 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground dark:border-white/[0.06] dark:bg-white/[0.03]">
                <span>Klant</span>
                <span>Kanaal</span>
                <span>Tijd</span>
                <span className="text-right">Status</span>
              </div>
              {ROWS.map((r) => (
                <div
                  key={r.who}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 border-b border-border/35 px-3 py-2.5 text-[13px] last:border-0 dark:border-white/[0.05]"
                >
                  <span className="truncate font-medium text-foreground">{r.who}</span>
                  <span className="font-mono text-[11px] uppercase text-muted-foreground">{r.ch}</span>
                  <span className="tabular-nums text-muted-foreground">{r.t}</span>
                  <span className="text-right">
                    <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/15 dark:bg-primary/15">
                      {r.st}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-border/55 bg-muted/15 px-4 py-4 dark:border-white/[0.09] dark:bg-white/[0.02]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Volgende stap</p>
              <p className="mt-2 text-[13px] leading-snug text-foreground">
                Serieuze leads eerst · afspraak automatisch voorstellen · jij sluit af
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
