import { BRAND_NAME } from "@/lib/brand";

/** Standaard platformvermelding op offertes (aanpasbaar via instellingen aan/uit). */
export function getDefaultZylmeroQuoteNoticeNl(): string {
  return [
    `Deze offerte is opgesteld en beheerd via ${BRAND_NAME}.`,
    "Prijzen en voorwaarden zijn die van uw leverancier (hierboven); technische beschikbaarheid van het platform valt onder de gebruiksvoorwaarden van Zylmero.",
  ].join(" ");
}
