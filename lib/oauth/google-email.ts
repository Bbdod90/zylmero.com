import { resolveSiteUrl } from "@/lib/site-url";

const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const GOOGLE_SCOPE = "openid email profile https://www.googleapis.com/auth/gmail.readonly";

export type GoogleEmailToken = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
};

function oauthConfig() {
  return {
    clientId:
      process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() ||
      process.env.GOOGLE_CLIENT_ID?.trim() ||
      process.env.GOOGLE_EMAIL_CLIENT_ID?.trim() ||
      process.env.GOOGLE_WORKSPACE_CLIENT_ID?.trim() ||
      process.env.GMAIL_CLIENT_ID?.trim() ||
      process.env.GOOGLE_OAUTH_CLIENTID?.trim() ||
      "",
    clientSecret:
      process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim() ||
      process.env.GOOGLE_CLIENT_SECRET?.trim() ||
      process.env.GOOGLE_EMAIL_CLIENT_SECRET?.trim() ||
      process.env.GOOGLE_WORKSPACE_CLIENT_SECRET?.trim() ||
      process.env.GMAIL_CLIENT_SECRET?.trim() ||
      process.env.GOOGLE_OAUTH_CLIENTSECRET?.trim() ||
      "",
  };
}

function redirectUri(): string {
  const site = resolveSiteUrl().replace(/\/$/, "");
  return `${site}/api/oauth/google-email/callback`;
}

export function googleEmailConfigured(): boolean {
  const cfg = oauthConfig();
  return Boolean(cfg.clientId && cfg.clientSecret);
}

export function buildGoogleEmailOAuthUrl(state: string): string | null {
  const cfg = oauthConfig();
  if (!cfg.clientId || !cfg.clientSecret) return null;
  const url = new URL(GOOGLE_AUTH_BASE);
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_SCOPE);
  url.searchParams.set("access_type", "offline");
  /** Accountkiezer + consent waar nodig (refresh token). */
  url.searchParams.set("prompt", "select_account consent");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGoogleEmailCode(code: string): Promise<GoogleEmailToken> {
  const cfg = oauthConfig();
  if (!cfg.clientId || !cfg.clientSecret) throw new Error("google_email_not_configured");
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: redirectUri(),
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`google_email_exchange_failed:${res.status}`);
  const json = (await res.json()) as GoogleEmailToken;
  return {
    ...json,
    expiry_date: typeof json.expires_in === "number" ? Date.now() + json.expires_in * 1000 : undefined,
  };
}

export async function fetchGoogleEmailProfile(accessToken: string): Promise<{ email?: string; name?: string }> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`google_email_profile_failed:${res.status}`);
  return (await res.json()) as { email?: string; name?: string };
}
