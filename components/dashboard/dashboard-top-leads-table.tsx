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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        {merged.length === 0 ? (
          <p className="px-6 pb-2 text-sm text-muted-foreground">
            Nog geen leads. Zodra er aanvragen binnenkomen, zie je hier waar de meeste waarde zit.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-0 max-w-[min(40vw,14rem)] pl-6">Naam</TableHead>
                <TableHead className="w-[1%] whitespace-nowrap">Status</TableHead>
                <TableHead className="w-[1%] whitespace-nowrap pr-6 text-right">Waarde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merged.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="min-w-0 max-w-[min(40vw,14rem)] pl-6 font-medium">
                    <Link
                      href={`/dashboard/leads/${l.id}`}
                      className="block truncate text-foreground hover:text-primary hover:underline"
                      title={l.full_name}
                    >
                      {l.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
                  <TableCell className="pr-6 text-right text-base font-semibold tabular-nums">
                    {l.estimated_value != null ? formatCurrency(l.estimated_value) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
