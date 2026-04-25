import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { AutomationList } from "@/components/settings/automation-list";
import { AutomationRulesPanel } from "@/components/settings/automation-rules-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { canUseAutomations } from "@/lib/billing/entitlements";
import type { Automation } from "@/lib/types";
import {
  ensureDefaultCustomRules,
  listAutomationRules,
} from "@/actions/automation-rules";

export default async function AutomationsPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const canAutomate = canUseAutomations(auth.company);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .eq("company_id", auth.company.id)
    .order("created_at", { ascending: true });

  const items = (data || []) as Automation[];
  const schemaError =
    error &&
    (error.message.includes("automations") ||
      error.message.includes("Could not find") ||
      error.message.includes("schema cache"))
      ? error.message
      : null;

  await ensureDefaultCustomRules();
  const customRules = await listAutomationRules();
  const { error: rulesProbe } = await supabase
    .from("automation_rules")
    .select("id")
    .eq("company_id", auth.company.id)
    .limit(1);
  const rulesSchemaError =
    rulesProbe &&
    (rulesProbe.message.includes("automation_rules") ||
      rulesProbe.message.includes("Could not find") ||
      rulesProbe.message.includes("schema cache"))
      ? rulesProbe.message
      : null;

  return (
    <PageFrame
      title="Automatiseringen"
      subtitle="Opvolging en regels met premium controle — strak, overzichtelijk en direct inzetbaar."
    >
      <DashboardWorkSurface>
        <Tabs defaultValue="followup" className="mt-2 w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl border border-border/50 bg-muted/30 p-1 dark:border-white/[0.08]">
            <TabsTrigger value="followup" className="rounded-lg data-[state=active]:shadow-sm">
              Opvolging
            </TabsTrigger>
            <TabsTrigger value="rules" className="rounded-lg data-[state=active]:shadow-sm">
              Regels (als → dan)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="followup" className="mt-8">
            <AutomationList
              items={items}
              canUseAutomations={canAutomate}
              schemaError={schemaError}
            />
          </TabsContent>
          <TabsContent value="rules" className="mt-8">
            <AutomationRulesPanel
              items={customRules}
              canUseAutomations={canAutomate}
              schemaError={rulesSchemaError}
            />
          </TabsContent>
        </Tabs>
      </DashboardWorkSurface>
    </PageFrame>
  );
}
