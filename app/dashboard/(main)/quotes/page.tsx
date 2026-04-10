import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardBundle } from "@/lib/queries/dashboard";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { PageFrame } from "@/components/layout/page-frame";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { quoteStatusNl } from "@/lib/i18n/nl-labels";
import type { Quote, QuoteStatus } from "@/lib/types";
import { FileText } from "lucide-react";

function statusStyle(s: QuoteStatus) {
  switch (s) {
    case "draft":
      return "border-white/[0.12] bg-white/[0.06] text-foreground";
    case "sent":
      return "border-amber-500/30 bg-amber-500/10 text-amber-100";
    case "accepted":
      return "border-primary/35 bg-primary/12 text-primary";
    case "declined":
      return "border-white/[0.1] bg-muted/30 text-muted-foreground";
    default:
      return "";
  }
}

export default async function QuotesPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const bundle = demo
    ? getDemoDashboardBundle()
    : await fetchDashboardBundle(supabase, auth.company.id);
  const { quotes, leads } = bundle;
  const leadById = new Map(leads.map((l) => [l.id, l]));

  return (
    <PageFrame
      title="Offertes"
      subtitle="Van vraag naar prijs — volg status, BTW en totaal in één overzicht."
    >
      {quotes.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.1] bg-muted/10 px-8 py-20 text-center">
          <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner-soft">
            <FileText className="size-8" />
          </div>
          <p className="text-lg font-semibold tracking-tight text-foreground">
            Nog geen offertes
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Maak een offerte vanuit een lead: open de lead en kies een offerte-actie
            of laat AI een concept genereren.
          </p>
          <Link
            href="/dashboard/leads"
            className="mt-8 text-sm font-semibold text-primary hover:underline"
          >
            Naar leads →
          </Link>
        </div>
      ) : (
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
              {quotes.map((q: Quote) => {
                const lead = q.lead_id ? leadById.get(q.lead_id) : null;
                return (
                  <TableRow key={q.id}>
                    <TableCell className="max-w-[220px] font-medium">
                      <Link
                        href={`/dashboard/quotes/${q.id}`}
                        className="line-clamp-2 text-foreground hover:text-primary hover:underline"
                      >
                        {q.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {lead ? (
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="text-primary hover:underline"
                        >
                          {lead.full_name}
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
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border px-3 py-1 text-2xs font-semibold uppercase tracking-wide",
                          statusStyle(q.status),
                        )}
                      >
                        {quoteStatusNl(q.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(q.updated_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </PageFrame>
  );
}
