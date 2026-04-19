import type { Metadata } from "next";
import { ChatbotLandingPage } from "@/components/chatbot-landing/chatbot-landing-page";
import { DemoRoleProvider } from "@/components/landing/demo-role-context";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Chatbot op je website in 5 minuten — ${BRAND_NAME}`,
  description:
    "Beantwoord vragen, plan afspraken, mis geen bezoekers. Voor zzp, mkb en lokale bedrijven. Geen code nodig — werkt op elke website.",
};

export default function ChatbotPage() {
  return (
    <DemoRoleProvider>
      <ChatbotLandingPage />
    </DemoRoleProvider>
  );
}
