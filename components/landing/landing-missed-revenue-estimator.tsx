"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type TouchEvent,
} from "react";
import { Sparkles, TrendingDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const VAT = 0.21;
/** Stap voor de schuifbalk “Gem. waarde (factuur/offerte)” */
const INVOICE_SLIDER_STEP = 25;
/** Maximum gemiddelde waarde excl. BTW — zelfde band voor incl. (omgerekend) */
const MAX_AVG_EXCL = 5000;
const MIN_AVG_EXCL = 40;
const MAX_LEADS_PER_WEEK = 50;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function roundStep(n: number, step: number) {
  return Math.round(n / step) * step;
}

/** Hoogste waarde ≤ rawMax die op het rooster vanaf min ligt (stappen van step). */
function alignMaxToStepGrid(min: number, rawMax: number, step: number) {
  if (rawMax <= min) return min;
  return min + Math.floor((rawMax - min) / step) * step;
}

/** Snapt v naar het dichtstbijzijnde roosterpunt tussen min en max (zoals type=range). */
function snapInvoiceToGrid(v: number, min: number, max: number, step: number) {
  const snapped = min + Math.round((v - min) / step) * step;
  return clamp(snapped, min, max);
}

function readLiveRange(el: HTMLInputElement, apply: (raw: number) => void) {
  const n = Number(el.value);
  if (!Number.isNaN(n)) apply(n);
}

function missedRangeEur(leadsPerWeek: number, avgInvoice: number) {
  const m = Math.max(0, leadsPerWeek) * 4 * Math.max(0, avgInvoice);
  const low = Math.round(m * 0.26);
  const high = Math.round(m * 0.44);
  return { low, high };
}

type EditableMetricChipProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  formatDisplay: (n: number) => string;
  onCommit: (n: number) => void;
  buttonClassName: string;
  inputClassName: string;
  ariaLabel: string;
};

function EditableMetricChip({
  value,
  min,
  max,
  step,
  formatDisplay,
  onCommit,
  buttonClassName,
  inputClassName,
  ariaLabel,
}: EditableMetricChipProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!open) return;
    setDraft(String(valueRef.current));
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const finish = useCallback(() => {
    const digits = draft.replace(/\D/g, "");
    if (digits === "") {
      onCommit(value);
      } else {
        let n = parseInt(digits, 10);
        if (Number.isNaN(n)) {
          onCommit(value);
        } else {
          const snapped = min + Math.round((n - min) / step) * step;
          onCommit(clamp(snapped, min, max));
        }
      }
    setOpen(false);
  }, [draft, value, onCommit, min, max, step]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setDraft(String(valueRef.current));
      setOpen(false);
    }
  };

  if (open) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="done"
        aria-label={ariaLabel}
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onBlur={finish}
        onKeyDown={onKeyDown}
        className={inputClassName}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`${ariaLabel}: ${formatDisplay(value)}. Tik om zelf een getal in te vullen.`}
      onClick={() => setOpen(true)}
      className={buttonClassName}
    >
      {formatDisplay(value)}
    </button>
  );
}

export function LandingMissedRevenueEstimator({ className }: { className?: string }) {
  const [inclBtw, setInclBtw] = useState(false);
  const [avgInvoice, setAvgInvoice] = useState(() => {
    const min = MIN_AVG_EXCL;
    const max = alignMaxToStepGrid(min, MAX_AVG_EXCL, INVOICE_SLIDER_STEP);
    return snapInvoiceToGrid(220, min, max, INVOICE_SLIDER_STEP);
  });
  const [leadsPerWeek, setLeadsPerWeek] = useState(() =>
    clamp(14, 1, MAX_LEADS_PER_WEEK),
  );

  const minAvg = useMemo(
    () =>
      inclBtw
        ? roundStep(MIN_AVG_EXCL * (1 + VAT), INVOICE_SLIDER_STEP)
        : MIN_AVG_EXCL,
    [inclBtw],
  );

  const maxAvg = useMemo(() => {
    const rawMax = inclBtw
      ? roundStep(MAX_AVG_EXCL * (1 + VAT), INVOICE_SLIDER_STEP)
      : MAX_AVG_EXCL;
    return alignMaxToStepGrid(minAvg, rawMax, INVOICE_SLIDER_STEP);
  }, [inclBtw, minAvg]);

  useEffect(() => {
    setAvgInvoice((v) =>
      snapInvoiceToGrid(v, minAvg, maxAvg, INVOICE_SLIDER_STEP),
    );
  }, [minAvg, maxAvg]);

  const setInclBtwAndConvert = useCallback(
    (next: boolean) => {
      if (next === inclBtw) return;
      if (next) {
        const nextMin = roundStep(MIN_AVG_EXCL * (1 + VAT), INVOICE_SLIDER_STEP);
        const nextMaxRaw = roundStep(
          MAX_AVG_EXCL * (1 + VAT),
          INVOICE_SLIDER_STEP,
        );
        const nextMax = alignMaxToStepGrid(
          nextMin,
          nextMaxRaw,
          INVOICE_SLIDER_STEP,
        );
        setAvgInvoice((v) =>
          snapInvoiceToGrid(
            v * (1 + VAT),
            nextMin,
            nextMax,
            INVOICE_SLIDER_STEP,
          ),
        );
      } else {
        const maxExcl = alignMaxToStepGrid(
          MIN_AVG_EXCL,
          MAX_AVG_EXCL,
          INVOICE_SLIDER_STEP,
        );
        setAvgInvoice((v) =>
          snapInvoiceToGrid(
            v / (1 + VAT),
            MIN_AVG_EXCL,
            maxExcl,
            INVOICE_SLIDER_STEP,
          ),
        );
      }
      setInclBtw(next);
    },
    [inclBtw],
  );

  const setInvoiceFromSlider = useCallback(
    (raw: number) => {
      setAvgInvoice(
        snapInvoiceToGrid(raw, minAvg, maxAvg, INVOICE_SLIDER_STEP),
      );
    },
    [minAvg, maxAvg],
  );

  const setLeadsFromSlider = useCallback((raw: number) => {
    setLeadsPerWeek(clamp(Math.round(raw), 1, MAX_LEADS_PER_WEEK));
  }, []);

  const missed = useMemo(
    () => missedRangeEur(leadsPerWeek, avgInvoice),
    [leadsPerWeek, avgInvoice],
  );

  const monthlyPotential = useMemo(
    () => Math.round(leadsPerWeek * 4 * avgInvoice),
    [leadsPerWeek, avgInvoice],
  );

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
        "relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-[0_24px_80px_-40px_hsl(var(--primary)/0.35),0_0_0_1px_hsl(var(--primary)/0.06)] backdrop-blur-md dark:border-white/[0.1] dark:bg-[linear-gradient(165deg,hsl(222_26%_9%/0.92),hsl(222_28%_6%/0.88))] dark:shadow-[0_28px_90px_-48px_rgb(0_0_0/0.65)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-[22rem] rounded-full bg-primary/[0.12] blur-3xl dark:bg-primary/[0.18]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 size-[18rem] rounded-full bg-violet-500/[0.08] blur-3xl dark:bg-violet-500/[0.12]"
        aria-hidden
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-1 gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 text-primary shadow-inner-soft ring-1 ring-primary/20 dark:from-primary/30 dark:to-primary/10">
              <Sparkles className="size-5" aria-hidden strokeWidth={1.75} />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Calculator
              </p>
              <h2 className="text-balance text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Wat je gemiddeld misloopt{" "}
                <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent dark:from-primary dark:to-violet-400">
                  (indicatie)
                </span>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Sleep de schuifbalken of tik op een waarde om zelf een getal in te
                vullen.
              </p>
            </div>
          </div>

          <div
            className="flex shrink-0 flex-col gap-1.5 sm:items-end"
            role="group"
            aria-label="Weergave met of zonder BTW"
          >
            <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
              Bedragen
            </span>
            <div className="inline-flex rounded-full border border-border/70 bg-muted/40 p-1 shadow-inner dark:border-white/[0.1] dark:bg-black/25">
              <button
                type="button"
                onClick={() => setInclBtwAndConvert(false)}
                className={cn(
                  "min-h-9 rounded-full px-4 text-xs font-semibold transition-all",
                  !inclBtw
                    ? "bg-background text-foreground shadow-sm dark:bg-white/[0.12]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Excl. BTW
              </button>
              <button
                type="button"
                onClick={() => setInclBtwAndConvert(true)}
                className={cn(
                  "min-h-9 rounded-full px-4 text-xs font-semibold transition-all",
                  inclBtw
                    ? "bg-background text-foreground shadow-sm dark:bg-white/[0.12]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Incl. BTW
              </button>
            </div>
            <p className="text-[0.65rem] text-muted-foreground sm:text-right">
              {inclBtw ? "21% BTW — alle euro’s hieronder incl." : "Alle euro’s exclusief BTW."}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 border-t border-border/50 pt-8 dark:border-white/[0.08] sm:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <label
                  htmlFor="zm-est-invoice"
                  className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground"
                >
                  Gem. waarde (factuur/offerte)
                </label>
                <EditableMetricChip
                  value={avgInvoice}
                  min={minAvg}
                  max={maxAvg}
                  step={INVOICE_SLIDER_STEP}
                  formatDisplay={formatCurrency}
                  onCommit={setAvgInvoice}
                  ariaLabel="Gemiddelde waarde van factuur of offerte in euro’s"
                  buttonClassName="shrink-0 whitespace-nowrap rounded-lg bg-primary/10 px-2.5 py-1 text-right text-sm font-bold tabular-nums text-primary ring-1 ring-primary/15 transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  inputClassName="min-w-[7.5rem] max-w-[12rem] rounded-lg border border-primary/30 bg-background px-2.5 py-1 text-right text-sm font-bold tabular-nums text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <input
                id="zm-est-invoice"
                type="range"
                min={minAvg}
                max={maxAvg}
                step={INVOICE_SLIDER_STEP}
                value={avgInvoice}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setInvoiceFromSlider(Number(e.currentTarget.value))
                }
                onInput={(e: FormEvent<HTMLInputElement>) =>
                  setInvoiceFromSlider(Number(e.currentTarget.value))
                }
                onTouchMove={(e: TouchEvent<HTMLInputElement>) =>
                  readLiveRange(e.currentTarget, setInvoiceFromSlider)
                }
                onMouseMove={(e: MouseEvent<HTMLInputElement>) => {
                  if (e.buttons === 1) {
                    readLiveRange(e.currentTarget, setInvoiceFromSlider);
                  }
                }}
                aria-valuemin={minAvg}
                aria-valuemax={maxAvg}
                aria-valuenow={avgInvoice}
                className="cf-range-touch w-full"
              />
              <p className="text-[0.7rem] text-muted-foreground">
                {formatCurrency(minAvg)} – {formatCurrency(maxAvg)}
                {inclBtw ? " · incl. 21% BTW" : " · excl. BTW"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <label
                  htmlFor="zm-est-leads"
                  className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground"
                >
                  Aanvragen per week
                </label>
                <EditableMetricChip
                  value={leadsPerWeek}
                  min={1}
                  max={MAX_LEADS_PER_WEEK}
                  step={1}
                  formatDisplay={(n) => String(n)}
                  onCommit={setLeadsPerWeek}
                  ariaLabel="Aantal aanvragen per week"
                  buttonClassName="shrink-0 whitespace-nowrap min-w-[2.75rem] rounded-lg bg-muted px-2.5 py-1 text-center text-sm font-bold tabular-nums text-foreground ring-1 ring-border/60 transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/[0.06] dark:ring-white/[0.08]"
                  inputClassName="w-14 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm font-bold tabular-nums text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <input
                id="zm-est-leads"
                type="range"
                min={1}
                max={MAX_LEADS_PER_WEEK}
                step={1}
                value={leadsPerWeek}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setLeadsFromSlider(Number(e.currentTarget.value))
                }
                onInput={(e: FormEvent<HTMLInputElement>) =>
                  setLeadsFromSlider(Number(e.currentTarget.value))
                }
                onTouchMove={(e: TouchEvent<HTMLInputElement>) =>
                  readLiveRange(e.currentTarget, setLeadsFromSlider)
                }
                onMouseMove={(e: MouseEvent<HTMLInputElement>) => {
                  if (e.buttons === 1) {
                    readLiveRange(e.currentTarget, setLeadsFromSlider);
                  }
                }}
                aria-valuemin={1}
                aria-valuemax={MAX_LEADS_PER_WEEK}
                aria-valuenow={leadsPerWeek}
                className="cf-range-touch w-full"
              />
              <p className="text-[0.7rem] text-muted-foreground">
                1 – {MAX_LEADS_PER_WEEK} aanvragen
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/[0.07] via-card/80 to-primary/[0.04] p-5 shadow-inner dark:border-destructive/25 dark:from-destructive/[0.12] dark:via-card/40 dark:to-primary/[0.06]">
            <div className="flex items-start gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive dark:bg-destructive/20">
                <TrendingDown className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-destructive dark:text-red-300">
                  Geschat gemist / maand
                </p>
                <p className="mt-2 text-2xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-3xl sm:leading-tight">
                  {formatCurrency(missed.low)} – {formatCurrency(missed.high)}
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              ~{missedLowPct}%–{missedHighPct}% van ±{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {formatCurrency(monthlyPotential)}
              </span>{" "}
              maandelijkse omzetpotentie
              {inclBtw ? " (incl. btw)." : " (excl. btw)."}
            </p>
            <p className="text-[0.7rem] leading-snug text-muted-foreground">
              In dit indicatieve model blijft die verhouding (ongeveer 26% tot 44%)
              gelijk; de bedragen in euro passen wél aan als je schuift of typt.
            </p>
          </div>
        </div>

        <p className="mt-6 border-t border-border/40 pt-5 text-center text-[0.7rem] text-muted-foreground dark:border-white/[0.06] md:text-xs">
          Indicatief model — geen garantie. BTW-aanname: 21%.
        </p>
      </div>
    </div>
  );
}
