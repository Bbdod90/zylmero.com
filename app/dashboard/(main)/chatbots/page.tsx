import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireCompany } from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { PageFrame } from "@/components/layout/page-frame";
import { NewEmbeddedChatbotButton } from "@/components/embedded-chat/new-embedded-chatbot-button";
import { maxEmbeddedChatbotsForPlan } from "@/lib/billing/embedded-chat-limits";

export default async function EmbeddedChatbotsPage() {
  const { company } = await requireCompany();

  if (!isSupabaseConfigured()) {
    return (
      <PageFrame title="Website-chat" subtitle="Chatbot voor op je eigen site">
        <p className="text-sm text-muted-foreground">
          Supabase-keys ontbreken. Vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in (.env.local) om chatbots op te
          slaan.
        </p>
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
      <div className="flex justify-end">
        <NewEmbeddedChatbotButton />
      </div>
      <p className="text-sm text-muted-foreground">
        Je pakket staat tot <strong className="font-medium text-foreground">{max}</strong> bot(s) toe. Grotere limiet via upgrade.
      </p>

      {error ? (
        <p className="mt-6 text-sm text-destructive">Kon chatbots niet laden.</p>
      ) : rows && rows.length > 0 ? (
        <ul className="mt-8 divide-y divide-border/60 rounded-xl border border-border/60 bg-card dark:border-white/[0.08] dark:bg-card/60">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/dashboard/chatbots/${row.id}`}
                className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/40 md:px-5"
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
        <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-12 text-center dark:border-white/[0.12]">
          <p className="max-w-md text-sm text-muted-foreground">
            Nog geen chatbot. Maak er een aan — daarna embed je één regel code op je site.
          </p>
          <div className="mt-6">
            <NewEmbeddedChatbotButton />
          </div>
        </div>
      )}
    </PageFrame>
  );
}
