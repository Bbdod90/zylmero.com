import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { AiPanel } from "@/components/settings/ai-panel";
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

  const rawPrefs = s?.automation_preferences;
  let automationNote = "";
  if (rawPrefs && typeof rawPrefs === "object" && rawPrefs !== null) {
    automationNote = String((rawPrefs as { note?: string }).note || "");
  }

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
      subtitle="Deel 1: wat je chatbot moet weten. Deel 2: hoe die praat — voor WhatsApp, je site en e-mail. Instagram via Socials."
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
          <p className="font-semibold text-foreground">Op één plek</p>
          <p className="mt-1.5">
            Kennis en gedrag horen bij elkaar: zo klinken antwoorden naar jouw bedrijf én kloppen de feiten.{" "}
            <Link
              href="/dashboard/ai-koppelingen"
              className="font-medium text-primary underline decoration-primary/35 underline-offset-2 hover:decoration-primary"
            >
              Kanalen
            </Link>{" "}
            koppel je apart (WhatsApp, mail, widget).
          </p>
        </div>

        <section id="kennis" className="scroll-mt-6 space-y-3">
          <div className="px-0.5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Deel 1</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Kennis voor je chatbot
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Website en praktische teksten — zodat je chatbot je aanbod, uren en prijzen snapt.
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

        <div
          className="my-10 border-t border-border/50 dark:border-white/[0.08]"
          role="separator"
          aria-hidden
        />

        <section id="gedrag" className="scroll-mt-6 space-y-3">
          <div className="px-0.5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Deel 2</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Gedrag van je chatbot
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Toon, lengte van antwoorden, taal en optioneel interne teamregels.
            </p>
          </div>
          <AiPanel
            tone={s?.tone ?? null}
            reply_style={s?.reply_style ?? null}
            language={s?.language || "nl"}
            automationNote={automationNote}
            hideIntroHeader
          />
        </section>
      </DashboardWorkSurface>
    </PageFrame>
  );
}
