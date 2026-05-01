/**
 * Publieke contactlinks voor de website-widget (geen geheime data).
 * Normaliseert NL-nummers grofweg naar cijfers voor tel: en wa.me.
 */

export type WidgetContactPublic = {
  tel_href: string | null;
  whatsapp_href: string | null;
  /** Korte weergave op de bel-knop */
  phone_display: string | null;
};

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * E.164 zonder + (bv. 31612345678). Null als het niet bruikbaar is.
 */
export function normalizeToE164Digits(raw: string): string | null {
  let d = digitsOnly(raw.trim());
  if (d.length < 9) return null;
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length >= 10) {
    d = "31" + d.slice(1);
  }
  if (d.startsWith("31") && d.length >= 11 && d.length <= 12) return d;
  if (!d.startsWith("0") && d.length >= 10 && d.length <= 15) return d;
  return null;
}

/** Leesbare NL-weergave waar mogelijk. */
export function formatPhoneDisplay(raw: string, e164Digits: string | null): string {
  const t = raw.trim();
  if (t.length >= 8 && /[\d\s+\-()]/.test(t)) return t.replace(/\s+/g, " ").slice(0, 28);
  if (e164Digits?.startsWith("31") && e164Digits.length >= 11) {
    const rest = e164Digits.slice(2);
    if (rest.startsWith("6") && rest.length === 9) {
      return `+31 ${rest.slice(0, 1)} ${rest.slice(1, 3)} ${rest.slice(3, 5)} ${rest.slice(5, 7)} ${rest.slice(7)}`.trim();
    }
    return `+${e164Digits.slice(0, 2)} ${rest}`.trim();
  }
  return t.slice(0, 24) || (e164Digits ? `+${e164Digits}` : "");
}

export function buildWidgetContactLinks(params: {
  contactPhoneRaw: string | null;
  whatsappPhoneRaw: string | null;
}): WidgetContactPublic {
  const contact = params.contactPhoneRaw?.trim() || null;
  const waChannel = params.whatsappPhoneRaw?.trim() || null;
  const telDigits = contact ? normalizeToE164Digits(contact) : null;
  const waDigits = (waChannel || contact) ? normalizeToE164Digits(waChannel || contact || "") : null;

  return {
    tel_href: telDigits ? `tel:+${telDigits}` : null,
    whatsapp_href: waDigits ? `https://wa.me/${waDigits}` : null,
    phone_display: contact
      ? formatPhoneDisplay(contact, telDigits)
      : telDigits
        ? `+${telDigits}`
        : null,
  };
}
