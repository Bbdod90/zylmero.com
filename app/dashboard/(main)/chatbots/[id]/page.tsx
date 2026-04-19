import { notFound } from "next/navigation";
import { requireCompany } from "@/lib/auth";
import { BRAND_DEFAULT_SITE_URL } from "@/lib/brand";
import type { EmbeddedChatTone } from "@/lib/embedded-chat/types";
import { tryResolveSiteUrl } from "@/lib/site-url";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { EmbeddedChatbotEditor } from "@/components/embedded-chat/embedded-chatbot-editor";
import { PageFrame } from "@/components/layout/page-frame";
export default async function EmbeddedChatbotDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { company } = await requireCompany();

  if (!isSupabaseConfigured()) {
    return (
      <PageFrame title="Website-chat">
        <p className="text-sm text-muted-foreground">
          Supabase-keys ontbreken — configureer eerst je database.
        </p>
      </PageFrame>
    );
  }

  const supabase = await createClient();
  const { data: bot, error } = await supabase
    .from("embedded_chatbots")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !bot || bot.company_id !== company.id) {
    notFound();
  }

  const { data: sources } = await supabase
    .from("embedded_chatbot_sources")
    .select("*")
    .eq("chatbot_id", bot.id)
    .order("created_at", { ascending: false });

  const baseUrl =
    tryResolveSiteUrl() ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : BRAND_DEFAULT_SITE_URL);
  const widgetScriptUrl = `${baseUrl.replace(/\/$/, "")}/widget.js`;

  return (
    <PageFrame
      title={bot.name}
      subtitle="Instellingen, kennis en embed-code — met live test."
      dismissHref="/dashboard/chatbots"
      dismissLabel="Alle chatbots"
    >
      <EmbeddedChatbotEditor
        chatbot={{
          id: bot.id,
          name: bot.name,
          tone: bot.tone as EmbeddedChatTone,
          instructions: bot.instructions ?? "",
        }}
        sources={sources ?? []}
        widgetScriptUrl={widgetScriptUrl}
        companyName={company.name}
      />
    </PageFrame>
  );
}
