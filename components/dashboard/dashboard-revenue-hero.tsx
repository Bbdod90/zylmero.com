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
        "cf-dashboard-panel relative overflow-hidden rounded-2xl border border-border/60 shadow-[0_24px_70px_-44px_rgb(15_23_42/0.22)] dark:border-white/[0.1] dark:shadow-[0_28px_80px_-48px_rgb(0_0_0/0.65)]",
        "bg-gradient-to-br from-card via-card to-muted/25 dark:from-white/[0.05] dark:via-[hsl(222_28%_6%)] dark:to-black/45",
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
      <div className="relative px-6 py-8 sm:px-8 sm:py-9 md:px-9 md:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/[0.1] px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-primary">
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
                className="rounded-lg border border-border/55 bg-background/60 px-2.5 py-1.5 text-xs shadow-sm backdrop-blur-sm dark:border-white/[0.08] dark:bg-black/20"
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

        <div className="mt-8 flex flex-wrap gap-2 sm:mt-9 sm:gap-2.5">
          <Button
            size="default"
            className="h-11 rounded-lg px-5 text-sm font-semibold shadow-md shadow-primary/20"
            asChild
          >
            <Link href="/dashboard/appointments">
              Planning
              <ArrowRight className="ml-1.5 size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="default"
            className="h-11 rounded-lg border-border/70 bg-background/70 px-5 text-sm font-semibold shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.04]"
            asChild
          >
            <Link href="/dashboard/inbox">Inbox</Link>
          </Button>
          <Button
            variant="outline"
            size="default"
            className="h-11 rounded-lg border-border/70 bg-background/70 px-5 text-sm font-semibold shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.04]"
            asChild
          >
            <Link href="/dashboard/pipeline">Pipeline</Link>
          </Button>
          <Button
            variant="outline"
            size="default"
            className="h-11 rounded-lg border-border/70 bg-background/70 px-5 text-sm font-semibold shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.04]"
            asChild
          >
            <Link href="/dashboard/leads">Alle leads</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
