import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

/**
 * Hero: pipelinewaarde — premium visuele laag (raster, gloed, KPI-chips).
 */
export function DashboardRevenueHero({
  amountLabel,
  chipItems,
}: {
  amountLabel: string;
  /** Korte stats onder de titel, bv. aantal leads */
  chipItems: { label: string; value: string }[];
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60 shadow-[0_28px_100px_-52px_rgb(0_0_0/0.55)] dark:border-white/[0.1] dark:shadow-[0_32px_110px_-56px_rgb(0_0_0/0.72)]",
        "bg-gradient-to-br from-card via-card to-muted/30 dark:from-white/[0.06] dark:via-[hsl(222_28%_6%)] dark:to-black/50",
      )}
      aria-labelledby="dashboard-revenue-heading"
    >
      {/* Raster + gloed */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.45]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.14) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-0 size-[28rem] rounded-full bg-primary/[0.09] blur-3xl dark:bg-primary/[0.14]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-0 size-[20rem] rounded-full bg-violet-500/[0.06] blur-3xl dark:bg-violet-500/[0.1]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="relative px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-11">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.1] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="size-3" aria-hidden />
            {BRAND_NAME} workspace
          </span>
        </div>

        <div className="mt-5 max-w-2xl space-y-2">
          <h2
            id="dashboard-revenue-heading"
            className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl md:leading-[1.15]"
          >
            Hier verdien je geld
          </h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Som van de ingeschatte waarde van al je leads in de pipeline — plus
            je belangrijkste gesprekken en afspraken eronder.
          </p>
        </div>

        {chipItems.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {chipItems.map((c) => (
              <div
                key={c.label}
                className="rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs backdrop-blur-sm dark:border-white/[0.08] dark:bg-black/25"
              >
                <span className="text-muted-foreground">{c.label}</span>
                <span className="ml-2 font-semibold tabular-nums text-foreground">
                  {c.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <p
          className={cn(
            "mt-6 bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-4xl font-bold tabular-nums tracking-tight text-transparent sm:mt-7 sm:text-5xl md:text-6xl md:leading-[1.05]",
            "dark:from-white dark:via-white dark:to-primary/75",
          )}
        >
          {amountLabel}
        </p>

        <div className="mt-8 flex flex-wrap gap-2.5 sm:mt-9 sm:gap-3">
          <Button
            size="default"
            className="h-11 rounded-full px-6 text-sm font-semibold shadow-lg shadow-primary/25"
            asChild
          >
            <Link href="/dashboard/inbox">
              Inbox
              <ArrowRight className="ml-1.5 size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="default"
            className="h-11 rounded-full border-border/80 bg-background/50 px-6 text-sm font-semibold backdrop-blur-md dark:border-white/[0.12] dark:bg-white/[0.04]"
            asChild
          >
            <Link href="/dashboard/pipeline">Pipeline</Link>
          </Button>
          <Button
            variant="outline"
            size="default"
            className="h-11 rounded-full border-border/80 bg-background/50 px-6 text-sm font-semibold backdrop-blur-md dark:border-white/[0.12] dark:bg-white/[0.04]"
            asChild
          >
            <Link href="/dashboard/leads">Alle leads</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
