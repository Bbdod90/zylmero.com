"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { enterAnonymousDemo } from "@/actions/demo";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Maandelijks bereik gemiste omzet (conservatieve spreiding). */
function missedRangeEur(leadsPerWeek: number, avgJobEur: number) {
  const m = Math.max(0, leadsPerWeek) * 4 * Math.max(0, avgJobEur);
  const low = Math.round(m * 0.26);
  const high = Math.round(m * 0.44);
  return { low, high };
}

/** Mogelijke extra omzet bij snellere opvolging (fractie van gemiste kans). */
function extraRangeEur(leadsPerWeek: number, avgJobEur: number) {
  const m = Math.max(0, leadsPerWeek) * 4 * Math.max(0, avgJobEur);
  const low = Math.round(m * 0.12);
  const high = Math.round(m * 0.28);
  return { low, high };
}

function RangeField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <span className="text-sm font-bold tabular-nums text-primary">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="cf-range h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </div>
  );
}

export function RoiLossCalculator() {
  const [leads, setLeads] = useState(15);
  const [job, setJob] = useState(180);

  const missed = useMemo(() => missedRangeEur(leads, job), [leads, job]);
  const extra = useMemo(() => extraRangeEur(leads, job), [leads, job]);

  return (
    <section className="border-b border-border/50 py-16 dark:border-white/5 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            ROI-calculator
          </p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Dit kost je nu geld — elke maand opnieuw
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
            Pas aanvragen en gemiddelde klus aan. Zie wat traagheid en gemiste
            opvolging aan euro’s kosten — en wat sneller reageren kan opleveren.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col justify-between rounded-[1.35rem] border border-white/[0.08] bg-gradient-to-b from-card to-secondary/[0.03] p-6 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="space-y-8">
              <RangeField
                id="cf-roi-leads"
                label="Aanvragen per week"
                value={leads}
                onChange={(n) => setLeads(clamp(Math.round(n), 1, 120))}
                min={1}
                max={80}
                step={1}
                suffix=""
              />
              <RangeField
                id="cf-roi-job"
                label="Gemiddelde klusprijs (€)"
                value={job}
                onChange={(n) => setJob(clamp(Math.round(n / 5) * 5, 25, 5000))}
                min={25}
                max={800}
                step={5}
                suffix=" €"
              />
            </div>
            <p className="mt-8 text-xs font-medium leading-relaxed text-muted-foreground">
              Gebaseerd op realistische bandbreedtes — geen garantie, wél een harde
              spiegel voor wat traagheid kost.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-1 flex-col justify-center rounded-[1.35rem] border border-destructive/25 bg-gradient-to-br from-destructive/[0.1] to-transparent p-6 shadow-[0_0_48px_-20px_rgba(220,38,38,0.35)] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-destructive/95">
                Geschatte gemiste omzet / mnd
              </p>
              <p className="mt-4 text-3xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-5xl">
                {formatCurrency(missed.low)} – {formatCurrency(missed.high)}
              </p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                Zelfs één extra opdracht per maand kan dit al overstijgen — laat staan
                wat je verliest als leads blijven hangen.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-center rounded-[1.35rem] border border-primary/30 bg-gradient-to-br from-primary/[0.12] to-primary/[0.04] p-6 shadow-[0_0_56px_-18px_hsl(var(--primary)/0.45)] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Extra te verzilveren omzet / mnd
              </p>
              <p className="mt-4 text-3xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-5xl">
                {formatCurrency(extra.low)} – {formatCurrency(extra.high)}
              </p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                Snellere opvolging betekent vaker ‘ja’ vóór de concurrent — dit is een
                realistische bandbreedte, geen belofte.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-2xl px-8 text-base font-bold shadow-lg shadow-primary/20"
          >
            <Link href="/signup">Start — pak je eerste klant</Link>
          </Button>
          <form action={enterAnonymousDemo} className="flex-1 sm:flex-initial">
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-2xl border-2 px-8 text-base font-bold"
            >
              Zie hoe het werkt
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
