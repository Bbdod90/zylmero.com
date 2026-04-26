import { escapeHtmlText } from "@/lib/marketing/email-templates";

function firstName(fullName: string): string {
  const t = fullName.trim();
  if (!t) return "";
  return t.split(/\s+/)[0] ?? t;
}

/** Vervangt placeholders in je HTML; waarden worden ge-escaped voor veilige weergave. */
export function personalizeNewsletterHtml(
  html: string,
  lead: { full_name: string },
): string {
  const full = escapeHtmlText(lead.full_name.trim() || "klant");
  const first = escapeHtmlText(firstName(lead.full_name) || "daar");
  return html
    .replace(/\{\{\s*naam\s*\}\}/gi, full)
    .replace(/\{\{\s*voornaam\s*\}\}/gi, first);
}
