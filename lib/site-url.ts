import type { NextRequest } from "next/server";
import { BRAND_DEFAULT_SITE_URL } from "@/lib/brand";

/** True op Railway/Vercel/… zodat we nooit `Location: https://localhost:8080` sturen. */
export function isDeployedRuntime(): boolean {
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.RAILWAY_ENVIRONMENT === "production") return true;
  /* Ook als NODE_ENV per ongeluk niet "production" is op Railway: */
  if (process.env.RAILWAY_PROJECT_ID) return true;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return true;
  if (process.env.VERCEL === "1") return true;
  if (process.env.FLY_APP_NAME) return true;
  return false;
}

/**
 * Publieke basis-URL zonder trailing slash (auth redirects, Stripe, e-mail links).
 * Productie: zet `SITE_URL` + `NEXT_PUBLIC_SITE_URL` (zelfde als Supabase Site URL). Zie `preferredExplicitBase`.
 */
function trimBase(raw: string | undefined): string | null {
  const s = raw?.trim().replace(/\/$/, "");
  return s || null;
}

function withHttps(hostOrUrl: string): string {
  const h = hostOrUrl.trim().replace(/\/$/, "");
  if (h.startsWith("http://") || h.startsWith("https://")) return h;
  return `https://${h}`;
}

function isHttpBase(raw: string): boolean {
  return raw.startsWith("https://") || raw.startsWith("http://");
}

/** localhost / loopback — op productie-host nooit gebruiken voor mail-redirects (Next bakt NEXT_PUBLIC_* in bij build). */
function isLocalBaseUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return (
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "[::1]"
    );
  } catch {
    return false;
  }
}

function deployedPublicHostHint(): string | null {
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) return withHttps(railway);
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return withHttps(vercel);
  return null;
}

/**
 * Server-only, runtime (niet ingevroren bij `next build` zoals NEXT_PUBLIC_*).
 * Zet op Railway/Vercel: SITE_URL=https://zylmero.com — dan klopt `emailRedirectTo` ook na oude builds.
 *
 * In **production** nooit localhost/127.0.0.1 als basis — ook niet als `RAILWAY_PUBLIC_DOMAIN` ontbreekt,
 * anders blijft `SITE_URL=https://localhost:8080` (verkeerde Railway-copypaste) redirect-URLs breken op telefoons.
 */
function preferredExplicitBase(): string | null {
  const deployed = isDeployedRuntime();

  const siteUrl = trimBase(process.env.SITE_URL);
  if (siteUrl && isHttpBase(siteUrl)) {
    if (deployed && isLocalBaseUrl(siteUrl)) {
      /* Railway-copypaste: SITE_URL=https://localhost:8080 — negeren op productie. */
    } else if (!deployed || !isLocalBaseUrl(siteUrl)) {
      return siteUrl;
    }
  }

  let fromPublic =
    trimBase(process.env.NEXT_PUBLIC_SITE_URL) ||
    trimBase(process.env.NEXT_PUBLIC_APP_URL);
  if (fromPublic && isHttpBase(fromPublic)) {
    if (deployed && isLocalBaseUrl(fromPublic)) {
      fromPublic = null;
    }
  }
  return fromPublic;
}

export function resolveSiteUrl(): string {
  const explicit = preferredExplicitBase();
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return withHttps(vercel);

  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) return withHttps(railway);

  const render = process.env.RENDER_EXTERNAL_URL?.trim();
  if (render) return trimBase(render)!;

  const fly = process.env.FLY_APP_NAME?.trim();
  if (fly) return `https://${fly}.fly.dev`;

  throw new Error(
    "SITE_URL of NEXT_PUBLIC_SITE_URL ontbreekt. Zet in productie o.a. SITE_URL=https://jouwdomein.nl (zelfde als Supabase → Authentication → Site URL).",
  );
}

/** Zelfde als resolveSiteUrl, maar null i.p.v. throw (voor server actions met nette fouttekst). */
export function tryResolveSiteUrl(): string | null {
  try {
    return resolveSiteUrl();
  } catch {
    return null;
  }
}

const LOCAL_HOST_RE = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

function hostLooksPublic(host: string | undefined): boolean {
  if (!host?.trim()) return false;
  return !LOCAL_HOST_RE.test(host.trim());
}

/**
 * Origin voor server-side redirects (o.a. /auth/callback): `request.url` is achter een reverse proxy
 * vaak `http://localhost:…` — dan zou Safari op je telefoon naar localhost navigeren.
 */
export function inferPublicOrigin(request: NextRequest): string {
  const explicit = preferredExplicitBase();
  if (explicit) return explicit;

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  if (forwardedHost) {
    const fromForwarded = `${forwardedProto}://${forwardedHost}`;
    if (!isLocalBaseUrl(fromForwarded)) {
      return fromForwarded;
    }
  }

  const host = request.headers.get("host")?.trim();
  if (hostLooksPublic(host)) {
    return `${forwardedProto}://${host}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return withHttps(vercel);

  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) return withHttps(railway);

  const render = process.env.RENDER_EXTERNAL_URL?.trim();
  if (render) return trimBase(render)!;

  const fly = process.env.FLY_APP_NAME?.trim();
  if (fly) return `https://${fly}.fly.dev`;

  const internalOrigin = new URL(request.url).origin;
  if (!isLocalBaseUrl(internalOrigin)) {
    return internalOrigin;
  }
  const hint = deployedPublicHostHint();
  if (hint) {
    return hint;
  }
  /* Laatste redmiddel op hosting: nooit Location: https://localhost:… naar telefoons. */
  if (isDeployedRuntime()) {
    const fallback = trimBase(BRAND_DEFAULT_SITE_URL);
    if (fallback && isHttpBase(fallback) && !isLocalBaseUrl(fallback)) {
      return fallback;
    }
  }
  return internalOrigin;
}
