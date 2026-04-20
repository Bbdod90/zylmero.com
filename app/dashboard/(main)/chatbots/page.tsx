import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { requireCompany } from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { NewEmbeddedChatbotButton } from "@/components/embedded-chat/new-embedded-chatbot-button";
import { WebsiteChatSetupGuide } from "@/components/embedded-chat/website-chat-setup-guide";
import { Button } from "@/components/ui/button";
import { maxEmbeddedChatbotsForPlan } from "@/lib/billing/embedded-chat-limits";

export default async function EmbeddedChatbotsPage() {
  const { company } = await requireCompany();

  if (!isSupabaseConfigured()) {
    return (
      <PageFrame title="Website-chat" subtitle="Chatbot voor op je eigen site">
        <DashboardWorkSurface>
          <div className="cf-dashboard-panel p-6 sm:p-7">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Supabase-keys ontbreken. Vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in (.env.local) om chatbots op te
              slaan.
            </p>
          </div>
        </DashboardWorkSurface>
      </PageFrame>
    );
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("embedded_chatbots")
    .select("id, name, tone, updated_at")
    .eq("company_id", company.id)
    .order("updated_at", { ascending: false });

  const max = maxEmbeddedChatbotsForPlan(company.plan);

  return (
    <PageFrame title="Website-chat" subtitle="Bouw, test en embed een assistent op je site — binnen je actieve abonnement.">
      <DashboardWorkSurface>
        <div className="cf-dashboard-panel space-y-6 p-5 sm:p-6 lg:p-7">
          <WebsiteChatSetupGuide variant="compact" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Eén regel JavaScript op je site — geen framework nodig. Start met de wizard (aanbevolen) of maak direct een bot zonder stappen.
            </p>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="rounded-lg shadow-sm">
                <Link href="/dashboard/chatbots/create">
                  <Sparkles className="mr-2 size-4" aria-hidden />
                  Begeleide opstart
                </Link>
              </Button>
              <NewEmbeddedChatbotButton variant="outline" />
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Je pakket staat tot <strong className="font-medium text-foreground">{max}</strong> bot(s) toe. Grotere limiet via upgrade.
        </p>

        {error ? (
          <div className="cf-dashboard-panel border-destructive/25 bg-destructive/[0.04] p-5">
            <p className="text-sm text-destructive">Kon chatbots niet laden.</p>
          </div>
        ) : rows && rows.length > 0 ? (
          <ul className="cf-dashboard-panel mt-2 divide-y divide-border/50 overflow-hidden">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/dashboard/chatbots/${row.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/35 md:px-5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Toon: {row.tone} · bijgewerkt{" "}
                      {new Date(row.updated_at).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="cf-dashboard-panel mt-2 flex flex-col items-center border-dashed border-border/55 px-6 py-12 text-center dark:border-white/[0.12]">
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Nog geen chatbot. Maak er een aan — daarna embed je één regel code op je site.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-lg shadow-sm">
                <Link href="/dashboard/chatbots/create">
                  <Sparkles className="mr-2 size-4" aria-hidden />
                  Begeleide opstart
                </Link>
              </Button>
              <NewEmbeddedChatbotButton variant="outline" />
            </div>
          </div>
        )}
      </DashboardWorkSurface>
    </PageFrame>
  );
}
