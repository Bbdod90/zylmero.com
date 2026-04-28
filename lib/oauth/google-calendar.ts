import { resolveSiteUrl } from "@/lib/site-url";

const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const GOOGLE_FREEBUSY_URL = "https://www.googleapis.com/calendar/v3/freeBusy";
const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const GOOGLE_PROFILE_SCOPE = "https://www.googleapis.com/auth/userinfo.email";

export type GoogleTokenPayload = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
};

function oauthConfig() {
  return {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() || "",
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim() || "",
  };
}

function redirectUri(): string {
  const site = resolveSiteUrl().replace(/\/$/, "");
  return `${site}/api/oauth/google-calendar/callback`;
}

export function googleCalendarConfigured(): boolean {
  const cfg = oauthConfig();
  return Boolean(cfg.clientId && cfg.clientSecret);
}

export function buildGoogleCalendarOAuthUrl(state: string): string | null {
  const cfg = oauthConfig();
  if (!cfg.clientId || !cfg.clientSecret) return null;
  const url = new URL(GOOGLE_AUTH_BASE);
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", `${GOOGLE_CALENDAR_SCOPE} ${GOOGLE_PROFILE_SCOPE}`);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGoogleOAuthCode(code: string): Promise<GoogleTokenPayload> {
  const cfg = oauthConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error("google_not_configured");
  }
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
  if (!res.ok) {
    throw new Error(`google_token_exchange_failed:${res.status}`);
  }
  const json = (await res.json()) as GoogleTokenPayload;
  return {
    ...json,
    expiry_date: typeof json.expires_in === "number" ? Date.now() + json.expires_in * 1000 : undefined,
  };
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<GoogleTokenPayload> {
  const cfg = oauthConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error("google_not_configured");
  }
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: "refresh_token",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`google_token_refresh_failed:${res.status}`);
  }
  const json = (await res.json()) as GoogleTokenPayload;
  return {
    ...json,
    refresh_token: refreshToken,
    expiry_date: typeof json.expires_in === "number" ? Date.now() + json.expires_in * 1000 : undefined,
  };
}

export async function fetchGoogleUserProfile(accessToken: string): Promise<{ email?: string; name?: string }> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`google_userinfo_failed:${res.status}`);
  }
  const json = (await res.json()) as { email?: string; name?: string };
  return json;
}

export async function fetchGoogleBusyRanges(input: {
  accessToken: string;
  timeMinIso: string;
  timeMaxIso: string;
  calendarId?: string;
}): Promise<Array<{ start: string; end: string }>> {
  const res = await fetch(GOOGLE_FREEBUSY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: input.timeMinIso,
      timeMax: input.timeMaxIso,
      items: [{ id: input.calendarId || "primary" }],
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`google_freebusy_failed:${res.status}`);
  }
  const payload = (await res.json()) as {
    calendars?: Record<string, { busy?: Array<{ start?: string; end?: string }> }>;
  };
  const calendarKey = input.calendarId || "primary";
  const busyRaw = payload.calendars?.[calendarKey]?.busy || [];
  return busyRaw
    .map((row) => ({ start: row.start || "", end: row.end || "" }))
    .filter((row) => row.start && row.end);
}
