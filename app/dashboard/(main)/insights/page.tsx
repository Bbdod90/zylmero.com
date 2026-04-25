import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { BarChart3, Clock, MessageSquareWarning, TrendingUp } from "lucide-react";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardBundle } from "@/lib/queries/dashboard";
import { analyzeSla } from "@/lib/queries/sla";
import { fetchRevenueMetrics } from "@/lib/queries/revenue";
import {
  getDemoDashboardBundle,
  getDemoRevenueMetrics,
  getDemoSla,
} from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { computeSalesMetrics } from "@/lib/sales/metrics";
import { PageFrame } from "@/components/layout/page-frame";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

function KpiPanel({
  icon: Icon,
  title,
  value,
  hint,
  foot,
  iconClass,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: ReactNode;
  hint: string;
  foot?: ReactNode;
  iconClass?: string;
}) {
  return (
    <div className="cf-dashboard-panel flex flex-col rounded-2xl bg-gradient-to-br from-card to-card/80 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20",
            iconClass,
          )}
        >
          <Icon className="size-[1.15rem]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
          {foot ? <div className="pt-1">{foot}</div> : null}
        </div>
      </div>
    </div>
  );
}

export default async function InsightsPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const bundle = demo
    ? getDemoDashboardBundle()
    : await fetchDashboardBundle(supabase, auth.company.id);
  const sla = demo ? getDemoSla() : await analyzeSla(supabase, auth.company.id);
  const revenue = demo
    ? getDemoRevenueMetrics()
    : await fetchRevenueMetrics(supabase, auth.company.id);

  const stale = sla.staleReplyLeadIds;
  const sales = computeSalesMetrics(bundle.leads, {
    avgResponseHours: sla.avgResponseHours,
    staleReplyLeadIds: stale,
  });

  const avg =
    sla.avgResponseHours != null ? `${sla.avgResponseHours} u` : "—";
  const staleN = stale.size;

  return (
    <PageFrame
      title="Prestaties"
      subtitle="Reactiesnelheid, pijplijn en omzet — dezelfde data als op je dashboard, hier gericht op inzicht en actie."
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-10">
        <div className="cf-dashboard-panel overflow-hidden p-6 sm:p-7">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Executive snapshot
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Focus op snelheid en marge
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Dit overzicht combineert reactietijd, conversie en omzetverlies in een enkel
            luxe dashboard zodat je direct ziet waar de grootste winst zit.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiPanel
            icon={Clock}
            title="Gem. reactietijd"
            value={avg}
            hint="Van eerste klantbericht tot eerste teamantwoord (geschat)."
          />
          <KpiPanel
            icon={MessageSquareWarning}
            title="Wacht op antwoord"
            value={staleN}
            hint="Leads met open klantbericht langer dan ~4 uur."
            iconClass="bg-amber-500/12 text-amber-700 ring-amber-500/20 dark:text-amber-400"
            foot={
              staleN > 0 ? (
                <Button variant="link" className="h-auto p-0 text-xs font-semibold" asChild>
                  <Link href="/dashboard/inbox">Naar berichten →</Link>
                </Button>
              ) : null
            }
          />
          <KpiPanel
            icon={TrendingUp}
            title="Gewonnen omzet"
            value={formatCurrency(revenue.wonRevenueEur)}
            hint={`${revenue.acceptedQuotes} ${
              revenue.acceptedQuotes === 1 ? "geaccepteerde offerte" : "geaccepteerde offertes"
            }.`}
          />
          <KpiPanel
            icon={BarChart3}
            title="Conversie"
            value={`${Math.round(sales.conversionRate * 100)}%`}
            hint="Lead → gewonnen (ruwe schatting op basis van status)."
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="min-w-0 space-y-3 lg:col-span-2">
            <div className="flex items-end justify-between gap-3 px-0.5">
              <div>
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Trend
                </p>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Pijplijn vs. gewonnen (indicatie)
                </h2>
              </div>
            </div>
            <div className="cf-dashboard-panel p-3 sm:p-4">
              <SalesChart title="" />
            </div>
          </div>

          <div className="cf-dashboard-panel flex flex-col rounded-2xl bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent p-6 lg:col-span-1 dark:from-primary/[0.14]">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Actie
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Snelle vervolgstappen
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Geschat omzetrisico door trage of gemiste reacties:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {formatCurrency(sales.missedReplyRevenueEstimate + sales.lostRevenueEstimate)}
              </span>
            </p>
            <div className="mt-6 flex flex-col gap-2.5 border-t border-border/40 pt-6 dark:border-white/[0.06]">
              <Button className="h-11 w-full rounded-lg font-semibold shadow-sm" asChild>
                <Link href="/dashboard">Volledig dashboard</Link>
              </Button>
              <Button variant="outline" className="h-11 w-full rounded-lg font-semibold" asChild>
                <Link href="/dashboard/leads">Bekijk leads</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
