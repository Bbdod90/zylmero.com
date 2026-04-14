"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function missedRangeEur(leadsPerWeek: number, avgInvoiceEur: number) {
  const m = Math.max(0, leadsPerWeek) * 4 * Math.max(0, avgInvoiceEur);
  const low = Math.round(m * 0.26);
  const high = Math.round(m * 0.44);
  return { low, high };
}

export function LandingMissedRevenueEstimator({ className }: { className?: string }) {
  const [avgInvoice, setAvgInvoice] = useState(220);
  const [leadsPerWeek, setLeadsPerWeek] = useState(14);

  const missed = useMemo(
    () => missedRangeEur(leadsPerWeek, avgInvoice),
    [leadsPerWeek, avgInvoice],
  );

  const monthlyPotential = useMemo(
    () => Math.round(leadsPerWeek * 4 * avgInvoice),
    [leadsPerWeek, avgInvoice],
  );

  /** Zelfde getallen als de euro’s erboven: % = gemist ÷ maandomzetpotentie. */
  const missedLowPct = useMemo(() => {
    if (monthlyPotential <= 0) return 0;
    return Math.round((missed.low / monthlyPotential) * 100);
  }, [monthlyPotential, missed.low]);

  const missedHighPct = useMemo(() => {
    if (monthlyPotential <= 0) return 0;
    return Math.round((missed.high / monthlyPotential) * 100);
  }, [monthlyPotential, missed.high]);

  return (
    <div
      className={cn(
        "mx-auto max-w-lg rounded-2xl border border-border/50 bg-card/80 p-5 shadow-[0_12px_40px_-24px_hsl(var(--primary)/0.18)] ring-1 ring-primary/[0.06] backdrop-blur-sm dark:border-white/[0.08] dark:bg-card/50 md:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/15 dark:bg-primary/18">
          <Sparkles className="size-4" aria-hidden strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-tight tracking-tight text-foreground md:text-xl">
            Wat traagheid kost <span className="text-primary">(indicatie)</span>
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-4 border-t border-border/40 pt-5 dark:border-white/[0.08]">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="zm-est-invoice" className="text-xs font-medium text-foreground md:text-sm">
              Gem. factuur / offerte
            </label>
            <span className="text-xs font-bold tabular-nums text-foreground md:text-sm">
              {formatCurrency(avgInvoice)}
            </span>
          </div>
          <input
            id="zm-est-invoice"
            type="range"
            min={40}
            max={8000}
            step={5}
            value={avgInvoice}
            onChange={(e) =>
              setAvgInvoice(clamp(Math.round(Number(e.target.value) / 5) * 5, 40, 8000))
            }
            className="cf-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="zm-est-leads" className="text-xs font-medium text-foreground md:text-sm">
              Aanvragen per week
            </label>
            <span className="text-xs font-bold tabular-nums text-foreground md:text-sm">
              {leadsPerWeek}
            </span>
          </div>
          <input
            id="zm-est-leads"
            type="range"
            min={1}
            max={60}
            step={1}
            value={leadsPerWeek}
            onChange={(e) => setLeadsPerWeek(clamp(Number(e.target.value), 1, 60))}
            className="cf-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] to-transparent px-4 py-4 dark:from-primary/[0.1]">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-foreground">
          Geschat gemist / maand
        </p>
        <p className="mt-1 text-xl font-extrabold tabular-nums tracking-tight text-foreground md:text-2xl">
          {formatCurrency(missed.low)} – {formatCurrency(missed.high)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          ~{missedLowPct}%–{missedHighPct}% van ca.{" "}
          <span className="tabular-nums text-foreground">{formatCurrency(monthlyPotential)}</span>{" "}
          maandomzetpotentie
        </p>

        <div className="mt-3" role="img" aria-label="Verhouding gemiste omzet tot maandomzetpotentie">
          <div className="relative h-4 w-full overflow-hidden rounded-full border border-border/50 bg-primary/20 dark:bg-primary/15">
            <div
              className="absolute inset-y-0 left-0 rounded-l-full bg-gradient-to-r from-destructive/90 to-destructive/75 transition-[width] duration-300 ease-out"
              style={{ width: `${missedHighPct}%` }}
            />
            {missedLowPct > 0 && missedLowPct < 100 ? (
              <div
                className="absolute inset-y-0 w-px bg-foreground/80 shadow-[0_0_0_1px_hsl(var(--background))]"
                style={{ left: `${missedLowPct}%`, transform: "translateX(-50%)" }}
                title={`Ondergrens ${formatCurrency(missed.low)} (${missedLowPct}%)`}
              />
            ) : null}
          </div>
          <p className="mt-1.5 text-[0.65rem] text-muted-foreground">Rood = geschat gemist · licht = rest potentieel</p>
        </div>
      </div>

      <p className="mt-3 text-[0.65rem] text-muted-foreground md:text-xs">Indicatief — geen garantie.</p>
    </div>
  );
}
