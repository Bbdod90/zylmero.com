import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { ChatbotRuntimeSettingsForm } from "@/components/chatbot/chatbot-runtime-settings-form";

export default async function ChatbotSettingsPage() {
  const auth = await getAuth();
  if (!auth.user) return null;

  const supabase = await createClient();
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!chatbot) return null;

  return (
    <PageFrame
      title="Chatbot instellingen"
      subtitle="Pas communicatiestijl, antwoordlengte en automation regels van je chatbot aan."
    >
      <DashboardWorkSurface>
        <ChatbotRuntimeSettingsForm chatbot={chatbot} />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
