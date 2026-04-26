import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { AiKnowledgeForm } from "@/components/settings/ai-knowledge-form";
import { cn } from "@/lib/utils";
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
      title="Chatbot & kennis"
      subtitle="Wat je chatbot moet weten — voor WhatsApp, je site en e-mail. Kanalen koppel je apart; Instagram via Socials."
      dismissHref="/dashboard/ai-koppelingen"
      dismissLabel="Kanalen"
    >
      <DashboardWorkSurface>
        <div
          className={cn(
            "mb-6 rounded-2xl border border-border/55 bg-muted/[0.2] px-4 py-3.5 text-sm leading-relaxed text-muted-foreground sm:px-5",
            "dark:border-white/[0.08] dark:bg-white/[0.03]",
          )}
        >
          <p className="font-semibold text-foreground">Zo werkt het</p>
          <p className="mt-1.5">
            Vul hier je <span className="font-medium text-foreground">website</span> en{" "}
            <span className="font-medium text-foreground">praktische teksten</span> in. Daarmee antwoordt je chatbot
            straks in lijn met jouw zaak.{" "}
            <Link
              href="/dashboard/ai-koppelingen"
              className="font-medium text-primary underline decoration-primary/35 underline-offset-2 hover:decoration-primary"
            >
              Kanalen
            </Link>{" "}
            (WhatsApp, mail, widget) stel je elders in.
          </p>
        </div>

        <section id="kennis" className="scroll-mt-6 space-y-3">
          <div className="px-0.5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Kennis voor je chatbot
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Website en teksten — aanbod, uren, prijzen en veelgestelde vragen.
            </p>
          </div>
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
