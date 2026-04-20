import type { SupabaseClient } from "@supabase/supabase-js";
import { insertNotificationIfNew } from "@/lib/notifications/create";
import { leadInsertJsonDefaults } from "@/lib/leads/insert-defaults";
import { isLeadCapReached } from "@/lib/billing/entitlements";
import { hasSubscriptionAccess } from "@/lib/billing/trial";
import { mapCompanyRow } from "@/lib/auth/map-company";
import { sendAutoReplyIfEnabled } from "@/lib/whatsapp/auto-reply";
import { getCompanySettings } from "@/lib/company-settings";

export type InboundEmailPayload = {
  company_id: string;
  /** Afzender (e-mail) */
  from: string;
  from_name?: string | null;
  subject?: string | null;
  body: string;
};

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function displayNameFromEmail(email: string, fromName?: string | null): string {
  const n = String(fromName || "").trim();
  if (n) return n.slice(0, 120);
  const local = email.split("@")[0] || "Klant";
  return local.slice(0, 120);
}

export async function processInboundEmail(
  admin: SupabaseClient,
  payload: InboundEmailPayload,
): Promise<{ ok: boolean; message?: string; conversation_id?: string }> {
  const companyId = payload.company_id;
  const fromEmail = normalizeEmail(payload.from);
  const subject = String(payload.subject || "").trim().slice(0, 500);
  const body = String(payload.body || "").trim();
  const text = [subject ? `Onderwerp: ${subject}` : null, body].filter(Boolean).join("\n\n");

  if (!companyId || !fromEmail || !text) {
    return { ok: false, message: "company_id, from en body (of onderwerp) zijn verplicht." };
  }

  const { data: companyRow, error: cErr } = await admin
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();
  if (cErr || !companyRow) {
    return { ok: false, message: "Company not found" };
  }
  const company = mapCompanyRow(companyRow as Record<string, unknown>);
  const subscriptionOk = hasSubscriptionAccess(company);

  const settings = await getCompanySettings(admin, companyId);
  const inboundOn = Boolean(settings?.automation_preferences?.email_inbound_enabled);
  if (!inboundOn) {
    return { ok: false, message: "E-mail inbound staat uit voor dit bedrijf." };
  }

  const atCap = await isLeadCapReached(admin, company);
  if (atCap) {
    return { ok: false, message: "Monthly lead limit reached" };
  }

  const { data: existingLead } = await admin
    .from("leads")
    .select("id, full_name")
    .eq("company_id", companyId)
    .ilike("email", fromEmail)
    .maybeSingle();

  let leadId: string;
  let leadName: string;
  let isNewLead = false;

  if (existingLead) {
    leadId = existingLead.id as string;
    leadName = String(existingLead.full_name || displayNameFromEmail(fromEmail, payload.from_name));
  } else {
    if (!subscriptionOk) {
      return { ok: false, message: "subscription_inactive_no_new_leads" };
    }
    const display = displayNameFromEmail(fromEmail, payload.from_name);
    const { data: created, error: le } = await admin
      .from("leads")
      .insert({
        company_id: companyId,
        full_name: display,
        email: fromEmail,
        source: "email",
        intent: subject || null,
        status: "new",
        ...leadInsertJsonDefaults,
      })
      .select("id")
      .single();
    if (le || !created) {
      return { ok: false, message: le?.message || "Lead insert failed" };
    }
    leadId = created.id as string;
    leadName = display;
    isNewLead = true;
  }

  if (isNewLead) {
    await insertNotificationIfNew(admin, {
      company_id: companyId,
      type: "new_lead",
      title: "New lead",
      body: `${leadName} mailde je.`,
      dedupe_key: `new_lead:${leadId}`,
      metadata: { lead_id: leadId, channel: "email" },
    });
  }

  const { data: conv } = await admin
    .from("conversations")
    .select("id")
    .eq("company_id", companyId)
    .eq("lead_id", leadId)
    .eq("channel", "email")
    .maybeSingle();

  let conversationId: string;
  if (conv?.id) {
    conversationId = conv.id as string;
  } else {
    const { data: createdConv, error: ce } = await admin
      .from("conversations")
      .insert({
        company_id: companyId,
        lead_id: leadId,
        channel: "email",
        title: `E-mail · ${fromEmail}`,
      })
      .select("id")
      .single();
    if (ce || !createdConv) {
      return { ok: false, message: ce?.message || "Conversation insert failed" };
    }
    conversationId = createdConv.id as string;
  }

  const { error: me } = await admin.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: text.slice(0, 12_000),
  });
  if (me) return { ok: false, message: me.message };

  await admin
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  await admin
    .from("leads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", leadId);

  const first = leadName.split(/\s+/)[0] || "daar";

  if (settings?.auto_reply_enabled && subscriptionOk) {
    await sendAutoReplyIfEnabled({
      supabase: admin,
      companyId,
      companyName: company.name,
      companyNiche: company.niche,
      conversationId,
      leadFirstName: first,
    });
  }

  return { ok: true, conversation_id: conversationId };
}
