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
        className={cn(
          "overflow-hidden rounded-[1.35rem] shadow-xl",
          /* Licht: echte card — geen zwart gat op witte pagina */
          "border border-border/70 bg-card text-foreground shadow-[0_24px_52px_-28px_hsl(222_48%_32%/0.14),0_0_0_1px_hsl(var(--border)/0.35)]",
          /* Donker: compacte app-chrome */
          "dark:border-white/[0.08] dark:bg-[#0c0f14] dark:text-white dark:shadow-[0_20px_56px_-28px_rgba(0,0,0,0.55)] dark:ring-1 dark:ring-white/[0.06]",
        )}
        style={{ minHeight: 432 }}
      >
        <div
          className={cn(
            "flex items-start justify-between gap-2 border-b px-3 py-3 sm:px-4 sm:py-3.5",
            "border-border/60 bg-gradient-to-b from-muted/50 to-muted/20",
            "dark:border-white/[0.06] dark:from-transparent dark:to-transparent dark:bg-white/[0.02]",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 text-xs font-bold tracking-tight text-primary-foreground">
              {demoUniversalMonogram()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground dark:text-white">
                {DEMO_UNIVERSAL_BRAND.shortName}
              </p>
              <p className="truncate text-sm font-semibold tracking-tight text-foreground dark:text-white">
                {DEMO_UNIVERSAL_BRAND.legalName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <DemoSituationMenu variant="compact" align="end" />
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-extrabold tabular-nums shadow-[0_0_20px_-6px_hsl(var(--primary)/0.45)]",
                "border-primary/30 bg-primary/10 text-foreground",
                "dark:border-white/20 dark:bg-white/10 dark:text-white",
              )}
            >
              €1.940 mogelijk vandaag
            </span>
            <span className="text-[10px] font-bold tabular-nums text-foreground dark:text-white">
              Openstaand rond €11,2k
            </span>
          </div>
        </div>

        <div
          className={cn(
            "space-y-2 border-b p-3",
            "border-border/50 bg-muted/15",
            "dark:border-white/[0.05] dark:bg-transparent",
          )}
        >
          <p className="px-1 text-2xs font-semibold uppercase tracking-[0.14em] text-foreground dark:text-white">
            Wat nu telt
          </p>
          {threads.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2.5 transition-colors",
                i === 0
                  ? "border-primary/25 bg-primary/[0.07] dark:border-primary/25 dark:bg-primary/[0.07]"
                  : "border-border/60 bg-background/80 dark:border-white/[0.06] dark:bg-white/[0.02]",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground dark:text-white">{t.name}</p>
                <p className="truncate text-[11px] text-foreground dark:text-white">{t.preview}</p>
              </div>
              <div className="ml-2 flex shrink-0 flex-col items-end gap-0.5">
                <span className="text-xs font-bold tabular-nums text-primary dark:text-white">{t.value}</span>
                {t.hot ? (
                  <span className="text-[9px] font-semibold uppercase text-primary dark:text-amber-300/95">
                    spoed
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 bg-gradient-to-b from-transparent to-muted/10 p-4 dark:from-transparent dark:to-transparent dark:bg-transparent">
          <div
            className={cn(
              "rounded-2xl rounded-tl-md border px-3 py-2.5",
              "border-border/70 bg-muted/35",
              "dark:border-white/[0.08] dark:bg-white/[0.03]",
            )}
          >
            <p className="text-[10px] font-medium text-foreground dark:text-white">Klant</p>
            <p className="text-sm leading-relaxed text-foreground dark:text-white">{customerMsg}</p>
          </div>

          <div
            className={cn(
              "rounded-2xl rounded-tr-md border px-3 py-2.5",
              "border-primary/20 bg-primary/[0.09]",
              "dark:border-primary/20 dark:bg-primary/[0.08]",
            )}
          >
            <p className="text-[10px] font-medium text-primary dark:text-white">{autoLabel}</p>
            <p className="text-sm leading-relaxed text-foreground dark:text-white">{replyMsg}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
