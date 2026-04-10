import type { SupabaseClient } from "@supabase/supabase-js";
import { insertNotificationIfNew } from "@/lib/notifications/create";
import { isLeadCapReached } from "@/lib/billing/entitlements";
import { hasSubscriptionAccess } from "@/lib/billing/trial";
import { mapCompanyRow } from "@/lib/auth/map-company";
import { sendAutoReplyIfEnabled } from "@/lib/whatsapp/auto-reply";
import { getCompanySettings } from "@/lib/company-settings";

export type InboundWebhookPayload = {
  company_id: string;
  from: string;
  body: string;
  provider?: "mock" | "twilio" | "meta";
};

function normalizePhone(raw: string): string {
  return raw.replace(/\s+/g, "").trim();
}

export async function processInboundWhatsApp(
  admin: SupabaseClient,
  payload: InboundWebhookPayload,
): Promise<{ ok: boolean; message?: string; conversation_id?: string }> {
  const companyId = payload.company_id;
  const from = normalizePhone(payload.from);
  const text = String(payload.body || "").trim();
  if (!companyId || !from || !text) {
    return { ok: false, message: "company_id, from, body required" };
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
  if (!settings?.whatsapp_channel?.connected) {
    return { ok: false, message: "WhatsApp not connected for this company" };
  }

  const atCap = await isLeadCapReached(admin, company);
  if (atCap) {
    return { ok: false, message: "Monthly lead limit reached" };
  }

  const { data: existingLead } = await admin
    .from("leads")
    .select("id, full_name")
    .eq("company_id", companyId)
    .eq("phone", from)
    .maybeSingle();

  let leadId: string;
  let leadName: string;
  let isNewLead = false;

  if (existingLead) {
    leadId = existingLead.id as string;
    leadName = String(existingLead.full_name || "Lead");
  } else {
    if (!subscriptionOk) {
      return {
        ok: false,
        message: "subscription_inactive_no_new_leads",
      };
    }
    const { data: created, error: le } = await admin
      .from("leads")
      .insert({
        company_id: companyId,
        full_name: `WhatsApp ${from}`,
        phone: from,
        source: "whatsapp",
        status: "new",
      })
      .select("id")
      .single();
    if (le || !created) {
      return { ok: false, message: le?.message || "Lead insert failed" };
    }
    leadId = created.id as string;
    leadName = `WhatsApp ${from}`;
    isNewLead = true;
  }

  if (isNewLead) {
    await insertNotificationIfNew(admin, {
      company_id: companyId,
      type: "new_lead",
      title: "New lead",
      body: `${leadName} messaged via WhatsApp.`,
      dedupe_key: `new_lead:${leadId}`,
      metadata: { lead_id: leadId, channel: "whatsapp" },
    });
  }

  const { data: conv } = await admin
    .from("conversations")
    .select("id")
    .eq("company_id", companyId)
    .eq("lead_id", leadId)
    .eq("channel", "whatsapp")
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
        channel: "whatsapp",
        title: `WhatsApp · ${from}`,
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
    content: text,
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

  const first = leadName.split(/\s+/)[0] || "there";

  if (settings.auto_reply_enabled && subscriptionOk) {
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
