import { resolveSiteUrl } from "@/lib/site-url";
import { unsealSocialToken } from "@/lib/crypto/social-token";

const FB_VERSION = "v21.0";

export type MetaOAuthCredentials = {
  appId: string;
  appSecret: string;
};

export function getMetaCredentialsFromAutomationPreferences(
  prefs: Record<string, unknown> | null | undefined,
): MetaOAuthCredentials | null {
  if (!prefs || typeof prefs !== "object") return null;
  const appId =
    typeof prefs.meta_app_id === "string" ? prefs.meta_app_id.trim() : "";
  const encryptedSecret =
    typeof prefs.meta_app_secret_encrypted === "string"
      ? prefs.meta_app_secret_encrypted.trim()
      : "";
  const plainSecret =
    typeof prefs.meta_app_secret === "string" ? prefs.meta_app_secret.trim() : "";
  const appSecret = encryptedSecret
    ? (unsealSocialToken(encryptedSecret)?.trim() ?? "")
    : plainSecret;
  if (!appId || !appSecret) return null;
  return { appId, appSecret };
}

export function resolveMetaOAuthCredentials(
  preferred?: Partial<MetaOAuthCredentials> | null,
): MetaOAuthCredentials | null {
  const appId = preferred?.appId?.trim();
  const appSecret = preferred?.appSecret?.trim();
  if (appId && appSecret) return { appId, appSecret };

  // Accept common naming variants used across hosting setups.
  const envId =
    process.env.META_APP_ID?.trim() ||
    process.env.FACEBOOK_APP_ID?.trim() ||
    process.env.META_CLIENT_ID?.trim() ||
    process.env.META_OAUTH_CLIENT_ID?.trim() ||
    process.env.WHATSAPP_META_APP_ID?.trim() ||
    "";
  const envSecret =
    process.env.META_APP_SECRET?.trim() ||
    process.env.FACEBOOK_APP_SECRET?.trim() ||
    process.env.META_CLIENT_SECRET?.trim() ||
    process.env.META_OAUTH_CLIENT_SECRET?.trim() ||
    process.env.WHATSAPP_META_APP_SECRET?.trim() ||
    "";
  if (!envId || !envSecret) return null;
  return { appId: envId, appSecret: envSecret };
}

export function metaAppConfigured(
  preferred?: Partial<MetaOAuthCredentials> | null,
): boolean {
  return Boolean(resolveMetaOAuthCredentials(preferred));
}

export function buildMetaOAuthUrl(
  state: string,
  preferred?: Partial<MetaOAuthCredentials> | null,
): string | null {
  const creds = resolveMetaOAuthCredentials(preferred);
  if (!creds?.appId) return null;
  const redirect = `${resolveSiteUrl().replace(/\/$/, "")}/api/oauth/meta/callback`;
  const scope = [
    "pages_show_list",
    "pages_messaging",
    "instagram_basic",
    "instagram_manage_messages",
    "business_management",
  ].join(",");
  const params = new URLSearchParams({
    client_id: creds.appId,
    redirect_uri: redirect,
    state,
    response_type: "code",
    scope,
  });
  return `https://www.facebook.com/${FB_VERSION}/dialog/oauth?${params.toString()}`;
}

export async function exchangeMetaOAuthCode(
  code: string,
  preferred?: Partial<MetaOAuthCredentials> | null,
): Promise<{ access_token: string; expires_in?: number }> {
  const creds = resolveMetaOAuthCredentials(preferred);
  if (!creds) {
    throw new Error("META_APP_ID / META_APP_SECRET ontbreken");
  }
  const redirect = `${resolveSiteUrl().replace(/\/$/, "")}/api/oauth/meta/callback`;
  const url = new URL(`https://graph.facebook.com/${FB_VERSION}/oauth/access_token`);
  url.searchParams.set("client_id", creds.appId);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("client_secret", creds.appSecret);
  url.searchParams.set("code", code);
  const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  if (!res.ok || !json.access_token) {
    throw new Error(
      json.error?.message || `Meta token exchange mislukt (${res.status})`,
    );
  }
  return { access_token: json.access_token, expires_in: json.expires_in };
}

export async function fetchMetaManagedPages(accessToken: string): Promise<
  { id: string; name: string }[]
> {
  const url = new URL(`https://graph.facebook.com/${FB_VERSION}/me/accounts`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", "id,name");
  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = (await res.json()) as {
    data?: { id: string; name: string }[];
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(json.error?.message || `Meta pages (${res.status})`);
  }
  return json.data ?? [];
}
