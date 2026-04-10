"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  canUseAutomations,
  entitlementUpgradeMessage,
} from "@/lib/billing/entitlements";
import type {
  AutomationIfType,
  AutomationRule,
  AutomationThenType,
} from "@/lib/types";

export type RuleFormState = { ok?: boolean; error?: string };

const IF_TYPES: AutomationIfType[] = [
  "lead_is_hot",
  "no_reply_hours",
  "status_is_new",
];

const THEN_TYPES: AutomationThenType[] = [
  "notify_in_app",
  "queue_followup_copy",
  "send_followup_message",
  "send_ai_reply",
];

function isIf(s: string): s is AutomationIfType {
  return (IF_TYPES as string[]).includes(s);
}
function isThen(s: string): s is AutomationThenType {
  return (THEN_TYPES as string[]).includes(s);
}

export async function listAutomationRules(): Promise<AutomationRule[]> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("automation_rules")
    .select("*")
    .eq("company_id", auth.company.id)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data || []) as AutomationRule[];
}

export async function createAutomationRule(
  _prev: RuleFormState,
  formData: FormData,
): Promise<RuleFormState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return { error: "Niet ingelogd." };
  if (!canUseAutomations(auth.company)) {
    return { error: entitlementUpgradeMessage("automations") };
  }
  const name = String(formData.get("name") || "").trim();
  const if_type = String(formData.get("if_type") || "");
  const then_type = String(formData.get("then_type") || "");
  if (!name || !isIf(if_type) || !isThen(then_type)) {
    return { error: "Vul alle velden in." };
  }

  const if_config: Record<string, unknown> = {};
  if (if_type === "no_reply_hours") {
    if_config.hours = Math.max(
      1,
      Math.min(168, Number(formData.get("hours") || 24)),
    );
  }

  const then_config: Record<string, unknown> = {};
  if (then_type === "notify_in_app") {
    then_config.body = String(formData.get("notify_body") || "").trim();
  }
  if (then_type === "send_followup_message" || then_type === "queue_followup_copy") {
    then_config.message = String(formData.get("followup_message") || "").trim();
  }

  const supabase = await createClient();
  const { error } = await supabase.from("automation_rules").insert({
    company_id: auth.company.id,
    name,
    enabled: true,
    if_type,
    if_config,
    then_type,
    then_config,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/automations");
  return { ok: true };
}

export async function toggleAutomationRule(
  id: string,
  enabled: boolean,
): Promise<RuleFormState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return { error: "Niet ingelogd." };
  if (enabled && !canUseAutomations(auth.company)) {
    return { error: entitlementUpgradeMessage("automations") };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("automation_rules")
    .update({ enabled })
    .eq("id", id)
    .eq("company_id", auth.company.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/automations");
  return { ok: true };
}

export async function deleteAutomationRule(id: string): Promise<RuleFormState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return { error: "Niet ingelogd." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("automation_rules")
    .delete()
    .eq("id", id)
    .eq("company_id", auth.company.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/automations");
  return { ok: true };
}

export async function ensureDefaultCustomRules(): Promise<void> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return;
  if (!canUseAutomations(auth.company)) return;
  const supabase = await createClient();
  const { count, error: countErr } = await supabase
    .from("automation_rules")
    .select("*", { count: "exact", head: true })
    .eq("company_id", auth.company.id);
  if (countErr || (count && count > 0)) return;

  const { error } = await supabase.from("automation_rules").insert([
    {
      company_id: auth.company.id,
      name: "Hete lead → AI-antwoord",
      enabled: true,
      if_type: "lead_is_hot",
      if_config: {},
      then_type: "send_ai_reply",
      then_config: {},
    },
    {
      company_id: auth.company.id,
      name: "Geen reactie 24u → follow-up",
      enabled: true,
      if_type: "no_reply_hours",
      if_config: { hours: 24 },
      then_type: "send_followup_message",
      then_config: {
        message:
          "Hi {{name}}, ik wilde even checken of je mijn vorige bericht hebt gezien. Kan ik ergens mee helpen?",
      },
    },
  ]);
  if (error) return;
  revalidatePath("/dashboard/automations");
}
