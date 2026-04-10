"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Lead, Quote, QuoteStatus } from "@/lib/types";
import { updateQuoteStatus } from "@/actions/quotes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrencyDetailed, formatDateTime } from "@/lib/utils";
import { quoteStatusNl } from "@/lib/i18n/nl-labels";

const STATUS_OPTS: QuoteStatus[] = ["draft", "sent", "accepted", "declined"];

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

export function QuoteDetailClient({
  quote,
  lead,
  demoMode,
}: {
  quote: Quote;
  lead: Lead | null;
  demoMode: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{quote.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bijgewerkt {formatDateTime(quote.updated_at)}
          </p>
        </div>
        {demoMode ? (
          <Badge
            variant="outline"
            className={cn(
              "rounded-full border px-3 py-1 text-2xs font-semibold uppercase",
              statusStyle(quote.status),
            )}
          >
            {quoteStatusNl(quote.status)}
          </Badge>
        ) : (
          <select
            aria-label="Offertestatus"
            className="h-11 min-h-[44px] rounded-xl border border-white/[0.1] bg-background/60 px-3 text-sm font-medium"
            value={quote.status}
            disabled={pending}
            onChange={(e) => {
              const v = e.target.value as QuoteStatus;
              start(async () => {
                const res = await updateQuoteStatus(quote.id, v);
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                toast.success("Offerte bijgewerkt");
                router.refresh();
              });
            }}
          >
            {STATUS_OPTS.map((s) => (
              <option key={s} value={s}>
                {quoteStatusNl(s)}
              </option>
            ))}
          </select>
        )}
      </div>

      {lead ? (
        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gekoppelde lead</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/dashboard/leads/${lead.id}`}
              className="font-medium text-primary hover:underline"
            >
              {lead.full_name}
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {quote.description ? (
        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Omschrijving</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
            {quote.description}
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Regels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quote.line_items?.length ? (
            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left text-2xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Omschrijving</th>
                    <th className="px-4 py-3 text-right">Aantal</th>
                    <th className="px-4 py-3 text-right">Prijs</th>
                    <th className="px-4 py-3 text-right">Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.line_items.map((li) => (
                    <tr
                      key={li.id}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="px-4 py-3">{li.description}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {li.quantity}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {formatCurrencyDetailed(li.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {formatCurrencyDetailed(li.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Geen regels</p>
          )}
          <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4 text-sm">
            <div className="flex justify-between tabular-nums">
              <span className="text-muted-foreground">Subtotaal</span>
              <span>{formatCurrencyDetailed(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between tabular-nums">
              <span className="text-muted-foreground">
                BTW ({Math.round(quote.vat_rate * 100)}%)
              </span>
              <span>{formatCurrencyDetailed(quote.vat_amount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold tabular-nums text-foreground">
              <span>Totaal</span>
              <span>{formatCurrencyDetailed(quote.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {quote.internal_notes ? (
        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Interne notities</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
            {quote.internal_notes}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {!demoMode ? (
          <a
            href={`/api/quotes/${quote.id}/pdf`}
            className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-xl border border-primary/35 bg-primary/12 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/18"
          >
            PDF downloaden
          </a>
        ) : null}
        <Link
          href="/dashboard/quotes"
          className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-xl border border-white/[0.1] bg-background/40 px-4 text-sm font-medium transition-colors hover:bg-muted/30"
        >
          ← Terug naar overzicht
        </Link>
      </div>
    </div>
  );
}
