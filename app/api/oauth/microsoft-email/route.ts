import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { buildMicrosoftEmailOAuthUrl, microsoftEmailConfigured } from "@/lib/oauth/microsoft-email";
import { resolveSiteUrl } from "@/lib/site-url";

const COOKIE_PREFIX = "microsoft_email_oauth_";

export async function GET() {
  const site = resolveSiteUrl().replace(/\/$/, "");
  const fail = (msg: string) =>
    NextResponse.redirect(new URL(`/dashboard/settings?tab=email&error=${encodeURIComponent(msg)}`, site));
  if (!microsoftEmailConfigured()) return fail("microsoft_email_not_configured");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", site));
  const { data: company } = await supabase.from("companies").select("id").eq("owner_user_id", user.id).maybeSingle();
  if (!company?.id) return fail("no_company");

  const stateId = randomBytes(12).toString("hex");
  const payload = JSON.stringify({ companyId: company.id as string, userId: user.id, exp: Date.now() + 10 * 60 * 1000 });
  const jar = await cookies();
  jar.set(`${COOKIE_PREFIX}${stateId}`, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const url = buildMicrosoftEmailOAuthUrl(stateId);
  if (!url) return fail("microsoft_email_not_configured");
  return NextResponse.redirect(url);
}
