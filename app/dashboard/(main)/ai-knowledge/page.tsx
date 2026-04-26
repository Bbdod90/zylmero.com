import { redirect } from "next/navigation";

/** AI-kennis staat samen met de chatbot op `/dashboard/chatbot`. */
export default function AiKnowledgeRedirectPage() {
  redirect("/dashboard/chatbot");
}
