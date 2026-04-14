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
import { ArrowRight } from "lucide-react";
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
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/95 to-muted/20 shadow-[0_20px_70px_-44px_rgb(0_0_0/0.4)] dark:border-white/[0.09] dark:from-white/[0.04] dark:to-black/25 dark:shadow-[0_24px_80px_-48px_rgb(0_0_0/0.6)]"
      aria-labelledby="dashboard-top-leads-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
        aria-hidden
      />
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 pb-3 pt-6 sm:px-8 sm:pt-7">
        <CardTitle
          id="dashboard-top-leads-heading"
          className="text-lg font-semibold tracking-tight sm:text-xl"
        >
          Top 3 leads
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
      <CardContent className="border-t border-border/50 px-0 pb-6 pt-0 dark:border-white/[0.06]">
        {merged.length === 0 ? (
          <p className="px-6 py-6 text-sm leading-relaxed text-muted-foreground sm:px-8">
            Nog geen leads. Zodra er aanvragen binnenkomen, zie je hier waar de meeste waarde zit.
          </p>
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
