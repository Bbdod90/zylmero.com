import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { PageFrame } from "@/components/layout/page-frame";
import { AiKnowledgeForm } from "@/components/settings/ai-knowledge-form";

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

  return (
    <PageFrame
      title="AI-kennis"
      subtitle="Train je AI op jouw bedrijf: website-URL en tekst met openingstijden, tarieven en praktische info (wat bij jouw branche past). Zo antwoordt de assistent klanten consistenter — of je nu vol zit in de stoelen, de spreekuur of op de klus."
    >
      <AiKnowledgeForm
        demoMode={demo}
        initialWebsite={mapped?.ai_knowledge_website ?? ""}
        initialDocument={mapped?.ai_knowledge_document ?? ""}
      />
    </PageFrame>
  );
}
