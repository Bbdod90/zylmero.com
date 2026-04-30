import { resolveSiteUrl } from "@/lib/site-url";

const MS_AUTH_BASE = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MS_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const MS_ME_URL = "https://graph.microsoft.com/v1.0/me";
const MS_SCOPE = "offline_access openid profile email Mail.Read User.Read";

export type MicrosoftEmailToken = {
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
      process.env.MICROSOFT_OAUTH_CLIENT_ID?.trim() ||
      process.env.MICROSOFT_CLIENT_ID?.trim() ||
      process.env.AZURE_CLIENT_ID?.trim() ||
      process.env.MS_OAUTH_CLIENT_ID?.trim() ||
      "",
    clientSecret:
      process.env.MICROSOFT_OAUTH_CLIENT_SECRET?.trim() ||
      process.env.MICROSOFT_CLIENT_SECRET?.trim() ||
      process.env.AZURE_CLIENT_SECRET?.trim() ||
      process.env.MS_OAUTH_CLIENT_SECRET?.trim() ||
      "",
  };
}

function redirectUri(): string {
  const site = resolveSiteUrl().replace(/\/$/, "");
  return `${site}/api/oauth/microsoft-email/callback`;
}

export function microsoftEmailConfigured(): boolean {
  const cfg = oauthConfig();
  return Boolean(cfg.clientId && cfg.clientSecret);
}

export function buildMicrosoftEmailOAuthUrl(state: string): string | null {
  const cfg = oauthConfig();
  if (!cfg.clientId || !cfg.clientSecret) return null;
  const url = new URL(MS_AUTH_BASE);
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", MS_SCOPE);
  /** Expliciet account kiezen (zakelijke/persoonlijke Microsoft-login). */
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeMicrosoftEmailCode(code: string): Promise<MicrosoftEmailToken> {
  const cfg = oauthConfig();
  if (!cfg.clientId || !cfg.clientSecret) throw new Error("microsoft_email_not_configured");
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    code,
    redirect_uri: redirectUri(),
    grant_type: "authorization_code",
  });
  const res = await fetch(MS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`microsoft_email_exchange_failed:${res.status}`);
  const json = (await res.json()) as MicrosoftEmailToken;
  return {
    ...json,
    expiry_date: typeof json.expires_in === "number" ? Date.now() + json.expires_in * 1000 : undefined,
  };
}

export async function fetchMicrosoftEmailProfile(accessToken: string): Promise<{ email?: string; name?: string }> {
  const res = await fetch(MS_ME_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`microsoft_email_profile_failed:${res.status}`);
  const me = (await res.json()) as { mail?: string; userPrincipalName?: string; displayName?: string };
  return {
    email: me.mail || me.userPrincipalName,
    name: me.displayName,
  };
}
