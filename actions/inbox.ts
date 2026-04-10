"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { suggestReply } from "@/lib/openai/suggest-reply";
import type { Message } from "@/lib/types";
import type { ActionResult } from "@/actions/ai";
import { getCompanySettings } from "@/lib/company-settings";
import { incrementAiUsage } from "@/lib/billing/ai-usage";
import { hasSubscriptionAccess } from "@/lib/billing/trial";
import { PAYWALL_AI_LEADS } from "@/lib/billing/paywall";
import { logTeamActivity } from "@/lib/team-activity";

export async function sendInboxMessage(
  conversationId: string,
  content: string,
): Promise<ActionResult<{ id: string }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  if (!hasSubscriptionAccess(auth.company)) {
    return { ok: false, error: PAYWALL_AI_LEADS };
  }
  const text = content.trim();
  if (!text) return { ok: false, error: "Leeg bericht." };

  const supabase = await createClient();
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, company_id, channel")
    .eq("id", conversationId)
    .eq("company_id", auth.company.id)
    .maybeSingle();
  if (!conv) return { ok: false, error: "Conversatie niet gevonden." };

  const channel =
    typeof (conv as { channel?: string }).channel === "string"
      ? (conv as { channel: string }).channel
      : "inbox";

  const { data: existingMsgs } = await supabase
    .from("messages")
    .select("role, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const hadStaffBefore =
    (existingMsgs || []).filter((m) => m.role === "staff").length > 0;

  const { data: ins, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: "staff",
      content: text,
      channel,
    })
    .select("id")
    .single();

  if (error || !ins) return { ok: false, error: error?.message || "Insert mislukt" };

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  const { data: leadRow } = await supabase
    .from("conversations")
    .select("lead_id")
    .eq("id", conversationId)
    .single();
  if (leadRow?.lead_id) {
    await supabase
      .from("leads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", leadRow.lead_id);
  }

  if (!hadStaffBefore && existingMsgs?.length) {
    let lastUserAt: string | null = null;
    for (let i = existingMsgs.length - 1; i >= 0; i--) {
      if (existingMsgs[i]!.role === "user") {
        lastUserAt = existingMsgs[i]!.created_at as string;
        break;
      }
    }
    if (lastUserAt) {
      const responseMs = Date.now() - new Date(lastUserAt).getTime();
      await logTeamActivity(supabase, {
        company_id: auth.company.id,
        user_id: auth.user.id,
        event_type: "first_reply",
        entity_type: "conversation",
        entity_id: conversationId,
        meta: {
          response_ms: responseMs,
          lead_id: leadRow?.lead_id ?? null,
        },
      });
      if (leadRow?.lead_id) {
        await logTeamActivity(supabase, {
          company_id: auth.company.id,
          user_id: auth.user.id,
          event_type: "lead_touched",
          entity_type: "lead",
          entity_id: leadRow.lead_id as string,
          meta: {},
        });
      }
    }
  }

  revalidatePath("/dashboard/inbox");
  return { ok: true, data: { id: ins.id as string } };
}

export async function generateInboxReply(
  conversationId: string,
): Promise<ActionResult<{ reply: string }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  if (!hasSubscriptionAccess(auth.company)) {
    return { ok: false, error: PAYWALL_AI_LEADS };
  }
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, error: "OPENAI_API_KEY ontbreekt." };
  }

  const supabase = await createClient();
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, lead_id, company_id")
    .eq("id", conversationId)
    .eq("company_id", auth.company.id)
    .maybeSingle();
  if (!conv) return { ok: false, error: "Conversatie niet gevonden." };

  const { data: lead } = await supabase
    .from("leads")
    .select("full_name")
    .eq("id", conv.lead_id)
    .single();

  const { data: msgs } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const settings = await getCompanySettings(supabase, auth.company.id);

  try {
    const first = String(lead?.full_name || "").split(/\s+/)[0] || "daar";
    const reply = await suggestReply({
      messages: (msgs || []) as Message[],
      companyName: auth.company.name,
      settings,
      leadFirstName: first,
      nicheId: auth.company.niche,
    });
    await incrementAiUsage(supabase, auth.company.id);
    return { ok: true, data: { reply } };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error && e.message.trim()
          ? e.message
          : "AI-antwoord kon niet worden gegenereerd. Probeer het opnieuw.",
    };
  }
}
