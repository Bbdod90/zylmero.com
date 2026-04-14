import { notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageFrame } from "@/components/layout/page-frame";
import {
  QuoteDetailClient,
  type QuoteTemplatePreview,
} from "@/components/quotes/quote-detail-client";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { getCompanySettings } from "@/lib/company-settings";
import { parseQuoteRow } from "@/lib/quotes/parse-quote";
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
  let template: QuoteTemplatePreview | null = null;

  if (demo) {
    const bundle = getDemoDashboardBundle();
    const raw = bundle.quotes.find((q) => q.id === params.id) || null;
    quote = raw ? parseQuoteRow({ ...(raw as object) } as Record<string, unknown>) : null;
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
    quote = q ? parseQuoteRow(q as Record<string, unknown>) : null;
    if (quote?.lead_id) {
      const { data: l } = await supabase
        .from("leads")
        .select("*")
        .eq("id", quote.lead_id)
        .eq("company_id", auth.company.id)
        .maybeSingle();
      lead = l as Lead | null;
    }
    const cs = await getCompanySettings(supabase, auth.company.id);
    if (cs) {
      template = {
        quote_intro: cs.quote_intro,
        quote_footer: cs.quote_footer,
        quote_include_pricing_hints: cs.quote_include_pricing_hints,
        quote_include_zylmero_notice: cs.quote_include_zylmero_notice,
        pricing_hints: cs.pricing_hints,
      };
    }
  }

  if (!quote) notFound();

  return (
    <PageFrame
      title="Offerte"
      subtitle="Samenstellen, template en PDF — alles op één plek."
    >
      <QuoteDetailClient
        quote={quote}
        lead={lead}
        demoMode={demo}
        template={template}
      />
    </PageFrame>
  );
}
