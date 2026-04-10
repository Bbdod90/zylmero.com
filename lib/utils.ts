import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "EUR",
  locale: string = "nl-NL",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Eurobedragen met centen (offertes, BTW). */
export function formatCurrencyDetailed(
  amount: number,
  currency: string = "EUR",
  locale: string = "nl-NL",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(
  d: string | Date,
  pattern: string = "d MMM yyyy HH:mm",
) {
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, pattern, { locale: nl });
}

export function formatDateShort(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, "EEEE d MMM", { locale: nl });
}
