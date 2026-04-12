"use client";

import { DemoSituationMenu } from "@/components/landing/demo-situation-menu";
import { useDemoRole } from "@/components/landing/demo-role-context";
import { getHeroMockConversation } from "@/lib/demo/hero-mock-copy";
import { cn } from "@/lib/utils";
import { DEMO_UNIVERSAL_BRAND, demoUniversalMonogram } from "@/lib/demo/demo-brand";

export function HeroInboxMock() {
  const { demoRole } = useDemoRole();
  const { threads, customerMsg, replyMsg, autoLabel } = getHeroMockConversation(demoRole);

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="overflow-hidden rounded-[1.35rem] border border-border/50 bg-gradient-to-b from-card/98 to-zinc-950/92 shadow-[0_20px_56px_-28px_rgba(0,0,0,0.55)] ring-1 ring-black/[0.04] backdrop-blur-xl dark:border-white/[0.08] dark:from-zinc-900/96 dark:to-zinc-950/98 dark:ring-white/[0.05]"
        style={{ minHeight: 432 }}
      >
        <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3 py-3 sm:px-4 sm:py-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 text-xs font-bold tracking-tight text-primary-foreground">
              {demoUniversalMonogram()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {DEMO_UNIVERSAL_BRAND.shortName}
              </p>
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                {DEMO_UNIVERSAL_BRAND.legalName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <DemoSituationMenu variant="compact" align="end" />
            <span className="rounded-full border border-primary/25 bg-primary/12 px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-primary shadow-[0_0_20px_-6px_hsl(var(--primary)/0.55)]">
              €1.940 mogelijk vandaag
            </span>
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
              Openstaand rond €11,2k
            </span>
          </div>
        </div>

        <div className="space-y-2 border-b border-white/[0.05] p-3">
          <p className="px-1 text-2xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Wat nu telt
          </p>
          {threads.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2.5 transition-colors",
                i === 0
                  ? "border-primary/25 bg-primary/[0.07]"
                  : "border-white/[0.06] bg-white/[0.02]",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{t.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{t.preview}</p>
              </div>
              <div className="ml-2 flex shrink-0 flex-col items-end gap-0.5">
                <span className="text-xs font-bold tabular-nums text-primary">{t.value}</span>
                {t.hot ? (
                  <span className="text-[9px] font-semibold uppercase text-amber-400/95">spoed</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-2xl rounded-tl-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
            <p className="text-[10px] font-medium text-muted-foreground">Klant</p>
            <p className="text-sm leading-relaxed text-foreground">{customerMsg}</p>
          </div>

          <div className="rounded-2xl rounded-tr-md border border-primary/20 bg-primary/[0.08] px-3 py-2.5">
            <p className="text-[10px] font-medium text-primary">{autoLabel}</p>
            <p className="text-sm leading-relaxed text-foreground">{replyMsg}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
