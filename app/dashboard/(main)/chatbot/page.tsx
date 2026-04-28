import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { ChatbotBuilder } from "@/components/chatbot/chatbot-builder";

export default async function ChatbotPage() {
  const auth = await getAuth();
  if (!auth.user) return null;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("chatbots")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let chatbot = existing;
  if (!chatbot) {
    const { data: created } = await supabase
      .from("chatbots")
      .insert({
        user_id: auth.user.id,
        bedrijfs_omschrijving: "",
        website_url: null,
        extra_info: null,
        openingszin: "Hallo! Waarmee kan ik je helpen?",
        settings: {
          doelen: {
            vragen_beantwoorden: true,
            klanten_helpen: true,
            contactaanvragen_verwerken: true,
          },
          communicatiestijl: "zakelijk",
          antwoord_lengte: "kort",
          automation_regels: [],
        },
        is_active: false,
      })
      .select("*")
      .single();
    chatbot = created;
  }

  if (!chatbot) return null;

  return (
    <PageFrame
      title="Je chatbot"
      subtitle="Invullen, direct live testen en daarna meteen koppelen aan je kanalen."
    >
      <DashboardWorkSurface wide>
        <ChatbotBuilder chatbot={chatbot} />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
