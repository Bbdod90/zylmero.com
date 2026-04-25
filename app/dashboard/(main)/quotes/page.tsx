import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchQuotesForCompany } from "@/lib/queries/quotes-list";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  QuotesInteractiveTable,
  type QuoteRowModel,
} from "@/components/quotes/quotes-interactive-table";
import { QuotesPageToolbar } from "@/components/quotes/quotes-page-toolbar";
import type { Quote } from "@/lib/types";
import { parseQuoteRow } from "@/lib/quotes/parse-quote";
import { FileText } from "lucide-react";

export default async function QuotesPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();

  let quotes: Quote[];
  const leadById = new Map<string, { id: string; full_name: string }>();

  if (demo) {
    const bundle = getDemoDashboardBundle();
    quotes = bundle.quotes.map((q) =>
      parseQuoteRow({ ...(q as object) } as Record<string, unknown>),
    );
    for (const l of bundle.leads) {
      leadById.set(l.id, { id: l.id, full_name: l.full_name });
    }
  } else {
    quotes = await fetchQuotesForCompany(supabase, auth.company.id);
    const ids = Array.from(
      new Set(
        quotes
          .map((q) => q.lead_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    );
    if (ids.length) {
      const { data: rows } = await supabase
        .from("leads")
        .select("id, full_name")
        .in("id", ids);
      for (const r of rows || []) {
        const row = r as { id: string; full_name: string };
        leadById.set(row.id, row);
      }
    }
  }

  const rows: QuoteRowModel[] = quotes.map((q: Quote) => ({
    id: q.id,
    title: q.title,
    subtotal: q.subtotal,
    vat_amount: q.vat_amount,
    total: q.total,
    status: q.status,
    updated_at: q.updated_at,
    lead: q.lead_id ? leadById.get(q.lead_id) ?? null : null,
  }));

  const demoSampleQuoteId = demo ? quotes[0]?.id ?? null : null;

  return (
    <PageFrame
      title="Offertes"
      subtitle="Van vraag naar prijs — volg status, BTW en totaal in één overzicht."
    >
      <DashboardWorkSurface>
        <QuotesPageToolbar demo={demo} demoSampleQuoteId={demoSampleQuoteId} />
        {quotes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nog geen offertes"
            description="Maak een offerte vanuit een lead: open de lead en kies een offerte-actie of laat AI een concept genereren."
            className="py-16 sm:py-20"
            actions={
              <>
                {!demo ? (
                  <Button asChild className="rounded-lg">
                    <Link href="/dashboard/quotes/new">Nieuwe offerte</Link>
                  </Button>
                ) : null}
                <Button variant="outline" asChild className="rounded-lg">
                  <Link href="/dashboard/leads">Naar klanten</Link>
                </Button>
              </>
            }
          />
        ) : (
          <QuotesInteractiveTable rows={rows} demoMode={demo} />
        )}
      </DashboardWorkSurface>
    </PageFrame>
  );
}
