import type { Quote, QuoteLineItem, QuoteStatus } from "@/lib/types";

const STATUSES: QuoteStatus[] = [
  "draft",
  "sent",
  "accepted",
  "declined",
];

function isQuoteStatus(s: unknown): s is QuoteStatus {
  return typeof s === "string" && STATUSES.includes(s as QuoteStatus);
}

/** Zorgt dat JSONB line_items altijd een geldige array is (Supabase/serialisatie). */
export function parseQuoteRow(row: Record<string, unknown>): Quote {
  const raw = row.line_items;
  let items: unknown[] = [];
  if (Array.isArray(raw)) {
    items = raw;
  } else if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw) as unknown;
      if (Array.isArray(p)) items = p;
    } catch {
      items = [];
    }
  }

  const line_items: QuoteLineItem[] = items.map((it, i) => {
    const x = (it && typeof it === "object" ? it : {}) as Record<
      string,
      unknown
    >;
    const qty = Number(x.quantity);
    const unit = Number(x.unit_price);
    const lineTot = Number(x.line_total);
    const q = Number.isFinite(qty) ? qty : 0;
    const u = Number.isFinite(unit) ? unit : 0;
    const lt = Number.isFinite(lineTot)
      ? lineTot
      : Math.round(q * u * 100) / 100;
    return {
      id: typeof x.id === "string" && x.id ? x.id : `li-${i}`,
      description: String(x.description ?? ""),
      quantity: q,
      unit_price: u,
      line_total: lt,
    };
  });

  const statusRaw = row.status;
  const status: QuoteStatus = isQuoteStatus(statusRaw)
    ? statusRaw
    : "draft";

  return {
    id: row.id as string,
    company_id: row.company_id as string,
    lead_id: (row.lead_id as string) ?? null,
    title: String(row.title ?? "Offerte"),
    description: (row.description as string) ?? null,
    status,
    currency: String(row.currency ?? "EUR"),
    subtotal: row.subtotal != null ? Number(row.subtotal) : 0,
    vat_rate: row.vat_rate != null ? Number(row.vat_rate) : 0.21,
    vat_amount: row.vat_amount != null ? Number(row.vat_amount) : 0,
    total: row.total != null ? Number(row.total) : 0,
    line_items,
    internal_notes: (row.internal_notes as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
