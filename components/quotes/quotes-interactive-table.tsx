"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { QuoteStatusMenu } from "@/components/quotes/quote-status-menu";
import type { QuoteStatus } from "@/lib/types";

export type QuoteRowModel = {
  id: string;
  title: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  status: QuoteStatus;
  updated_at: string;
  lead: { id: string; full_name: string } | null;
};

export function QuotesInteractiveTable({
  rows,
  demoMode = false,
}: {
  rows: QuoteRowModel[];
  demoMode?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-card/50 shadow-premium">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Offerte</TableHead>
            <TableHead>Lead</TableHead>
            <TableHead className="text-right">Subtotaal</TableHead>
            <TableHead className="text-right">BTW</TableHead>
            <TableHead className="text-right">Totaal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bijgewerkt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((q) => (
            <TableRow
              key={q.id}
              role="button"
              tabIndex={0}
              aria-label={`Offerte openen: ${q.title}`}
              className="cursor-pointer hover:bg-muted/60 dark:hover:bg-white/[0.07]"
              onClick={() => router.push(`/dashboard/quotes/${q.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/dashboard/quotes/${q.id}`);
                }
              }}
            >
              <TableCell className="max-w-[220px] font-medium">
                <span className="line-clamp-2 text-foreground">{q.title}</span>
              </TableCell>
              <TableCell>
                {q.lead ? (
                  <Link
                    href={`/dashboard/leads/${q.lead.id}`}
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {q.lead.full_name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(q.subtotal)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {formatCurrency(q.vat_amount)}
              </TableCell>
              <TableCell className="text-right text-base font-semibold tabular-nums text-foreground">
                {formatCurrency(q.total)}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <QuoteStatusMenu
                  quoteId={q.id}
                  status={q.status}
                  demoMode={demoMode}
                  stopPropagation
                />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(q.updated_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
