import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardBundle } from "@/lib/queries/dashboard";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { PageFrame } from "@/components/layout/page-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DashboardTopLeadsTable } from "@/components/dashboard/dashboard-top-leads-table";

export default async function DashboardPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const bundle = demo ? getDemoDashboardBundle() : await fetchDashboardBundle(supabase, auth.company.id);

  const revenuePotential = bundle.leads.reduce(
    (a, l) => a + (l.estimated_value != null ? Number(l.estimated_value) : 0),
    0,
  );

  const topThree = [...bundle.leads]
    .sort((a, b) => {
      const va = a.estimated_value != null ? Number(a.estimated_value) : -1;
      const vb = b.estimated_value != null ? Number(b.estimated_value) : -1;
      return vb - va;
    })
    .slice(0, 3);

  return (
    <PageFrame
      title="Dashboard"
      subtitle={demo ? "Demo — zo zie je waar je geld ligt." : "Hier verdien je geld."}
    >
      <div className="space-y-10">
        <Card className="min-w-0 overflow-hidden rounded-2xl border-border/50 bg-card/80 dark:border-white/[0.08]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">
              Hier verdien je geld
            </CardTitle>
            <p className="text-base text-muted-foreground">
              Som van de ingeschatte waarde van al je leads in de pipeline.
            </p>
          </CardHeader>
          <CardContent className="space-y-8 pb-8 pt-2">
            <p className="text-4xl font-bold tabular-nums tracking-tight text-foreground md:text-5xl">
              {formatCurrency(revenuePotential)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" size="sm" className="rounded-lg font-medium" asChild>
                <Link href="/dashboard/inbox">
                  Inbox
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg font-medium" asChild>
                <Link href="/dashboard/pipeline">Pipeline</Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg font-medium" asChild>
                <Link href="/dashboard/leads">Alle leads</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <DashboardTopLeadsTable leads={topThree} demoMode={demo} />
      </div>
    </PageFrame>
  );
}
