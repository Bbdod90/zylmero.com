import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { AiPanel } from "@/components/settings/ai-panel";

export default async function AiSettingsPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const supabase = await createClient();
  const { data: s } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();

  const rawPrefs = s?.automation_preferences;
  let automationNote = "";
  if (rawPrefs && typeof rawPrefs === "object" && rawPrefs !== null) {
    automationNote = String((rawPrefs as { note?: string }).note || "");
  }

  return (
    <PageFrame
      title="AI-assistent"
      subtitle="Voorbeelden links, definitieve tekst rechts. Alleen invullen wat je nodig hebt."
      dismissHref="/dashboard/ai-koppelingen"
      dismissLabel="AI & koppelingen"
    >
      <DashboardWorkSurface>
        <AiPanel
          tone={s?.tone ?? null}
          reply_style={s?.reply_style ?? null}
          language={s?.language || "nl"}
          automationNote={automationNote}
        />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
