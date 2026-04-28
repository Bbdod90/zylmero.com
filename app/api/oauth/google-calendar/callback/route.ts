import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeGoogleOAuthCode,
  fetchGoogleUserProfile,
  googleCalendarConfigured,
} from "@/lib/oauth/google-calendar";
import { sealSocialToken } from "@/lib/crypto/social-token";
import { resolveSiteUrl } from "@/lib/site-url";

const COOKIE_PREFIX = "google_calendar_oauth_";

export async function GET(request: Request) {
  const site = resolveSiteUrl().replace(/\/$/, "");
  const ok = () =>
    NextResponse.redirect(new URL("/dashboard/socials?gcal=connected", site));
  const fail = (msg: string) =>
    NextResponse.redirect(
      new URL(`/dashboard/socials?error=${encodeURIComponent(msg)}`, site),
    );

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateId = searchParams.get("state");
  const err = searchParams.get("error_description") || searchParams.get("error");

  if (err) return fail(String(err).slice(0, 200));
  if (!code || !stateId) return fail("missing_code");
  if (!googleCalendarConfigured()) return fail("google_calendar_not_configured");

  const jar = await cookies();
  const raw = jar.get(`${COOKIE_PREFIX}${stateId}`)?.value;
  jar.set(`${COOKIE_PREFIX}${stateId}`, "", { maxAge: 0, path: "/" });
  if (!raw) return fail("state_expired");

  let payload: { companyId: string; userId: string; exp: number };
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    return fail("invalid_state");
  }
  if (payload.exp < Date.now()) return fail("state_expired");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== payload.userId) return fail("session_mismatch");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", payload.companyId)
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!company?.id) return fail("no_company");

  try {
    const token = await exchangeGoogleOAuthCode(code);
    const profile = await fetchGoogleUserProfile(token.access_token);
    const sealed = sealSocialToken(JSON.stringify(token));
    const expiresAt =
      typeof token.expiry_date === "number"
        ? new Date(token.expiry_date).toISOString()
        : null;

    const { error } = await supabase.from("company_social_connections").upsert(
      {
        company_id: payload.companyId,
        provider: "google_calendar",
        status: "connected",
        display_name: profile.name ?? profile.email ?? "Google Agenda",
        external_page_id: profile.email ?? null,
        metadata: {
          email: profile.email ?? null,
          scopes: token.scope ?? null,
        },
        encrypted_token: sealed,
        token_expires_at: expiresAt,
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id,provider" },
    );
    if (error) return fail("db_write");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "exchange_failed";
    await supabase.from("company_social_connections").upsert(
      {
        company_id: payload.companyId,
        provider: "google_calendar",
        status: "error",
        last_error: msg.slice(0, 500),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id,provider" },
    );
    return fail(msg);
  }

  return ok();
}
