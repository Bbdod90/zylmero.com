"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Lead, LeadStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LeadStatusMenu } from "@/components/leads/lead-status-menu";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardTopLeadsTable({
  leads,
  demoMode,
}: {
  leads: Lead[];
  demoMode: boolean;
}) {
  const [demoPatches, setDemoPatches] = useState<Record<string, LeadStatus>>({});
  const merged = useMemo(
    () =>
      leads.map((l) => ({
        ...l,
        status: demoPatches[l.id] ?? l.status,
      })),
    [leads, demoPatches],
  );

  return (
    <section
      className="cf-dashboard-panel relative overflow-hidden rounded-2xl"
      aria-labelledby="dashboard-top-leads-heading"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 border-b border-border/40 px-6 pb-4 pt-6 sm:px-8 dark:border-white/[0.06]">
        <CardTitle
          id="dashboard-top-leads-heading"
          className="text-lg font-semibold tracking-tight sm:text-xl"
        >
          Top 3 klanten
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="-mr-1 shrink-0 rounded-full px-3 text-sm font-medium text-muted-foreground hover:text-primary"
          asChild
        >
          <Link href="/dashboard/leads">
            Alles bekijken
            <ArrowRight className="ml-1 size-4" aria-hidden />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-6 pt-0">
        {merged.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center sm:px-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Users className="size-6" aria-hidden />
            </div>
            <div className="max-w-sm space-y-2">
              <p className="text-sm font-medium text-foreground">Nog geen klanten in je top 3</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Zodra aanvragen binnenkomen, tonen we hier automatisch waar de meeste geschatte waarde zit.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-lg shadow-sm">
              <Link href="/dashboard/inbox">
                Open inbox
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent dark:border-white/[0.06]">
                <TableHead className="h-11 min-w-0 max-w-[min(40vw,14rem)] pl-6 text-2xs sm:pl-8">
                  Naam
                </TableHead>
                <TableHead className="h-11 w-[1%] whitespace-nowrap text-2xs">Status</TableHead>
                <TableHead className="h-11 w-[1%] whitespace-nowrap pr-6 text-right text-2xs sm:pr-8">
                  Waarde
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merged.map((l) => (
                <TableRow
                  key={l.id}
                  className="border-border/40 hover:bg-white/[0.04] dark:border-white/[0.05] dark:hover:bg-white/[0.03]"
                >
                  <TableCell className="min-w-0 max-w-[min(40vw,14rem)] py-3.5 pl-6 font-medium sm:pl-8">
                    <Link
                      href={`/dashboard/leads/${l.id}`}
                      className="block truncate text-foreground transition-colors hover:text-primary hover:underline"
                      title={l.full_name}
                    >
                      {l.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-3.5">
                    <LeadStatusMenu
                      leadId={l.id}
                      status={l.status}
                      demoMode={demoMode}
                      compact
                      onDemoStatusChange={
                        demoMode
                          ? (next) =>
                              setDemoPatches((p) => ({
                                ...p,
                                [l.id]: next,
                              }))
                          : undefined
                      }
                    />
                  </TableCell>
                  <TableCell className="pr-6 text-right text-sm font-semibold tabular-nums text-foreground sm:pr-8 sm:text-base">
                    {l.estimated_value != null ? formatCurrency(l.estimated_value) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </section>
  );
}
