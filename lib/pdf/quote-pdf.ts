import { jsPDF } from "jspdf";
import type { Quote } from "@/lib/types";
import { formatCurrencyDetailed } from "@/lib/utils";
import { quoteStatusNl } from "@/lib/i18n/nl-labels";

export type QuotePdfExtras = {
  /** Vaste intro uit instellingen */
  quoteIntro: string | null;
  /** Voettekst bedrijf (voorwaarden, betaling) */
  quoteFooter: string | null;
  /** Prijshints uit Kennis (company_settings.pricing_hints) */
  pricingHints: string | null;
  includePricingHints: boolean;
  includeZylmeroNotice: boolean;
  zylmeroNoticeText: string;
};

export function buildQuotePdfBytes(params: {
  quote: Quote;
  companyName: string;
  leadName: string | null;
  extras?: QuotePdfExtras | null;
}): Uint8Array {
  const { quote, companyName, leadName, extras } = params;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 18;
  let y = margin;
  const pageW = doc.internal.pageSize.getWidth();
  const maxW = pageW - margin * 2;

  const addParagraph = (text: string, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.45;
    }
    y += 3;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Offerte", margin, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(quote.title, margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Status: ${quoteStatusNl(quote.status)}`, margin, y);
  y += 5;
  doc.text(`Valuta: ${quote.currency}`, margin, y);
  y += 8;
  doc.setTextColor(0, 0, 0);

  addParagraph(`Leverancier: ${companyName}`, 10);
  if (leadName) {
    addParagraph(`Klant: ${leadName}`, 10);
  }

  if (extras?.quoteIntro?.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (y > 250) {
      doc.addPage();
      y = margin;
    }
    doc.text("Introductie", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    addParagraph(extras.quoteIntro.trim(), 10);
  }

  if (quote.description) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    doc.text("Omschrijving", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    addParagraph(quote.description, 10);
  }

  if (
    extras?.includePricingHints &&
    extras.pricingHints &&
    extras.pricingHints.trim()
  ) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (y > 250) {
      doc.addPage();
      y = margin;
    }
    doc.text("Prijzen en richtlijnen (uit je kennisbank)", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    addParagraph(extras.pricingHints.trim(), 9);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  if (y > 250) {
    doc.addPage();
    y = margin;
  }
  doc.text("Regels", margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const colDesc = margin;
  const colQty = pageW - margin - 75;
  const colUnit = pageW - margin - 50;
  const colTot = pageW - margin - 22;

  doc.setFont("helvetica", "bold");
  doc.text("Omschrijving", colDesc, y);
  doc.text("Aantal", colQty, y, { align: "right" });
  doc.text("Prijs", colUnit, y, { align: "right" });
  doc.text("Totaal", colTot, y, { align: "right" });
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");

  for (const li of quote.line_items || []) {
    const descLines = doc.splitTextToSize(li.description, colQty - colDesc - 4);
    const blockH = Math.max(descLines.length * 4.5, 6);
    if (y + blockH > 285) {
      doc.addPage();
      y = margin;
    }
    doc.text(descLines, colDesc, y + 4);
    doc.text(String(li.quantity), colQty, y + 4, { align: "right" });
    doc.text(
      formatCurrencyDetailed(li.unit_price, quote.currency),
      colUnit,
      y + 4,
      { align: "right" },
    );
    doc.text(
      formatCurrencyDetailed(li.line_total, quote.currency),
      colTot,
      y + 4,
      { align: "right" },
    );
    y += blockH + 2;
  }

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const labelX = pageW - margin - 55;
  const valX = pageW - margin;
  doc.text("Subtotaal", labelX, y, { align: "right" });
  doc.text(
    formatCurrencyDetailed(quote.subtotal, quote.currency),
    valX,
    y,
    { align: "right" },
  );
  y += 6;
  doc.text(
    `BTW (${Math.round(quote.vat_rate * 100)}%)`,
    labelX,
    y,
    { align: "right" },
  );
  doc.text(
    formatCurrencyDetailed(quote.vat_amount, quote.currency),
    valX,
    y,
    { align: "right" },
  );
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Totaal", labelX, y, { align: "right" });
  doc.text(
    formatCurrencyDetailed(quote.total, quote.currency),
    valX,
    y,
    { align: "right" },
  );
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  if (extras?.quoteFooter?.trim()) {
    if (y > 240) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Voorwaarden en opmerkingen", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    addParagraph(extras.quoteFooter.trim(), 9);
  }

  if (extras?.includeZylmeroNotice && extras.zylmeroNoticeText.trim()) {
    if (y > 250) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    addParagraph(extras.zylmeroNoticeText.trim(), 8);
  }

  const buf = doc.output("arraybuffer");
  return new Uint8Array(buf);
}
