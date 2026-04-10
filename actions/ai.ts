"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { summarizeConversation } from "@/lib/openai/summarize-conversation";
import { suggestReply } from "@/lib/openai/suggest-reply";
import { generateQuoteDraft as buildQuoteDraft } from "@/lib/openai/quote-draft";
import { leadProgressionHint } from "@/lib/openai/lead-progression";
import { smartFollowUpMessage } from "@/lib/openai/smart-followup";
import { classifyLeadTags } from "@/lib/openai/classify-lead-tags";
import { describeFollowUpRisk } from "@/lib/sales/followup-risk";
import { isDemoMode } from "@/lib/env";
import { getCompanySettings } from "@/lib/company-settings";
import {
  canUseFullAi,
  canUseQuotes,
  entitlementUpgradeMessage,
} from "@/lib/billing/entitlements";
import { hasSubscriptionAccess } from "@/lib/billing/trial";
import { PAYWALL_AI_LEADS } from "@/lib/billing/paywall";
import { incrementAiUsage } from "@/lib/billing/ai-usage";
import type { Company, Lead, LeadStatus, Message, Quote } from "@/lib/types";
import { LEAD_PIPELINE } from "@/lib/types";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function aiErrorMessage(e: unknown): string {
  if (e instanceof Error && e.message.trim()) {
    return e.message;
  }
  return "AI-antwoord kon niet worden gegenereerd. Probeer het opnieuw.";
}

async function getCtx() {
  if (isDemoMode()) {
    return {
      ok: false as const,
      error: "Niet beschikbaar in demo-modus.",
    };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false as const, error: "Niet ingelogd of geen bedrijf." };
  }
  if (!hasSubscriptionAccess(auth.company)) {
    return { ok: false as const, error: PAYWALL_AI_LEADS };
  }
  return {
    ok: true as const,
    supabase: await createClient(),
    companyId: auth.company.id,
    companyName: auth.company.name,
    company: auth.company as Company,
  };
}

export async function summarizeLeadConversation(
  leadId: string,
): Promise<ActionResult<{ summary: string }>> {
  const c = await getCtx();
  if (!c.ok) return c;
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, error: "OPENAI_API_KEY ontbreekt." };
  }

  const settings = await getCompanySettings(c.supabase, c.companyId);
  const { data: lead, error: le } = await c.supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("company_id", c.companyId)
    .single();
  if (le || !lead) return { ok: false, error: "Lead niet gevonden." };

  const { data: conv } = await c.supabase
    .from("conversations")
    .select("id")
    .eq("lead_id", leadId)
    .limit(1)
    .maybeSingle();
  if (!conv?.id) return { ok: false, error: "Geen conversatie." };

  const { data: msgs } = await c.supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  if (!msgs?.length) return { ok: false, error: "Geen berichten." };

  try {
    const out = await summarizeConversation({
      messages: msgs as Message[],
      companyName: c.companyName,
      settings,
      nicheId: c.company.niche,
    });

    let aiTags: string[] = [];
    if (process.env.OPENAI_API_KEY) {
      try {
        aiTags = await classifyLeadTags({
          leadName: String(lead.full_name || ""),
          summary: out.summary,
          intent: out.intent,
          messages: msgs as Message[],
        });
      } catch {
        aiTags = [];
      }
    }

    const { error } = await c.supabase
      .from("leads")
      .update({
        summary: out.summary,
        intent: out.intent,
        score: out.score,
        estimated_value: out.estimated_value,
        suggested_next_action: out.suggested_next_action,
        status_recommendation: out.status_recommendation,
        ai_tags: aiTags,
      })
      .eq("id", leadId);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${leadId}`);
    revalidatePath("/dashboard/pipeline");
    revalidatePath("/dashboard/inbox");
    await incrementAiUsage(c.supabase, c.companyId);
    return { ok: true, data: { summary: out.summary } };
  } catch (e) {
    return {
      ok: false,
      error: aiErrorMessage(e),
    };
  }
}

export async function generateLeadReply(
  leadId: string,
): Promise<ActionResult<{ reply: string }>> {
  const c = await getCtx();
  if (!c.ok) return c;
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, error: "OPENAI_API_KEY ontbreekt." };
  }

  const settings = await getCompanySettings(c.supabase, c.companyId);
  const { data: lead } = await c.supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("company_id", c.companyId)
    .single();
  if (!lead) return { ok: false, error: "Lead niet gevonden." };

  const { data: conv } = await c.supabase
    .from("conversations")
    .select("id")
    .eq("lead_id", leadId)
    .limit(1)
    .maybeSingle();
  if (!conv?.id) return { ok: false, error: "Geen conversatie." };

  const { data: msgs } = await c.supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  try {
    const first = String(lead.full_name || "").split(/\s+/)[0] || "daar";
    const reply = await suggestReply({
      messages: (msgs || []) as Message[],
      companyName: c.companyName,
      settings,
      leadFirstName: first,
      nicheId: c.company.niche,
    });
    await incrementAiUsage(c.supabase, c.companyId);
    return { ok: true, data: { reply } };
  } catch (e) {
    return {
      ok: false,
      error: aiErrorMessage(e),
    };
  }
}

export async function generateQuoteDraft(
  leadId: string,
): Promise<ActionResult<{ quoteId: string }>> {
  const c = await getCtx();
  if (!c.ok) return c;
  if (!canUseQuotes(c.company)) {
    return { ok: false, error: entitlementUpgradeMessage("quotes") };
  }
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, error: "OPENAI_API_KEY ontbreekt." };
  }

  const settings = await getCompanySettings(c.supabase, c.companyId);
  const { data: lead } = await c.supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("company_id", c.companyId)
    .single();
  if (!lead) return { ok: false, error: "Lead niet gevonden." };

  const { data: conv } = await c.supabase
    .from("conversations")
    .select("id")
    .eq("lead_id", leadId)
    .limit(1)
    .maybeSingle();

  let msgs: Message[] = [];
  if (conv?.id) {
    const { data: m } = await c.supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    msgs = (m || []) as Message[];
  }

  try {
    const draft = await buildQuoteDraft({
      lead: lead as Lead,
      messages: msgs,
      companyName: c.companyName,
      settings,
      nicheId: c.company.niche,
    });

    const line_items = draft.items.map((it, i) => ({
      id: `li-${i}`,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      line_total: it.line_total,
    }));

    const subtotal = draft.subtotal;
    const vat_rate = 0.21;
    const vat_amount =
      draft.vat || Math.round(subtotal * vat_rate * 100) / 100;
    const total = draft.total || subtotal + vat_amount;

    const { data: ins, error } = await c.supabase
      .from("quotes")
      .insert({
        company_id: c.companyId,
        lead_id: leadId,
        title: draft.title,
        description: draft.description,
        status: "draft",
        currency: "EUR",
        subtotal,
        vat_rate,
        vat_amount,
        total,
        line_items,
        internal_notes: draft.notes,
      })
      .select("id")
      .single();

    if (error || !ins) {
      return { ok: false, error: error?.message || "Insert mislukt" };
    }
    revalidatePath("/dashboard/quotes");
    revalidatePath(`/dashboard/leads/${leadId}`);
    await incrementAiUsage(c.supabase, c.companyId);
    return { ok: true, data: { quoteId: ins.id as string } };
  } catch (e) {
    return {
      ok: false,
      error: aiErrorMessage(e),
    };
  }
}

export async function moveLeadToSuggestedStage(
  leadId: string,
): Promise<ActionResult<{ status: LeadStatus }>> {
  const c = await getCtx();
  if (!c.ok) return c;

  const { data: lead } = await c.supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("company_id", c.companyId)
    .single();
  if (!lead) return { ok: false, error: "Lead niet gevonden." };

  const { data: conv } = await c.supabase
    .from("conversations")
    .select("id")
    .eq("lead_id", leadId)
    .limit(1)
    .maybeSingle();

  let msgs: Pick<Message, "role" | "content">[] = [];
  if (conv?.id) {
    const { data: m } = await c.supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(12);
    msgs = (m || []) as Message[];
  }

  if (!process.env.OPENAI_API_KEY || !canUseFullAi(c.company)) {
    return advanceLeadStageLinear(leadId);
  }

  try {
    const hint = await leadProgressionHint({
      lead: lead as Lead,
      messages: msgs,
    });

    const { error } = await c.supabase
      .from("leads")
      .update({ status: hint.next_stage })
      .eq("id", leadId);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${leadId}`);
    await incrementAiUsage(c.supabase, c.companyId);
    return { ok: true, data: { status: hint.next_stage } };
  } catch (e) {
    return {
      ok: false,
      error: aiErrorMessage(e),
    };
  }
}

async function advanceLeadStageLinear(
  leadId: string,
): Promise<ActionResult<{ status: LeadStatus }>> {
  const c = await getCtx();
  if (!c.ok) return c;

  const { data: lead } = await c.supabase
    .from("leads")
    .select("status")
    .eq("id", leadId)
    .eq("company_id", c.companyId)
    .single();
  if (!lead) return { ok: false, error: "Lead niet gevonden." };

  const cur = lead.status as LeadStatus;
  if (cur === "won" || cur === "lost") {
    return { ok: false, error: "Geen volgende fase." };
  }
  const idx = LEAD_PIPELINE.indexOf(cur);
  if (idx === -1 || idx >= LEAD_PIPELINE.length - 1) {
    return { ok: false, error: "Geen volgende fase." };
  }
  const next = LEAD_PIPELINE[idx + 1]!;

  const { error } = await c.supabase
    .from("leads")
    .update({ status: next })
    .eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  return { ok: true, data: { status: next } };
}

export async function advanceLeadStageLinearAction(
  leadId: string,
): Promise<ActionResult<{ status: LeadStatus }>> {
  return advanceLeadStageLinear(leadId);
}

export async function generateSmartFollowUp(
  leadId: string,
): Promise<ActionResult<{ message: string }>> {
  const c = await getCtx();
  if (!c.ok) return c;
  if (!canUseFullAi(c.company)) {
    return { ok: false, error: entitlementUpgradeMessage("full_ai") };
  }
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, error: "OPENAI_API_KEY ontbreekt." };
  }

  const settings = await getCompanySettings(c.supabase, c.companyId);
  const { data: leadRow, error: le } = await c.supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("company_id", c.companyId)
    .single();
  if (le || !leadRow) return { ok: false, error: "Lead niet gevonden." };

  const { data: conv } = await c.supabase
    .from("conversations")
    .select("id")
    .eq("lead_id", leadId)
    .limit(1)
    .maybeSingle();

  let msgs: Message[] = [];
  if (conv?.id) {
    const { data: m } = await c.supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    msgs = (m || []) as Message[];
  }

  const { data: quoteRows } = await c.supabase
    .from("quotes")
    .select("status, updated_at, created_at")
    .eq("company_id", c.companyId)
    .eq("lead_id", leadId);

  const lead = leadRow as Lead;
  const last = msgs[msgs.length - 1];
  let staleReply = false;
  if (last?.role === "user") {
    const h =
      (Date.now() - new Date(last.created_at).getTime()) / 3600000;
    staleReply = h >= 4;
  }

  const risk = describeFollowUpRisk(
    lead,
    msgs,
    (quoteRows || []) as Pick<Quote, "status" | "updated_at" | "created_at">[],
    { staleReply },
  );

  const situation = [risk.tag, risk.detail].filter(Boolean).join(" — ");

  try {
    const message = await smartFollowUpMessage({
      lead,
      messages: msgs,
      companyName: c.companyName,
      settings,
      situation,
      nicheId: c.company.niche,
    });
    await incrementAiUsage(c.supabase, c.companyId);
    return { ok: true, data: { message } };
  } catch (e) {
    return {
      ok: false,
      error: aiErrorMessage(e),
    };
  }
}
