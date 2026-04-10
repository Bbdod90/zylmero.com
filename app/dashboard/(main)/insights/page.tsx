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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

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
    sla.avgResponseHours != null
      ? `${sla.avgResponseHours} u`
      : "—";
  const staleN = stale.size;

  return (
    <PageFrame
      title="Prestaties"
      subtitle="Responstijden, omzet en pijplijn — hetzelfde datapunt als je dashboard, hier gefocust op inzicht."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader className="flex flex-row items-center gap-2">
            <Clock className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Gem. reactietijd</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-foreground">{avg}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Na eerste klantbericht tot staff-antwoord (geschat).
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageSquareWarning className="size-4 text-amber-500/90" />
            <CardTitle className="text-sm font-semibold">Wacht op antwoord</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-foreground">{staleN}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Leads met openstaand klantbericht (&gt;4 u).
            </p>
            {staleN > 0 ? (
              <Button variant="link" className="mt-2 h-auto px-0 text-xs" asChild>
                <Link href="/dashboard/inbox">Naar berichten</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Gewonnen omzet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {formatCurrency(revenue.wonRevenueEur)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {revenue.acceptedQuotes}{" "}
              {revenue.acceptedQuotes === 1
                ? "geaccepteerde offerte"
                : "geaccepteerde offertes"}
              .
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Conversie</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {Math.round(sales.conversionRate * 100)}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Lead → gewonnen (ruwe schatting op basis van status).
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart title="Trend (indicatie)" />
        </div>
        <Card className="rounded-2xl border-white/[0.06] lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Snelle acties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Omzetrisico door trage reactie:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(sales.missedReplyRevenueEstimate + sales.lostRevenueEstimate)}
              </span>
            </p>
            <Button className="w-full rounded-xl" asChild>
              <Link href="/dashboard">Volledig dashboard</Link>
            </Button>
            <Button variant="outline" className="w-full rounded-xl" asChild>
              <Link href="/dashboard/growth">Groei &amp; referrals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageFrame>
  );
}
