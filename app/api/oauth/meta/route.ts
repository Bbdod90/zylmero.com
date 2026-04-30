import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import {
  buildMetaOAuthUrl,
  getMetaCredentialsFromAutomationPreferences,
  metaAppConfigured,
} from "@/lib/oauth/meta";
import { resolveSiteUrl } from "@/lib/site-url";

const COOKIE_PREFIX = "meta_oauth_";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nextTarget = searchParams.get("next") === "socials" ? "socials" : "settings";
  const site = resolveSiteUrl().replace(/\/$/, "");
  const fail = (msg: string) =>
    NextResponse.redirect(
      new URL(
        nextTarget === "socials"
          ? `/dashboard/socials?error=${encodeURIComponent(msg)}`
          : `/dashboard/settings?tab=whatsapp&error=${encodeURIComponent(msg)}`,
        site,
      ),
    );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", site));
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!company?.id) {
    return fail("no_company");
  }

  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("automation_preferences")
    .eq("company_id", company.id)
    .maybeSingle();
  const companyMeta = getMetaCredentialsFromAutomationPreferences(
    (settingsRow?.automation_preferences as Record<string, unknown> | null) ??
      null,
  );

  if (!metaAppConfigured(companyMeta ?? undefined)) {
    return fail("meta_not_configured");
  }

  const stateId = randomBytes(12).toString("hex");
  const payload = JSON.stringify({
    companyId: company.id as string,
    userId: user.id,
    next: nextTarget,
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

  const url = buildMetaOAuthUrl(stateId, companyMeta ?? undefined);
  if (!url) return fail("meta_not_configured");

  return NextResponse.redirect(url);
}
