import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const tileVariants = {
  primary: {
    wrap: "border-primary/20 bg-gradient-to-br from-primary/[0.07] to-primary/[0.02] dark:from-primary/[0.12] dark:to-transparent",
    value: "text-primary",
  },
  neutral: {
    wrap: "border-border/50 bg-muted/25 dark:border-white/[0.06] dark:bg-white/[0.03]",
    value: "text-foreground",
  },
  success: {
    wrap: "border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.06] to-transparent dark:border-emerald-400/20",
    value: "text-emerald-600 dark:text-emerald-400/95",
  },
  danger: {
    wrap: "border-destructive/20 bg-gradient-to-br from-destructive/[0.06] to-transparent dark:border-destructive/25",
    value: "text-destructive",
  },
} as const;

export function GrowthResultsStrip(props: {
  wonRevenueEur: number;
  upcomingAppts: number;
  dealsWonCount: number;
  missedRevenueTotal: number;
}) {
  const items = [
    {
      label: "Gegenereerde omzet",
      value: formatCurrency(props.wonRevenueEur),
      sub: "Geaccepteerde offertes",
      variant: "primary" as const,
    },
    {
      label: "Afspraken",
      value: String(props.upcomingAppts),
      sub: "Gepland vanaf nu",
      variant: "neutral" as const,
    },
    {
      label: "Gewonnen klanten",
      value: String(props.dealsWonCount),
      sub: "Succesvol afgesloten",
      variant: "success" as const,
    },
    {
      label: "Gemiste omzet",
      value: formatCurrency(props.missedRevenueTotal),
      sub: "Schatting trage reacties + verlies",
      variant: "danger" as const,
    },
  ];

  return (
    <section className="cf-dashboard-panel p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-primary">
              Resultaten
            </p>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
              Op basis van leads, waardes en status in je workspace.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/sales"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.08] px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/[0.14] dark:border-primary/30"
        >
          Verkoopdetails
          <ArrowRight className="size-4 opacity-90" />
        </Link>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {items.map((x) => {
          const v = tileVariants[x.variant];
          return (
            <div
              key={x.label}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-4 shadow-inner-soft transition-colors duration-200",
                "hover:border-primary/20 dark:hover:border-white/[0.1]",
                v.wrap,
              )}
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {x.label}
              </p>
              <p
                className={cn(
                  "mt-2.5 text-2xl font-bold tabular-nums tracking-tight sm:text-[1.65rem]",
                  v.value,
                )}
              >
                {x.value}
              </p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                {x.sub}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
