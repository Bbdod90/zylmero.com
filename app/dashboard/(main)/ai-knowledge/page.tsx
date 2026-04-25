import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { PageFrame } from "@/components/layout/page-frame";
import { AiKnowledgeForm } from "@/components/settings/ai-knowledge-form";
import type { AiKnowledgePage } from "@/lib/types";

export default async function AiKnowledgePage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const mapped = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const prefs =
    (settingsRow?.automation_preferences as Record<string, unknown> | null) || {};
  const scannedPages = Array.isArray(prefs.ai_knowledge_pages)
    ? (prefs.ai_knowledge_pages as AiKnowledgePage[]).filter(
        (p) => p && typeof p.url === "string" && typeof p.title === "string",
      )
    : [];
  const lastScannedAt =
    typeof prefs.ai_knowledge_last_scanned_at === "string"
      ? prefs.ai_knowledge_last_scanned_at
      : null;

  return (
    <PageFrame
      title="AI-kennis"
      subtitle="Voed je AI met site-data en praktijkkennis zodat antwoorden consistenter, professioneler en scherper worden."
      dismissHref="/dashboard/ai-koppelingen"
      dismissLabel="AI & koppelingen"
    >
      <AiKnowledgeForm
        demoMode={demo}
        initialWebsite={mapped?.ai_knowledge_website ?? ""}
        initialDocument={mapped?.ai_knowledge_document ?? ""}
        scannedPages={scannedPages}
        lastScannedAt={lastScannedAt}
      />
    </PageFrame>
  );
}
