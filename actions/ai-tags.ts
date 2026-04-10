"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { hasSubscriptionAccess } from "@/lib/billing/trial";
import { PAYWALL_AI_LEADS } from "@/lib/billing/paywall";
import { classifyLeadTags } from "@/lib/openai/classify-lead-tags";
import type { ActionResult } from "@/actions/ai";
import type { Message } from "@/lib/types";
import { incrementAiUsage } from "@/lib/billing/ai-usage";

export async function refreshLeadAiTags(
  leadId: string,
): Promise<ActionResult<{ tags: string[] }>> {
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
  const { data: lead, error: le } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("company_id", auth.company.id)
    .single();
  if (le || !lead) return { ok: false, error: "Lead niet gevonden." };

  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("lead_id", leadId)
    .limit(1)
    .maybeSingle();

  let msgs: Message[] = [];
  if (conv?.id) {
    const { data: m } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    msgs = (m || []) as Message[];
  }

  const tags = await classifyLeadTags({
    leadName: String(lead.full_name || ""),
    summary: (lead.summary as string) ?? null,
    intent: (lead.intent as string) ?? null,
    messages: msgs,
  });

  const { error } = await supabase
    .from("leads")
    .update({ ai_tags: tags })
    .eq("id", leadId)
    .eq("company_id", auth.company.id);

  if (error) return { ok: false, error: error.message };

  await incrementAiUsage(supabase, auth.company.id);

  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/pipeline");
  return { ok: true, data: { tags } };
}
