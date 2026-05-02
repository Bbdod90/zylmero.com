"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { isDemoMode } from "@/lib/env";
import {
  generateWebhookSecret,
  INTEGRATION_WEBHOOK_MAX_URLS,
  isHttpsWebhookUrl,
  postSignedWebhook,
} from "@/lib/integrations/outbound-webhook";

function normalizeUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) {
    const u = typeof x === "string" ? x.trim() : "";
    if (!u) continue;
    if (!isHttpsWebhookUrl(u)) continue;
    out.push(u);
    if (out.length >= INTEGRATION_WEBHOOK_MAX_URLS) break;
  }
  return out;
}

export async function saveIntegrationWebhooksAction(input: {
  enabled: boolean;
  urls: string[];
}): Promise<
  { ok: true; webhookSecret?: string } | { ok: false; error: string }
> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  if (auth.companyRole !== "owner") {
    return { ok: false, error: "Alleen de eigenaar kan webhooks beheren." };
  }

  const urls = normalizeUrls(input.urls);
  if (input.enabled && urls.length === 0) {
    return { ok: false, error: "Voeg minstens één geldige https:// webhook-URL toe." };
  }

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();

  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const prevAi = (settingsRow?.automation_preferences as Record<string, unknown>) || {};

  let secret =
    typeof prevAi.integration_webhook_secret === "string" && prevAi.integration_webhook_secret.length >= 32
      ? prevAi.integration_webhook_secret
      : "";

  let newlyGeneratedSecret: string | undefined;
  if (input.enabled && urls.length > 0 && !secret) {
    secret = generateWebhookSecret();
    newlyGeneratedSecret = secret;
  }

  const automation_preferences = {
    ...prevAi,
    integration_webhooks_enabled: input.enabled && urls.length > 0,
    integration_webhook_urls: urls,
    ...(secret ? { integration_webhook_secret: secret } : {}),
  };

  const { error } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: prev?.niche ?? null,
      services: prev?.services ?? [],
      faq: prev?.faq ?? [],
      pricing_hints: prev?.pricing_hints ?? null,
      business_hours: prev?.business_hours ?? {},
      booking_link: prev?.booking_link ?? null,
      tone: prev?.tone ?? null,
      reply_style: prev?.reply_style ?? null,
      language: prev?.language ?? "nl",
      automation_preferences,
      whatsapp_channel: prev?.whatsapp_channel ?? { provider: "mock", connected: false },
      auto_reply_enabled: prev?.auto_reply_enabled ?? false,
      auto_reply_delay_seconds: prev?.auto_reply_delay_seconds ?? 30,
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets: prev?.knowledge_snippets ?? [],
      white_label_logo_url: prev?.white_label_logo_url ?? null,
      white_label_primary: prev?.white_label_primary ?? null,
    },
    { onConflict: "company_id" },
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/socials");
  return newlyGeneratedSecret
    ? { ok: true, webhookSecret: newlyGeneratedSecret }
    : { ok: true };
}

export async function regenerateWebhookSecretAction(): Promise<
  { ok: true; secret: string } | { ok: false; error: string }
> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company || auth.companyRole !== "owner") {
    return { ok: false, error: "Geen rechten." };
  }

  const secret = generateWebhookSecret();
  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();

  const prev = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const prevAi = (settingsRow?.automation_preferences as Record<string, unknown>) || {};

  const automation_preferences = {
    ...prevAi,
    integration_webhook_secret: secret,
  };

  const { error } = await supabase.from("company_settings").upsert(
    {
      company_id: auth.company.id,
      niche: prev?.niche ?? null,
      services: prev?.services ?? [],
      faq: prev?.faq ?? [],
      pricing_hints: prev?.pricing_hints ?? null,
      business_hours: prev?.business_hours ?? {},
      booking_link: prev?.booking_link ?? null,
      tone: prev?.tone ?? null,
      reply_style: prev?.reply_style ?? null,
      language: prev?.language ?? "nl",
      automation_preferences,
      whatsapp_channel: prev?.whatsapp_channel ?? { provider: "mock", connected: false },
      auto_reply_enabled: prev?.auto_reply_enabled ?? false,
      auto_reply_delay_seconds: prev?.auto_reply_delay_seconds ?? 30,
      ai_usage_count: prev?.ai_usage_count ?? 0,
      ai_setup_completed_at: prev?.ai_setup_completed_at ?? null,
      niche_intake: prev?.niche_intake ?? {},
      knowledge_snippets: prev?.knowledge_snippets ?? [],
      white_label_logo_url: prev?.white_label_logo_url ?? null,
      white_label_primary: prev?.white_label_primary ?? null,
    },
    { onConflict: "company_id" },
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/socials");
  return { ok: true, secret };
}

export async function testIntegrationWebhooksAction(): Promise<
  | {
      ok: true;
      results: Array<{ url: string; ok: boolean; status?: number; error?: string }>;
    }
  | { ok: false; error: string }
> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company || auth.companyRole !== "owner") {
    return { ok: false, error: "Geen rechten." };
  }

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("automation_preferences")
    .eq("company_id", auth.company.id)
    .maybeSingle();

  const prefs = (settingsRow?.automation_preferences as Record<string, unknown>) || {};
  const enabled = prefs.integration_webhooks_enabled === true;
  const urls = normalizeUrls(prefs.integration_webhook_urls);
  const secret =
    typeof prefs.integration_webhook_secret === "string" ? prefs.integration_webhook_secret : "";

  if (!enabled || urls.length === 0) {
    return { ok: false, error: "Schakel webhooks in en sla minstens één URL op." };
  }
  if (!secret || secret.length < 32) {
    return { ok: false, error: "Er is nog geen webhook-geheim. Sla eerst op of genereer een nieuw geheim." };
  }

  const sentAt = new Date().toISOString();
  const results: Array<{ url: string; ok: boolean; status?: number; error?: string }> = [];

  for (const url of urls) {
    const r = await postSignedWebhook({
      url,
      secret,
      event: "zylmero.test",
      payload: {
        message: "Test vanuit Zylmero Socials — jouw endpoint werkt.",
        company_id: auth.company.id,
        sent_at: sentAt,
      },
    });
    results.push({
      url: r.url,
      ok: r.ok,
      status: r.status,
      error: r.error,
    });
  }

  return { ok: true, results };
}
