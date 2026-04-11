import { NextRequest } from "next/server";
import { BRAND_DEFAULT_SITE_URL } from "@/lib/brand";
import { inferPublicOrigin, isDeployedRuntime } from "@/lib/site-url";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

function forwardedHostIsPublic(forwarded: string): boolean {
  let host = forwarded.trim();
  if (host.includes("]")) {
    const m = host.match(/^\[([^\]]+)\]/);
    host = m?.[1] ?? host;
  } else {
    host = host.split(":")[0] ?? host;
  }
  return !LOCAL_HOSTNAMES.has(host.toLowerCase());
}

/**
 * Railway/proxy stuurt vaak requests binnen als `https://localhost:8080/...`.
 * Next.js `redirect()` bouwt daarop absolute URL’s → telefoons openen localhost.
 * Met `x-forwarded-host` (en `-proto`) reconstrueren we de echte publieke URL.
 */
export function rewriteRequestToForwardedPublicUrl(request: NextRequest): NextRequest {
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (!forwarded || !forwardedHostIsPublic(forwarded)) {
    return request;
  }

  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const pathAndQuery = request.nextUrl.pathname + request.nextUrl.search;

  let publicUrl: string;
  try {
    const base = new URL(`${proto}://${forwarded}`);
    publicUrl = `${base.origin}${pathAndQuery}`;
  } catch {
    return request;
  }

  const headers = new Headers(request.headers);
  headers.set("host", forwarded);

  /* Alleen GET/HEAD: geen request-body → geen duplex-typing issues in Node/Next. */
  if (request.method !== "GET" && request.method !== "HEAD") {
    return request;
  }

  return new NextRequest(publicUrl, { headers, method: request.method });
}

function isLocalOrigin(origin: string): boolean {
  try {
    const h = new URL(origin).hostname.toLowerCase();
    return (
      h === "localhost" ||
      h === "127.0.0.1" ||
      h === "::1" ||
      h === "[::1]"
    );
  } catch {
    return true;
  }
}

/**
 * Eerst env (SITE_URL / …): op Railway wint dit altijd boven Host=localhost:8080 of :8000.
 * Alleen gebruikt door `/auth/callback`.
 */
function explicitNonLocalOriginFromEnv(): string | null {
  const candidates = [
    process.env.AUTH_PUBLIC_ORIGIN,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ];
  for (const raw of candidates) {
    const s = raw?.trim().replace(/\/$/, "");
    if (!s || (!s.startsWith("http://") && !s.startsWith("https://"))) continue;
    if (!isLocalOrigin(s)) return s;
  }
  return null;
}

/**
 * Basis-URL voor `Location:` in `/auth/callback` e.d. Route handlers zien soms nog
 * `request.url` = localhost:8080 terwijl de proxy wél `x-forwarded-host: zylmero.com` stuurt.
 */
export function getPublicRedirectOrigin(request: NextRequest): string {
  const brand = BRAND_DEFAULT_SITE_URL.replace(/\/$/, "");

  const fromEnv = explicitNonLocalOriginFromEnv();
  if (fromEnv) return fromEnv;

  /*
   * Railway stuurt intern vaak https://localhost:8080/… — headers zijn onbetrouwbaar.
   * `next start` (productie) zet altijd NODE_ENV=production; alleen `next dev` is "development".
   * Zo werkt de fallback ook als Railway geen RAILWAY_PROJECT_ID e.d. injecteert.
   */
  if (process.env.NODE_ENV !== "development") {
    return brand;
  }

  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  if (forwarded && forwardedHostIsPublic(forwarded)) {
    try {
      return new URL(`${proto}://${forwarded}`).origin;
    } catch {
      /* fall through */
    }
  }

  /* Publieke Host (klant op zylmero.com) vóór infer — lost Railway-internal Host=localhost:8080 op. */
  const rawHost = request.headers.get("host")?.split(",")[0]?.trim();
  if (rawHost) {
    const hostOnly = rawHost.split(":")[0]?.toLowerCase() ?? "";
    if (hostOnly && !LOCAL_HOSTNAMES.has(hostOnly) && hostOnly !== "127.0.0.1") {
      try {
        return new URL(`${proto}://${rawHost}`).origin;
      } catch {
        /* fall through */
      }
    }
  }

  const inferred = inferPublicOrigin(request);
  if (isLocalOrigin(inferred) && isDeployedRuntime()) {
    return brand;
  }
  return inferred;
}
