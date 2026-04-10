import { notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageFrame } from "@/components/layout/page-frame";
import { QuoteDetailClient } from "@/components/quotes/quote-detail-client";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import type { Lead, Quote } from "@/lib/types";

export default async function QuoteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();

  let quote: Quote | null = null;
  let lead: Lead | null = null;

  if (demo) {
    const bundle = getDemoDashboardBundle();
    quote = bundle.quotes.find((q) => q.id === params.id) || null;
    if (quote?.lead_id) {
      lead = bundle.leads.find((l) => l.id === quote!.lead_id) || null;
    }
  } else {
    const supabase = await createClient();
    const { data: q } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", params.id)
      .eq("company_id", auth.company.id)
      .maybeSingle();
    quote = q as Quote | null;
    if (quote?.lead_id) {
      const { data: l } = await supabase
        .from("leads")
        .select("*")
        .eq("id", quote.lead_id)
        .eq("company_id", auth.company.id)
        .maybeSingle();
      lead = l as Lead | null;
    }
  }

  if (!quote) notFound();

  return (
    <PageFrame
      title="Offerte"
      subtitle="Regels, BTW en status — in één overzicht."
    >
      <QuoteDetailClient quote={quote} lead={lead} demoMode={demo} />
    </PageFrame>
  );
}
