"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Lead, Quote, QuoteLineItem, QuoteStatus } from "@/lib/types";
import { updateQuoteContent, updateQuoteStatus } from "@/actions/quotes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatCurrencyDetailed,
  formatDateTime,
} from "@/lib/utils";
import { quoteStatusNl } from "@/lib/i18n/nl-labels";
import { getDefaultZylmeroQuoteNoticeNl } from "@/lib/pdf/zylmero-quote-notice";
import { Plus, Save, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const STATUS_OPTS: QuoteStatus[] = ["draft", "sent", "accepted", "declined"];

const VAT_OPTS = [
  { value: 0, label: "0%" },
  { value: 0.09, label: "9%" },
  { value: 0.21, label: "21%" },
] as const;

function snapVat(r: number) {
  const hit = VAT_OPTS.find((o) => Math.abs(o.value - r) < 1e-6);
  return hit?.value ?? 0.21;
}

type DraftState = {
  title: string;
  description: string;
  internal_notes: string;
  vat_rate: number;
  lines: QuoteLineItem[];
};

function buildDraft(q: Quote): DraftState {
  return {
    title: q.title,
    description: q.description ?? "",
    internal_notes: q.internal_notes ?? "",
    vat_rate: snapVat(q.vat_rate),
    lines: q.line_items.map((li) => ({ ...li })),
  };
}

export type QuoteTemplatePreview = {
  quote_intro: string | null;
  quote_footer: string | null;
  quote_include_pricing_hints: boolean;
  quote_include_zylmero_notice: boolean;
  pricing_hints: string | null;
};

export function QuoteDetailClient({
  quote,
  lead,
  demoMode,
  template,
}: {
  quote: Quote;
  lead: Lead | null;
  demoMode: boolean;
  template: QuoteTemplatePreview | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<DraftState>(() => buildDraft(quote));
  const [demoStatus, setDemoStatus] = useState<QuoteStatus>(() => quote.status);
  /** Invoer per regel: exclusief of inclusief BTW (opslag blijft altijd exclusief). */
  const [linePricesInclTax, setLinePricesInclTax] = useState(false);

  useEffect(() => {
    setDraft(buildDraft(quote));
    setDemoStatus(quote.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset draft bij server-refresh (id+updated_at), niet bij elke quote-referentie (voorkomt invoer verlies)
  }, [quote.id, quote.updated_at]);

  const previewTotals = useMemo(() => {
    const sub = draft.lines.reduce((s, li) => s + li.line_total, 0);
    const subR = Math.round(sub * 100) / 100;
    const vat = Math.round(subR * draft.vat_rate * 100) / 100;
    return { subtotal: subR, vat, total: subR + vat };
  }, [draft.lines, draft.vat_rate]);

  const updateLine = (index: number, patch: Partial<QuoteLineItem>) => {
    setDraft((d) => {
      const lines = d.lines.map((li, i) => {
        if (i !== index) return li;
        const next = { ...li, ...patch };
        const q = Math.max(0, Number(next.quantity) || 0);
        const u = Math.max(0, Number(next.unit_price) || 0);
        return {
          ...next,
          quantity: q,
          unit_price: u,
          line_total: Math.round(q * u * 100) / 100,
        };
      });
      return { ...d, lines };
    });
  };

  const addLine = () => {
    setDraft((d) => ({
      ...d,
      lines: [
        ...d.lines,
        {
          id: `li-new-${crypto.randomUUID().slice(0, 8)}`,
          description: "",
          quantity: 1,
          unit_price: 0,
          line_total: 0,
        },
      ],
    }));
  };

  const removeLine = (index: number) => {
    setDraft((d) => ({
      ...d,
      lines: d.lines.filter((_, i) => i !== index),
    }));
  };

  const displayUnitForInput = (unitEx: number) => {
    if (!linePricesInclTax) {
      return unitEx === 0 ? "" : String(unitEx);
    }
    const incl = unitEx * (1 + draft.vat_rate);
    return incl === 0 ? "" : String(Math.round(incl * 100) / 100);
  };

  const setUnitPriceFromInput = (index: number, raw: string) => {
    const v = Number(String(raw).replace(",", "."));
    if (!Number.isFinite(v)) {
      updateLine(index, { unit_price: 0 });
      return;
    }
    if (!linePricesInclTax) {
      updateLine(index, { unit_price: v });
      return;
    }
    const rate = 1 + draft.vat_rate;
    const ex = rate > 0 ? v / rate : v;
    updateLine(index, { unit_price: Math.round(ex * 10000) / 10000 });
  };

  const save = () => {
    if (demoMode) {
      toast.success(
        "Opgeslagen in de demo (alleen in dit scherm — geen database).",
      );
      return;
    }
    start(async () => {
      const res = await updateQuoteContent(quote.id, {
        title: draft.title,
        description: draft.description.trim() || null,
        internal_notes: draft.internal_notes.trim() || null,
        vat_rate: draft.vat_rate,
        line_items: draft.lines,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Offerte opgeslagen");
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="qt_title">Titel</Label>
            <Input
              id="qt_title"
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              className="rounded-xl text-lg font-semibold"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Bijgewerkt {formatDateTime(quote.updated_at)}
          </p>
        </div>
        {demoMode ? (
          <select
            aria-label="Offertestatus (demo)"
            className="h-11 min-h-[44px] rounded-xl border border-border bg-background px-3 text-sm font-medium shadow-sm"
            value={demoStatus}
            onChange={(e) => {
              const v = e.target.value as QuoteStatus;
              setDemoStatus(v);
              toast.message(`Status (demo): ${quoteStatusNl(v)}`);
            }}
          >
            {STATUS_OPTS.map((s) => (
              <option key={s} value={s}>
                {quoteStatusNl(s)}
              </option>
            ))}
          </select>
        ) : (
          <select
            aria-label="Offertestatus"
            className="h-11 min-h-[44px] rounded-xl border border-border bg-background px-3 text-sm font-medium shadow-sm dark:border-white/[0.1] dark:bg-background/60"
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
                toast.success("Status bijgewerkt");
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

      {template ? (
        <Card className="rounded-2xl border-primary/20 bg-primary/[0.04]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Jouw offerte-template (Instellingen)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Dit staat op de PDF naast de offerte zelf. Bewerk onder{" "}
              <Link href="/dashboard/settings?tab=quotes" className="font-medium text-primary hover:underline">
                Instellingen → Offertes
              </Link>
              .
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {template.quote_intro?.trim() ? (
              <div>
                <p className="text-2xs font-semibold uppercase text-muted-foreground">
                  Intro
                </p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {template.quote_intro}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nog geen vaste intro — voeg die toe bij Instellingen.
              </p>
            )}
            {template.quote_include_pricing_hints &&
            template.pricing_hints?.trim() ? (
              <div>
                <p className="text-2xs font-semibold uppercase text-muted-foreground">
                  Prijshints (uit kennisbank)
                </p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {template.pricing_hints}
                </p>
              </div>
            ) : null}
            {template.quote_footer?.trim() ? (
              <div>
                <p className="text-2xs font-semibold uppercase text-muted-foreground">
                  Voorwaarden / voet
                </p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {template.quote_footer}
                </p>
              </div>
            ) : null}
            {template.quote_include_zylmero_notice ? (
              <div>
                <p className="text-2xs font-semibold uppercase text-muted-foreground">
                  Zylmero-vermelding (op PDF)
                </p>
                <p className="mt-1 text-2xs italic text-muted-foreground">
                  {getDefaultZylmeroQuoteNoticeNl()}
                </p>
              </div>
            ) : (
              <p className="text-2xs text-muted-foreground">
                Platformvermelding uitgeschakeld in instellingen.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Omschrijving</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={draft.description}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
            placeholder="Korte toelichting voor de klant…"
            className="min-h-[100px] rounded-xl"
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-white/[0.06]">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Regels (samenstellen)</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="vat" className="text-2xs text-muted-foreground">
                BTW
              </Label>
              <select
                id="vat"
                className="h-9 rounded-lg border border-border bg-background px-2 text-sm shadow-sm dark:border-white/[0.1] dark:bg-background/60"
                value={String(snapVat(draft.vat_rate))}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    vat_rate: Number(e.target.value),
                  }))
                }
              >
                {VAT_OPTS.map((o) => (
                  <option key={o.value} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-lg"
                onClick={addLine}
              >
                <Plus className="mr-1 size-4" />
                Regel
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/25 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-sm font-medium text-foreground">
              Prijzen per regel
            </p>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-sm",
                  !linePricesInclTax ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                Excl. BTW
              </span>
              <Switch
                id="quote-line-price-mode"
                checked={linePricesInclTax}
                onCheckedChange={setLinePricesInclTax}
                aria-label="Schakel tussen prijs excl. of incl. BTW"
              />
              <span
                className={cn(
                  "text-sm",
                  linePricesInclTax ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                Incl. BTW
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={cn(
              "overflow-x-auto rounded-xl border border-border/65 bg-card",
              "shadow-[0_1px_0_0_hsl(220_13%_70%/0.45)] ring-1 ring-black/[0.03]",
              "dark:border-white/[0.09] dark:bg-card/70 dark:shadow-[0_1px_0_0_hsl(220_16%_22%/0.5)] dark:ring-white/[0.05]",
            )}
          >
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr
                  className={cn(
                    "border-b border-border/70 bg-gradient-to-b from-muted/55 to-muted/35 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
                    "dark:border-white/[0.08] dark:from-white/[0.06] dark:to-white/[0.02]",
                  )}
                >
                  <th className="px-4 py-3 first:pl-5">Omschrijving</th>
                  <th className="w-24 px-4 py-3 text-right">Aantal</th>
                  <th className="w-36 px-4 py-3 text-right">
                    {linePricesInclTax ? "Prijs (incl.)" : "Prijs (ex.)"}
                  </th>
                  <th className="w-32 px-4 py-3 text-right">Totaal</th>
                  <th className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {draft.lines.map((li, i) => (
                  <tr
                    key={li.id}
                    className="border-b border-border/55 transition-colors hover:bg-muted/35 dark:border-white/[0.06] dark:hover:bg-white/[0.045]"
                  >
                    <td className="px-3 py-2 align-top">
                      <Input
                        value={li.description}
                        onChange={(e) =>
                          updateLine(i, { description: e.target.value })
                        }
                        className="rounded-lg"
                        placeholder="Omschrijving"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={li.quantity || ""}
                        onChange={(e) =>
                          updateLine(i, {
                            quantity: Number(e.target.value),
                          })
                        }
                        className="rounded-lg text-right tabular-nums"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={displayUnitForInput(li.unit_price)}
                        onChange={(e) =>
                          setUnitPriceFromInput(i, e.target.value)
                        }
                        className="rounded-lg text-right tabular-nums"
                      />
                    </td>
                    <td className="px-3 py-2 align-middle text-right font-medium tabular-nums">
                      {formatCurrencyDetailed(li.line_total, quote.currency)}
                    </td>
                    <td className="px-1 py-2 align-middle">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        disabled={draft.lines.length <= 1}
                        onClick={() => removeLine(i)}
                        aria-label="Regel verwijderen"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4 text-sm">
            <div className="flex justify-between tabular-nums">
              <span className="text-muted-foreground">Subtotaal (preview)</span>
              <span>{formatCurrencyDetailed(previewTotals.subtotal, quote.currency)}</span>
            </div>
            <div className="flex justify-between tabular-nums">
              <span className="text-muted-foreground">
                BTW ({Math.round(draft.vat_rate * 100)}%)
              </span>
              <span>
                {formatCurrencyDetailed(previewTotals.vat, quote.currency)}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold tabular-nums text-foreground">
              <span>Totaal (preview)</span>
              <span>
                {formatCurrencyDetailed(previewTotals.total, quote.currency)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              className="rounded-xl"
              disabled={pending && !demoMode}
              onClick={save}
            >
              {pending && !demoMode ? (
                "Opslaan…"
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  {demoMode ? "Demo: wijzigingen vastleggen" : "Wijzigingen opslaan"}
                </>
              )}
            </Button>
            {demoMode ? (
              <p className="text-sm text-muted-foreground">
                Demo: aanpassingen blijven in dit scherm; het overzicht toont de
                vaste voorbeelddata.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Interne notities</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={draft.internal_notes}
            onChange={(e) =>
              setDraft((d) => ({ ...d, internal_notes: e.target.value }))
            }
            className="min-h-[80px] rounded-xl"
          />
        </CardContent>
      </Card>

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
