import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { AutomationList } from "@/components/settings/automation-list";
import { AutomationRulesPanel } from "@/components/settings/automation-rules-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { canUseAutomations } from "@/lib/billing/entitlements";
import type { Automation } from "@/lib/types";
import { CheckCircle2, Wand2 } from "lucide-react";
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
      subtitle="Laat opvolging automatisch lopen met duidelijke regels die iedereen in je team begrijpt."
    >
      <DashboardWorkSurface>
        <section className="cf-dashboard-panel border-primary/20 bg-gradient-to-br from-primary/[0.1] via-background to-background px-5 py-5 dark:border-primary/30 dark:from-primary/[0.16] sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Duidelijk overzicht
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
                Zo werkt het
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Opvolging</strong> stuurt automatische berichten op
                vaste momenten. <strong className="text-foreground">Regels</strong> reageren op situaties
                zoals “geen reactie” of “hete lead”.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" aria-hidden />
                Begin met standaard opvolging
              </p>
              <p className="inline-flex items-center gap-2">
                <Wand2 className="size-4 text-primary" aria-hidden />
                Verfijn daarna regels
              </p>
            </div>
          </div>
        </section>

        <Tabs defaultValue="followup" className="mt-2 w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl border border-border/50 bg-muted/30 p-1 dark:border-white/[0.08]">
            <TabsTrigger value="followup" className="rounded-lg data-[state=active]:shadow-sm">
              Automatische berichten
            </TabsTrigger>
            <TabsTrigger value="rules" className="rounded-lg data-[state=active]:shadow-sm">
              Slimme regels
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
