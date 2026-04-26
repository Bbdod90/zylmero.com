import Link from "next/link";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CustomerReadiness, ReadinessTone } from "@/lib/dashboard/readiness";

function ToneIcon({ tone }: { tone: ReadinessTone }) {
  if (tone === "good") {
    return (
      <CheckCircle2
        className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
        strokeWidth={2}
        aria-hidden
      />
    );
  }
  if (tone === "warn") {
    return (
      <AlertCircle
        className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
        strokeWidth={2}
        aria-hidden
      />
    );
  }
  return (
    <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={2} aria-hidden />
  );
}

export function CustomerReadinessHero({
  readiness,
  demoMode,
}: {
  readiness: CustomerReadiness;
  demoMode: boolean;
}) {
  const title =
    readiness.percent >= 92 && !demoMode
      ? "Je vangnet staat goed — blijf berichten opvolgen"
      : "Je mist nu nog klanten — zet je systeem live";

  return (
    <div
      className={cn(
        "rounded-[1.25rem] border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-card to-card p-5 shadow-md sm:p-7",
        "dark:border-primary/35 dark:from-primary/[0.16] dark:via-[hsl(222_28%_11%/0.96)] dark:to-[hsl(228_32%_9%/0.92)]",
      )}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Controlepaneel</p>
      <h2 className="mt-2 text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">{title}</h2>

      <ul className="mt-5 space-y-3" aria-label="Status van je kanalen">
        {readiness.rows.map((row) => (
          <li key={row.id} className="flex items-start gap-3 text-sm leading-snug text-foreground/95">
            <ToneIcon tone={row.tone} />
            <span>{row.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs font-semibold text-muted-foreground">
          <span>Voortgang</span>
          <span className="tabular-nums text-foreground">{readiness.percent}% klaar om klanten te ontvangen</span>
        </div>
        <div
          className="mt-2 h-3 overflow-hidden rounded-full border border-border/40 bg-muted/80 shadow-inner dark:border-white/[0.08]"
          role="progressbar"
          aria-valuenow={readiness.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/85 shadow-sm transition-[width] duration-500 ease-out"
            style={{ width: `${readiness.percent}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          asChild
          size="lg"
          className="h-12 rounded-xl px-8 text-base font-semibold shadow-lg transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Link href="/dashboard/ai-koppelingen">Start met klanten ontvangen</Link>
        </Button>
        {demoMode ? (
          <p className="text-xs text-muted-foreground">Demo: met een echt account stel je dit zelf in.</p>
        ) : null}
      </div>
    </div>
  );
}
