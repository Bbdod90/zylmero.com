/**
 * NL-label voor tabellen en filters.
 * Opgeslagen waarden in `leads.source` blijven Engels (historisch) — niet wijzigen zonder migratie.
 */
export function labelLeadSource(value: string | null | undefined): string {
  const v = (value || "").trim();
  switch (v) {
    case "":
      return "—";
    case "Website":
      return "Website";
    case "Google Maps":
      return "Google Maps";
    case "WhatsApp":
      return "WhatsApp";
    case "Referral":
      return "Aanbeveling";
    case "Facebook":
      return "Facebook";
    case "Instagram":
      return "Instagram";
    case "Cold call":
      return "Zelf benaderd";
    default:
      return v || "—";
  }
}
