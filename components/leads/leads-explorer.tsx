"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadStatusMenu } from "@/components/leads/lead-status-menu";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { Inbox, Search } from "lucide-react";
import {
  type LeadTemperature,
  computeDisplayScore,
} from "@/lib/sales/scoring";
import { LeadPriorityMenu } from "@/components/leads/lead-priority-menu";
import { NewLeadDialog } from "@/components/leads/new-lead-dialog";
import { BRAND_NAME } from "@/lib/brand";

const SOURCES = [
  "all",
  "Website",
  "Google Maps",
  "WhatsApp",
  "Referral",
  "Facebook",
  "Instagram",
  "Cold call",
];

function withDemoPriority(
  lead: Lead,
  map: Record<string, LeadTemperature>,
): Lead {
  const p = map[lead.id];
  if (!p) return lead;
  return {
    ...lead,
    custom_fields: {
      ...lead.custom_fields,
      priority_override: p,
    },
  };
}

export function LeadsExplorer({
  leads,
  staleReplyLeadIds = [],
  demoMode = false,
  demoSampleLeadId = null,
}: {
  leads: Lead[];
  staleReplyLeadIds?: string[];
  demoMode?: boolean;
  /** Demo: navigatie na “nieuwe lead” (voorbeeld openen). */
  demoSampleLeadId?: string | null;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [demoPriority, setDemoPriority] = useState<
    Record<string, LeadTemperature>
  >({});
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [source, setSource] = useState<string>("all");
  const [sort, setSort] = useState<"activity" | "value" | "score">("activity");
  const dq = useDebouncedValue(q, 250);

  const stale = useMemo(
    () => new Set(staleReplyLeadIds),
    [staleReplyLeadIds],
  );

  const filtered = useMemo(() => {
    let list = [...leads];
    if (dq.trim()) {
      const n = dq.toLowerCase();
      list = list.filter(
        (l) =>
          l.full_name.toLowerCase().includes(n) ||
          (l.email || "").toLowerCase().includes(n) ||
          (l.intent || "").toLowerCase().includes(n),
      );
    }
    if (status !== "all") list = list.filter((l) => l.status === status);
    if (source !== "all") list = list.filter((l) => (l.source || "") === source);
    if (sort === "activity") {
      list.sort(
        (a, b) =>
          (b.last_message_at ? new Date(b.last_message_at).getTime() : 0) -
          (a.last_message_at ? new Date(a.last_message_at).getTime() : 0),
      );
    } else if (sort === "value") {
      list.sort(
        (a, b) => (b.estimated_value || 0) - (a.estimated_value || 0),
      );
    } else {
      list.sort(
        (a, b) =>
          computeDisplayScore(b, { staleReply: stale.has(b.id) }) -
          computeDisplayScore(a, { staleReply: stale.has(a.id) }),
      );
    }
    return list;
  }, [leads, dq, status, source, sort, stale]);

  return (
    <div className="space-y-6">
      <div className="cf-dashboard-panel border-border/60 bg-gradient-to-br from-white via-white to-slate-50/35 p-4 dark:from-[hsl(222_30%_13%/0.97)] dark:via-[hsl(222_32%_10%/0.98)] dark:to-[hsl(222_38%_7%/0.99)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex w-full flex-1 flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Zoek op naam, e-mail, intentie…"
                className="h-12 rounded-xl border-border/60 bg-white pl-11 shadow-sm dark:border-white/[0.1] dark:bg-white/[0.02]"
              />
            </div>
            <NewLeadDialog
              demoMode={demoMode}
              demoSampleLeadId={demoSampleLeadId}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="h-12 min-h-[44px] rounded-xl border border-border/60 bg-white px-3.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/[0.1] dark:bg-white/[0.02]"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus | "all")}
            >
              <option value="all">Alle statussen</option>
              <option value="new">Nieuw</option>
              <option value="active">Actief</option>
              <option value="quote_sent">Offerte verstuurd</option>
              <option value="appointment_booked">Afspraak ingepland</option>
              <option value="won">Gewonnen</option>
              <option value="lost">Verloren</option>
            </select>
            <select
              className="h-12 min-h-[44px] rounded-xl border border-border/60 bg-white px-3.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/[0.1] dark:bg-white/[0.02]"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s === "all"
                    ? "Alle bronnen"
                    : s === "Referral"
                      ? "Doorverwijzing"
                      : s === "Cold call"
                        ? "Koude acquisitie"
                        : s}
                </option>
              ))}
            </select>
            <select
              className="h-12 min-h-[44px] rounded-xl border border-border/60 bg-white px-3.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/[0.1] dark:bg-white/[0.02]"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as "activity" | "value" | "score")
              }
            >
              <option value="activity">Sorteer: laatste activiteit</option>
              <option value="value">Sorteer: waarde</option>
              <option value="score">Sorteer: score</option>
            </select>
          </div>
        </div>
      </div>

      <div className="cf-dashboard-panel overflow-hidden border-border/60 bg-gradient-to-br from-white via-white to-slate-50/35 dark:from-[hsl(222_30%_13%/0.97)] dark:via-[hsl(222_32%_10%/0.98)] dark:to-[hsl(222_38%_7%/0.99)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-8 py-16 text-center">
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary ring-1 ring-primary/15">
              <Inbox className="size-7" />
            </div>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              Geen leads gevonden
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Wis filters — of breng meer inbound binnen zodat {BRAND_NAME} elk bericht
              automatisch vastlegt.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 dark:border-white/[0.06]">
                <TableHead className="h-11 pl-6 text-2xs uppercase tracking-[0.13em] text-muted-foreground sm:pl-7">Naam</TableHead>
                <TableHead className="h-11 text-2xs uppercase tracking-[0.13em] text-muted-foreground">Bron</TableHead>
                <TableHead className="h-11 text-2xs uppercase tracking-[0.13em] text-muted-foreground">Status</TableHead>
                <TableHead className="h-11 text-2xs uppercase tracking-[0.13em] text-muted-foreground">Prioriteit</TableHead>
                <TableHead className="h-11 text-2xs uppercase tracking-[0.13em] text-muted-foreground">Score</TableHead>
                <TableHead className="h-11 text-2xs uppercase tracking-[0.13em] text-muted-foreground">Waarde</TableHead>
                <TableHead className="h-11 pr-6 text-2xs uppercase tracking-[0.13em] text-muted-foreground sm:pr-7">Laatste activiteit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => {
                const rowLead = withDemoPriority(l, demoPriority);
                const display = computeDisplayScore(rowLead, {
                  staleReply: stale.has(l.id),
                });
                return (
                  <TableRow
                    key={l.id}
                    className="cursor-pointer border-b border-border/35 transition-colors hover:bg-primary/[0.04] dark:border-white/[0.04] dark:hover:bg-white/[0.04]"
                    role="link"
                    tabIndex={0}
                    aria-label={`Lead openen: ${l.full_name}`}
                    onClick={() => router.push(`/dashboard/leads/${l.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/dashboard/leads/${l.id}`);
                      }
                    }}
                  >
                    <TableCell className="max-w-[min(42vw,16rem)] min-w-0 py-3.5 pl-6 font-medium sm:pl-7">
                      <span
                        className="block truncate text-primary underline-offset-4 hover:underline"
                        title={l.full_name}
                      >
                        {l.full_name}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[10rem] min-w-0 truncate py-3.5 text-muted-foreground" title={l.source || ""}>
                      {l.source || "—"}
                    </TableCell>
                    <TableCell
                      className="min-w-0 max-w-[11rem] py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LeadStatusMenu leadId={l.id} status={l.status} demoMode={demoMode} compact />
                    </TableCell>
                    <TableCell
                      className="min-w-0 max-w-[12rem] py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <LeadPriorityMenu
                          lead={rowLead}
                          demoMode={demoMode}
                          staleReply={stale.has(l.id)}
                          compact
                          stopPropagation
                          onDemoPriorityChange={(next) =>
                            setDemoPriority((m) => ({ ...m, [l.id]: next }))
                          }
                        />
                        {stale.has(l.id) ? (
                          <span className="shrink-0 rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-destructive">
                            Te laat
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 tabular-nums text-muted-foreground">
                      {display}
                    </TableCell>
                    <TableCell className="py-3.5 text-base font-semibold tabular-nums text-foreground">
                      {l.estimated_value != null
                        ? formatCurrency(l.estimated_value)
                        : "—"}
                    </TableCell>
                    <TableCell className="py-3.5 pr-6 text-muted-foreground sm:pr-7">
                      {l.last_message_at
                        ? formatDateTime(l.last_message_at)
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
