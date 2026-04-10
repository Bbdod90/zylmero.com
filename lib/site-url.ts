/**
 * Publieke basis-URL zonder trailing slash.
 * Geen localhost-fallback: zet NEXT_PUBLIC_SITE_URL in Vercel + lokaal in .env.local.
 * Op Vercel-preview kan VERCEL_URL als fallback dienen als NEXT_PUBLIC_SITE_URL nog niet gezet is.
 */
export function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const v = process.env.VERCEL_URL?.trim();
  if (v) {
    if (v.startsWith("http://") || v.startsWith("https://")) {
      return v.replace(/\/$/, "");
    }
    return `https://${v.replace(/\/$/, "")}`;
  }
  throw new Error(
    "NEXT_PUBLIC_SITE_URL ontbreekt. Zet je productie-URL (bijv. https://jouw-app.vercel.app) in .env.local en in Vercel → Environment Variables.",
  );
}
