import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { AiKnowledgeForm } from "@/components/settings/ai-knowledge-form";
import type { AiKnowledgePage } from "@/lib/types";

export default async function ChatbotPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const { data: s } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();

  const mapped = mapCompanySettingsRow((s ?? {}) as Record<string, unknown>);
  const prefs = (s?.automation_preferences as Record<string, unknown> | null) || {};
  const scannedPages = Array.isArray(prefs.ai_knowledge_pages)
    ? (prefs.ai_knowledge_pages as AiKnowledgePage[]).filter(
        (p) => p && typeof p.url === "string" && typeof p.title === "string",
      )
    : [];
  const lastScannedAt =
    typeof prefs.ai_knowledge_last_scanned_at === "string"
      ? prefs.ai_knowledge_last_scanned_at
      : null;
  const crawlCapped = Boolean(prefs.ai_knowledge_crawl_capped);

  return (
    <PageFrame
      title="Je chatbot"
      subtitle={
        <>
          Koppel je website — je bot leest je pagina&apos;s en antwoordt daarop. WhatsApp, mail en widget:{" "}
          <Link
            href="/dashboard/ai-koppelingen"
            className="font-medium text-primary underline decoration-primary/35 underline-offset-2 hover:decoration-primary"
          >
            Kanalen
          </Link>
          . Socials:{" "}
          <Link
            href="/dashboard/socials"
            className="font-medium text-primary underline decoration-primary/35 underline-offset-2 hover:decoration-primary"
          >
            Socials
          </Link>
          .
        </>
      }
      dismissHref="/dashboard/ai-koppelingen"
      dismissLabel="Kanalen"
    >
      <DashboardWorkSurface>
        <section id="kennis" className="scroll-mt-6">
          <AiKnowledgeForm
            demoMode={demo}
            initialWebsite={mapped?.ai_knowledge_website ?? ""}
            initialDocument={mapped?.ai_knowledge_document ?? ""}
            scannedPages={scannedPages}
            lastScannedAt={lastScannedAt}
            crawlCapped={crawlCapped}
            compactHero
          />
        </section>
      </DashboardWorkSurface>
    </PageFrame>
  );
}
