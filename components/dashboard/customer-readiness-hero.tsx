import Link from "next/link";
import { AlertCircle, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CustomerReadiness, ReadinessTone } from "@/lib/dashboard/readiness";

function ToneIcon({ tone }: { tone: ReadinessTone }) {
  if (tone === "good") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/25">
        <CheckCircle2 className="size-[1.125rem]" strokeWidth={2.25} aria-hidden />
      </span>
    );
  }
  if (tone === "warn") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-200 dark:ring-amber-400/30">
        <AlertCircle className="size-[1.125rem]" strokeWidth={2.25} aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-200 dark:ring-rose-400/25">
      <XCircle className="size-[1.125rem]" strokeWidth={2.25} aria-hidden />
    </span>
  );
}

export function CustomerReadinessHero({
  readiness,
  demoMode,
}: {
  readiness: CustomerReadiness;
  demoMode: boolean;
}) {
  const nearlyThere = readiness.percent >= 88 && !demoMode;
  const title = nearlyThere
    ? "Je bent er bijna — houd je vangnet strak"
    : "Zet je vangnet compleet — mis geen aanvraag";

  const subtitle = nearlyThere
    ? "Nog een paar stappen en elke beller, bezoeker of mailtje landt netjes bij jou."
    : "Elk vinkje hieronder is een plek waar klanten je nu nog mislopen. Werk ze weg en je inbox gaat voor je vullen.";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border border-border/55 bg-card p-6 shadow-[0_32px_80px_-48px_hsl(222_47%_11%/0.35),0_1px_0_0_hsl(0_0%_100%/0.8)_inset] sm:p-8",
        "dark:border-white/[0.1] dark:bg-[linear-gradient(165deg,hsl(222_30%_12%/0.98)_0%,hsl(225_32%_9%/0.99)_45%,hsl(228_34%_8%)_100%)] dark:shadow-[0_40px_90px_-48px_rgb(0_0_0/0.55),0_1px_0_0_hsl(220_14%_18%/0.5)_inset]",
      )}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-primary/[0.09] blur-3xl dark:bg-primary/[0.14]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-indigo-400/[0.06] blur-3xl dark:bg-indigo-400/[0.1]"
        aria-hidden
      />

      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary dark:border-primary/25 dark:bg-primary/[0.1]">
          <Sparkles className="size-3.5 opacity-90" aria-hidden />
          Start hier
        </div>
      </div>

      <h2 className="relative mt-4 max-w-3xl text-2xl font-semibold leading-[1.15] tracking-[-0.035em] text-foreground sm:text-[1.75rem] sm:leading-tight">
        {title}
      </h2>
      <p className="relative mt-3 max-w-2xl text-sm font-medium leading-relaxed text-foreground/68 sm:text-[0.9375rem]">
        {subtitle}
      </p>

      <ul className="relative mt-8 grid gap-2.5 sm:gap-3" aria-label="Status van je kanalen">
        {readiness.rows.map((row) => (
          <li
            key={row.id}
            className="flex items-start gap-3.5 rounded-2xl border border-border/45 bg-background/75 px-4 py-3.5 shadow-sm backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]"
          >
            <ToneIcon tone={row.tone} />
            <span className="min-w-0 pt-1 text-[0.9375rem] font-medium leading-snug text-foreground/95">
              {row.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="relative mt-8 rounded-2xl border border-border/40 bg-muted/30 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Klaar voor nieuwe klanten
          </span>
          <span className="text-lg font-semibold tabular-nums tracking-tight text-foreground">
            {readiness.percent}%
          </span>
        </div>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
          Hoe hoger dit getal, hoe minder je zelf nog hoeft na te jagen op leads.
        </p>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-background/90 ring-1 ring-border/50 dark:bg-black/25 dark:ring-white/[0.08]"
          role="progressbar"
          aria-valuenow={readiness.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-indigo-600/90 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.55)] transition-[width] duration-700 ease-out dark:to-indigo-400/80"
            style={{ width: `${readiness.percent}%` }}
          />
        </div>
      </div>

      <div className="relative mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          size="lg"
          className="h-12 rounded-2xl px-8 text-[0.9375rem] font-semibold shadow-[0_12px_32px_-16px_hsl(var(--primary)/0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-14px_hsl(var(--primary)/0.5)] active:translate-y-0"
        >
          <Link href="/dashboard/ai-koppelingen">Volgende stap: kanalen afronden</Link>
        </Button>
        {demoMode ? (
          <p className="max-w-sm text-xs font-medium leading-relaxed text-muted-foreground">
            In je echte account stel je dit zelf in — dan zijn deze regels live voor jouw bedrijf.
          </p>
        ) : null}
      </div>
    </div>
  );
}
