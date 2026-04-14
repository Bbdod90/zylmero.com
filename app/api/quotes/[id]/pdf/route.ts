import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { getCompanySettings } from "@/lib/company-settings";
import { buildQuotePdfBytes } from "@/lib/pdf/quote-pdf";
import { getDefaultZylmeroQuoteNoticeNl } from "@/lib/pdf/zylmero-quote-notice";
import { parseQuoteRow } from "@/lib/quotes/parse-quote";
import type { Lead, Quote } from "@/lib/types";

function safeFilenamePart(s: string): string {
  return s
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80) || "offerte";
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await getAuth();
  if (!auth.company) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const demo = isDemoMode();
  let quote: Quote | null = null;
  let lead: Lead | null = null;
  let extras = null as Parameters<typeof buildQuotePdfBytes>[0]["extras"];

  if (demo) {
    const bundle = getDemoDashboardBundle();
    const raw = bundle.quotes.find((q) => q.id === params.id) ?? null;
    quote = raw
      ? parseQuoteRow({ ...(raw as object) } as Record<string, unknown>)
      : null;
    const demoLeadId = quote?.lead_id;
    if (demoLeadId) {
      lead = bundle.leads.find((l) => l.id === demoLeadId) ?? null;
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
      extras = {
        quoteIntro: cs.quote_intro,
        quoteFooter: cs.quote_footer,
        pricingHints: cs.pricing_hints,
        includePricingHints: cs.quote_include_pricing_hints,
        includeZylmeroNotice: cs.quote_include_zylmero_notice,
        zylmeroNoticeText: getDefaultZylmeroQuoteNoticeNl(),
      };
    }
  }

  if (!quote) {
    return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  }

  const bytes = buildQuotePdfBytes({
    quote,
    companyName: auth.company.name,
    leadName: lead?.full_name ?? null,
    extras,
  });

  const name = safeFilenamePart(quote.title);
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="offerte-${name}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
