import "server-only";

import { createHmac, randomBytes } from "node:crypto";

import { INTEGRATION_WEBHOOK_TIMEOUT_MS } from "@/lib/integrations/outbound-webhook-constants";

export function generateWebhookSecret(): string {
  return randomBytes(32).toString("hex");
}

/** HMAC-SHA256 hex van de exacte JSON-body (Receiver kan zo verifiëren). */
export function signWebhookPayload(secret: string, rawBody: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

export function isHttpsWebhookUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s || s.length > 2048) return false;
  try {
    const u = new URL(s);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export type WebhookPostResult = { url: string; ok: boolean; status?: number; error?: string };

export async function postSignedWebhook(input: {
  url: string;
  secret: string;
  event: string;
  payload: Record<string, unknown>;
}): Promise<WebhookPostResult> {
  const bodyObj = {
    event: input.event,
    ...input.payload,
  };
  const rawBody = JSON.stringify(bodyObj);
  const sig = signWebhookPayload(input.secret, rawBody);

  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), INTEGRATION_WEBHOOK_TIMEOUT_MS);
    const res = await fetch(input.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-Zylmero-Event": input.event,
        "X-Zylmero-Signature": `sha256=${sig}`,
        "User-Agent": "Zylmero-Integrations/1.0 (+https://zylmero.com)",
      },
      body: rawBody,
      signal: ac.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      const txt = await res.text();
      return {
        url: input.url,
        ok: false,
        status: res.status,
        error: txt.slice(0, 240) || `HTTP ${res.status}`,
      };
    }
    return { url: input.url, ok: true, status: res.status };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return { url: input.url, ok: false, error: msg };
  }
}
