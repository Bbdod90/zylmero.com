import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicRedirectOrigin } from "@/lib/proxy-public-request";

function safeNextPath(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

function isPkceCrossDeviceError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("code verifier") ||
    (m.includes("auth code") && m.includes("verifier")) ||
    m.includes("both auth code and code verifier")
  );
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const typeParam = requestUrl.searchParams.get("type");
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const origin = getPublicRedirectOrigin(request);
  if (!url?.trim() || !key?.trim()) {
    return NextResponse.redirect(new URL("/login?reason=config", origin));
  }
  const successInterstitial = new URL("/auth/bevestigd", origin);
  successInterstitial.searchParams.set("next", nextPath);

  const authError = requestUrl.searchParams.get("error");
  const authErrorDesc = requestUrl.searchParams.get("error_description");
  if (authError) {
    const msg = authErrorDesc || authError;
    return NextResponse.redirect(
      new URL(
        `/login?reason=auth&detail=${encodeURIComponent(msg.slice(0, 200))}`,
        origin,
      ),
    );
  }

  const cookieStore = await cookies();

  if (code) {
    const response = NextResponse.redirect(successInterstitial);
    const supabaseWithCookies = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    const { error } = await supabaseWithCookies.auth.exchangeCodeForSession(code);
    if (error) {
      if (isPkceCrossDeviceError(error.message)) {
        return NextResponse.redirect(new URL("/login?reason=pkce", origin));
      }
      return NextResponse.redirect(
        new URL(
          `/login?reason=auth&detail=${encodeURIComponent(error.message.slice(0, 180))}`,
          origin,
        ),
      );
    }
    return response;
  }

  if (tokenHash && typeParam) {
    const allowed: EmailOtpType[] = [
      "signup",
      "invite",
      "magiclink",
      "recovery",
      "email_change",
      "email",
    ];
    const t = typeParam as EmailOtpType;
    if (!allowed.includes(t)) {
      return NextResponse.redirect(new URL("/login?reason=auth", origin));
    }
    const responseOtp = NextResponse.redirect(successInterstitial);
    const supabaseOtp = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            responseOtp.cookies.set(name, value, options),
          );
        },
      },
    });
    const { error } = await supabaseOtp.auth.verifyOtp({
      token_hash: tokenHash,
      type: t,
    });
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/login?reason=auth&detail=${encodeURIComponent(error.message.slice(0, 180))}`,
          origin,
        ),
      );
    }
    return responseOtp;
  }

  /* Geen code: directe bezoek of mislukte redirect — geen sessie gezet. */
  return NextResponse.redirect(new URL("/login?reason=verify", origin));
}
