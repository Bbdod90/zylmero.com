import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAuth } from "@/lib/auth";
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

  const auth = await getAuth();
  if (!auth.user) {
    return NextResponse.redirect(new URL("/login", site));
  }
  if (!auth.company) {
    return fail("no_company");
  }

  const supabase = await createClient();
  const companyId = auth.company.id;

  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("automation_preferences")
    .eq("company_id", companyId)
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
    companyId: companyId,
    userId: auth.user.id,
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
