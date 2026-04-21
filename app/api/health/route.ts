import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Snelle productie-check: open in de browser `/api/health` (geen auth).
 * Helpt bij "AI werkt niet" / ontbrekende env vóór een demo met klanten.
 */
async function outboundHttpsReachable(): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch("https://example.com", {
      method: "HEAD",
      signal: ctrl.signal,
      cache: "no-store",
    });
    return res.ok || res.status === 301 || res.status === 302 || res.status === 308;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

export async function GET() {
  const hasOpenai = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasSupabaseAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const hasSiteUrl =
    Boolean(process.env.SITE_URL?.trim()) || Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim());

  const outboundHttps = await outboundHttpsReachable();

  const checks = {
    openai_api_key: hasOpenai,
    next_public_supabase_url: hasSupabaseUrl,
    next_public_supabase_anon_key: hasSupabaseAnon,
    supabase_service_role_key: hasServiceRole,
    site_url: hasSiteUrl,
    /** Server kan https:// bereiken (nodig om kennis-URL’s op te halen voor AI-kennis) */
    outbound_https_head: outboundHttps,
  };

  const ok =
    hasOpenai &&
    hasSupabaseUrl &&
    hasSupabaseAnon &&
    hasServiceRole;

  return NextResponse.json(
    {
      ok,
      service: "zylmero",
      checks,
      hint: ok
        ? outboundHttps
          ? "Kern-env ziet er goed uit; uitgaand HTTPS werkt (URL-kennis kan worden opgehaald). Blijft iets kapot? Check Supabase SQL-migraties en deploy logs."
          : "Kern-env is ok, maar uitgaand HTTPS lijkt geblokkeerd — AI kan URL-kennis niet ophalen. Check firewall/Vercel egress. Verder: migraties en deploy logs."
        : "Vul ontbrekende variabelen in Vercel/hosting en deploy opnieuw. Zonder OPENAI_API_KEY werken AI-antwoorden en slimme opvolging niet.",
    },
    { status: ok ? 200 : 503 },
  );
}
