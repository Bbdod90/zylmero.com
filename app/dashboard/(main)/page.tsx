import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardBundle } from "@/lib/queries/dashboard";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { PageFrame } from "@/components/layout/page-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { simpleDashboardStatus } from "@/components/dashboard/simple-lead-status";

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
        <Card className="rounded-2xl border-border/50 bg-card/80 dark:border-white/[0.08]">
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

        <Card className="rounded-2xl border-border/50 bg-card/80 dark:border-white/[0.08]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Top 3 leads</CardTitle>
            <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground" asChild>
              <Link href="/dashboard/leads">
                Alles bekijken
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-6">
            {topThree.length === 0 ? (
              <p className="px-6 pb-2 text-sm text-muted-foreground">
                Nog geen leads. Zodra er aanvragen binnenkomen, zie je hier waar de meeste waarde zit.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naam</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Waarde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topThree.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/leads/${l.id}`}
                          className="text-foreground hover:text-primary hover:underline"
                        >
                          {l.full_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
                          {simpleDashboardStatus(l.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-base font-semibold tabular-nums">
                        {l.estimated_value != null ? formatCurrency(l.estimated_value) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageFrame>
  );
}
