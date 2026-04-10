import { createAdminClient } from "@/lib/supabase/admin";
import type { Lead, Message } from "@/lib/types";
import { fetchLeadRow } from "@/lib/queries/mappers";
import { computeDisplayScore, leadTemperature } from "@/lib/sales/scoring";
import { suggestReply } from "@/lib/openai/suggest-reply";
import { getCompanySettings } from "@/lib/company-settings";
import { incrementAiUsage } from "@/lib/billing/ai-usage";
import { insertNotificationIfNew } from "@/lib/notifications/create";
import type { AutomationIfType, AutomationThenType } from "@/lib/types";

type RuleRow = {
  id: string;
  company_id: string;
  name: string;
  enabled: boolean;
  if_type: AutomationIfType;
  if_config: Record<string, unknown>;
  then_type: AutomationThenType;
  then_config: Record<string, unknown>;
};

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}

async function leadMatchesIf(
  admin: ReturnType<typeof createAdminClient>,
  rule: RuleRow,
  lead: Lead,
): Promise<boolean> {
  switch (rule.if_type) {
    case "lead_is_hot": {
      const ds = computeDisplayScore(lead);
      return leadTemperature(lead, ds) === "hot";
    }
    case "status_is_new": {
      return lead.status === "new";
    }
    case "no_reply_hours": {
      const need = Number(rule.if_config.hours ?? 24);
      const { data: conv } = await admin
        .from("conversations")
        .select("id")
        .eq("lead_id", lead.id)
        .limit(1)
        .maybeSingle();
      if (!conv?.id) return false;
      const { data: msgs } = await admin
        .from("messages")
        .select("role, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });
      const list = (msgs || []) as { role: string; created_at: string }[];
      const last = list[list.length - 1];
      if (!last || last.role !== "user") return false;
      return hoursSince(last.created_at) >= need;
    }
    default:
      return false;
  }
}

async function ensureNotRun(
  admin: ReturnType<typeof createAdminClient>,
  ruleId: string,
  leadId: string,
): Promise<boolean> {
  const { data } = await admin
    .from("automation_rule_runs")
    .select("id")
    .eq("rule_id", ruleId)
    .eq("lead_id", leadId)
    .maybeSingle();
  return !data;
}

export async function processAutomationRulesCron(): Promise<{
  rules: number;
  actions: number;
}> {
  const admin = createAdminClient();
  const { data: rules } = await admin
    .from("automation_rules")
    .select("*")
    .eq("enabled", true);

  let actions = 0;

  for (const raw of (rules || []) as RuleRow[]) {
    const { data: leads } = await admin
      .from("leads")
      .select("*")
      .eq("company_id", raw.company_id);

    for (const row of leads || []) {
      const lead = fetchLeadRow(row as Record<string, unknown>);
      const ok = await leadMatchesIf(admin, raw, lead);
      if (!ok) continue;
      const fresh = await ensureNotRun(admin, raw.id, lead.id);
      if (!fresh) continue;

      const { data: company } = await admin
        .from("companies")
        .select("name, niche")
        .eq("id", raw.company_id)
        .single();

      const companyName = (company?.name as string) || "Bedrijf";

      try {
        switch (raw.then_type) {
          case "notify_in_app": {
            await insertNotificationIfNew(admin, {
              company_id: raw.company_id,
              type: "new_lead",
              title: raw.name,
              body:
                String(raw.then_config.body ?? "") ||
                `${lead.full_name}: automatische melding.`,
              dedupe_key: `auto_rule:${raw.id}:${lead.id}`,
              metadata: { rule_id: raw.id, lead_id: lead.id },
            });
            break;
          }
          case "send_followup_message":
          case "queue_followup_copy": {
            const text = String(
              raw.then_config.message ?? raw.then_config.template ?? "",
            ).trim();
            if (!text) break;
            const { data: conv } = await admin
              .from("conversations")
              .select("id, channel")
              .eq("lead_id", lead.id)
              .limit(1)
              .maybeSingle();
            if (!conv?.id) break;
            const channel =
              typeof conv.channel === "string" ? conv.channel : "inbox";
            await admin.from("messages").insert({
              conversation_id: conv.id,
              role: "staff",
              content: text.replace(/\{\{name\}\}/gi, lead.full_name),
              channel,
            });
            await admin
              .from("conversations")
              .update({ last_message_at: new Date().toISOString() })
              .eq("id", conv.id);
            await admin
              .from("leads")
              .update({ last_message_at: new Date().toISOString() })
              .eq("id", lead.id);
            break;
          }
          case "send_ai_reply": {
            if (!process.env.OPENAI_API_KEY) break;
            const { data: conv } = await admin
              .from("conversations")
              .select("id, channel")
              .eq("lead_id", lead.id)
              .limit(1)
              .maybeSingle();
            if (!conv?.id) break;
            const { data: msgs } = await admin
              .from("messages")
              .select("*")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: true });
            const settings = await getCompanySettings(admin, raw.company_id);
            const first = String(lead.full_name || "").split(/\s+/)[0] || "daar";
            const reply = await suggestReply({
              messages: (msgs || []) as Message[],
              companyName,
              settings,
              leadFirstName: first,
              nicheId: (company?.niche as string) ?? null,
            });
            const channel =
              typeof conv.channel === "string" ? conv.channel : "inbox";
            await admin.from("messages").insert({
              conversation_id: conv.id,
              role: "staff",
              content: reply,
              channel,
            });
            await admin
              .from("conversations")
              .update({ last_message_at: new Date().toISOString() })
              .eq("id", conv.id);
            await admin
              .from("leads")
              .update({ last_message_at: new Date().toISOString() })
              .eq("id", lead.id);
            await incrementAiUsage(admin, raw.company_id);
            break;
          }
          default:
            break;
        }

        await admin.from("automation_rule_runs").insert({
          company_id: raw.company_id,
          rule_id: raw.id,
          lead_id: lead.id,
        });
        actions += 1;
      } catch {
        /* volgende lead */
      }
    }
  }

  return { rules: (rules || []).length, actions };
}
