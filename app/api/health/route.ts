import { NextResponse } from "next/server";

/**
 * Snelle productie-check: open in de browser `/api/health` (geen auth).
 * Helpt bij "AI werkt niet" / ontbrekende env vóór een demo met klanten.
 */
export async function GET() {
  const hasOpenai = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasSupabaseAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const hasSiteUrl =
    Boolean(process.env.SITE_URL?.trim()) || Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim());

  const checks = {
    openai_api_key: hasOpenai,
    next_public_supabase_url: hasSupabaseUrl,
    next_public_supabase_anon_key: hasSupabaseAnon,
    supabase_service_role_key: hasServiceRole,
    site_url: hasSiteUrl,
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
        ? "Kern-env ziet er goed uit. Blijft iets kapot? Check Supabase SQL-migraties (o.a. leads) en deploy logs."
        : "Vul ontbrekende variabelen in Vercel/hosting en deploy opnieuw. Zonder OPENAI_API_KEY werkt website-chat / Live test niet.",
    },
    { status: ok ? 200 : 503 },
  );
}
