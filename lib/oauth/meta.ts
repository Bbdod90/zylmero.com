import { resolveSiteUrl } from "@/lib/site-url";

const FB_VERSION = "v21.0";

export function metaAppConfigured(): boolean {
  return Boolean(
    process.env.META_APP_ID?.trim() && process.env.META_APP_SECRET?.trim(),
  );
}

export function buildMetaOAuthUrl(state: string): string | null {
  const appId = process.env.META_APP_ID?.trim();
  if (!appId) return null;
  const redirect = `${resolveSiteUrl().replace(/\/$/, "")}/api/oauth/meta/callback`;
  const scope = [
    "pages_show_list",
    "pages_messaging",
    "instagram_basic",
    "instagram_manage_messages",
    "business_management",
  ].join(",");
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirect,
    state,
    response_type: "code",
    scope,
  });
  return `https://www.facebook.com/${FB_VERSION}/dialog/oauth?${params.toString()}`;
}

export async function exchangeMetaOAuthCode(
  code: string,
): Promise<{ access_token: string; expires_in?: number }> {
  const appId = process.env.META_APP_ID?.trim();
  const secret = process.env.META_APP_SECRET?.trim();
  if (!appId || !secret) {
    throw new Error("META_APP_ID / META_APP_SECRET ontbreken");
  }
  const redirect = `${resolveSiteUrl().replace(/\/$/, "")}/api/oauth/meta/callback`;
  const url = new URL(`https://graph.facebook.com/${FB_VERSION}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("client_secret", secret);
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
