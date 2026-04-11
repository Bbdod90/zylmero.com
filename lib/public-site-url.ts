import { BRAND_DEFAULT_SITE_URL, BRAND_PRODUCTION_HOSTNAMES } from "@/lib/brand";

/**
 * Alleen voor client components — geen `next/server`-imports.
 *
 * Signup draait in de browser zodat Supabase rate limits per eindgebruiker-IP telt (niet het server-IP).
 *
 * Op je echte domein: als de build per ongeluk nog `localhost` in NEXT_PUBLIC_SITE_URL heeft,
 * gebruiken we `window.location.origin` zodat de bevestigingsmail naar het juiste domein wijst.
 *
 * Op productie-host (zylmero.com / www): altijd canonieke https-URL — zelfde link in mail op elk apparaat.
 */
function isLocalUrl(u: string): boolean {
  try {
    const h = new URL(u).hostname;
    return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
  } catch {
    return false;
  }
}

export function getPublicSiteUrlForClient(): string | null {
  const canonical = BRAND_DEFAULT_SITE_URL.replace(/\/$/, "");
  const fromEnvRaw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const validEnv =
    !!fromEnvRaw &&
    (fromEnvRaw.startsWith("https://") || fromEnvRaw.startsWith("http://"));
  const envUsable = validEnv && !isLocalUrl(fromEnvRaw);

  if (typeof window !== "undefined") {
    const isProdBuild = process.env.NODE_ENV === "production";
    /* Productie-build: nooit localhost/Railway-copypaste in bevestigingsmail — altijd echt domein. */
    if (isProdBuild) {
      if (envUsable) return fromEnvRaw;
      return canonical;
    }

    const host = window.location.hostname.toLowerCase();
    if (BRAND_PRODUCTION_HOSTNAMES.has(host)) {
      return canonical;
    }
    const o = window.location.origin;
    if (isLocalUrl(o)) {
      if (validEnv && isLocalUrl(fromEnvRaw)) return fromEnvRaw;
      return o;
    }
    if (!validEnv || isLocalUrl(fromEnvRaw)) return o;
    return fromEnvRaw;
  }

  return envUsable ? fromEnvRaw : canonical;
}
