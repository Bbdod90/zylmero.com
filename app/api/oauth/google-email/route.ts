import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAuth } from "@/lib/auth";
import {
  buildGoogleEmailOAuthUrl,
  googleEmailConnectConfigured,
} from "@/lib/oauth/google-email";
import { resolveSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const COOKIE_PREFIX = "google_email_oauth_";

export async function GET() {
  const site = resolveSiteUrl().replace(/\/$/, "");
  const fail = (msg: string) =>
    NextResponse.redirect(new URL(`/dashboard/settings?tab=email&error=${encodeURIComponent(msg)}`, site));

  if (!googleEmailConnectConfigured()) return fail("google_email_not_configured");

  const auth = await getAuth();
  if (!auth.user) return NextResponse.redirect(new URL("/login", site));
  if (!auth.company) return fail("no_company");

  const stateId = randomBytes(12).toString("hex");
  const payload = JSON.stringify({
    companyId: auth.company.id,
    userId: auth.user.id,
    exp: Date.now() + 10 * 60 * 1000,
  });

  const jar = await cookies();
  jar.set(`${COOKIE_PREFIX}${stateId}`, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const url = buildGoogleEmailOAuthUrl(stateId);
  if (!url) return fail("google_email_not_configured");
  return NextResponse.redirect(url);
}
