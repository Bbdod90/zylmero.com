import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

/**
 * Hero omzetpotentie — visueel gelijk aan marketing homepage (cf-dashboard-panel).
 */
export function DashboardRevenueHero({
  amountLabel,
  chipItems,
}: {
  amountLabel: string;
  chipItems: { label: string; value: string }[];
}) {
  return (
    <section
      className="cf-dashboard-panel relative overflow-hidden rounded-2xl"
      aria-labelledby="dashboard-revenue-heading"
    >
      <div className="relative px-5 py-7 sm:px-7 sm:py-8 md:px-8 md:py-9">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">{BRAND_NAME}</span>
          <span className="rounded-full border border-border/50 bg-muted/35 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground dark:border-white/[0.09] dark:bg-white/[0.04]">
            Workspace
          </span>
        </div>

        <div className="mt-4 max-w-2xl space-y-2">
          <h2
            id="dashboard-revenue-heading"
            className="text-balance text-xl font-semibold tracking-[-0.035em] text-foreground sm:text-2xl md:text-3xl md:leading-[1.15]"
          >
            <span className="zm-text-gradient">Pipeline-waarde</span>
          </h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Geschat op basis van je klanten — plus snelle links naar planning en inbox.
          </p>
        </div>

        {chipItems.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {chipItems.map((c) => (
              <div
                key={c.label}
                className="rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm dark:border-white/[0.09] dark:bg-black/25"
              >
                <span className="text-muted-foreground">{c.label}</span>
                <span className="ml-2 font-semibold tabular-nums text-foreground">{c.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        <p
          className={cn(
            "mt-5 bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-3xl font-semibold tabular-nums tracking-tight text-transparent sm:mt-6 sm:text-4xl md:text-5xl md:leading-[1.06]",
            "dark:from-white dark:via-white dark:to-primary/75",
          )}
        >
          {amountLabel}
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          <Button size="default" className="h-10 rounded-full px-6 text-[13px] font-semibold shadow-md shadow-primary/15" asChild>
            <Link href="/dashboard/appointments">
              Planning
              <ArrowRight className="ml-1.5 size-4" aria-hidden />
            </Link>
          </Button>
          <Button variant="outline" size="default" className="h-10 rounded-full border-border/65 px-6 text-[13px] font-semibold dark:border-white/[0.14]" asChild>
            <Link href="/dashboard/inbox">Inbox</Link>
          </Button>
          <Button variant="outline" size="default" className="h-10 rounded-full border-border/65 px-6 text-[13px] font-semibold dark:border-white/[0.14]" asChild>
            <Link href="/dashboard/pipeline">Pipeline</Link>
          </Button>
          <Button variant="outline" size="default" className="h-10 rounded-full border-border/65 px-6 text-[13px] font-semibold dark:border-white/[0.14]" asChild>
            <Link href="/dashboard/leads">Klanten</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
