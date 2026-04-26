import { redirect } from "next/navigation";

/** Oude URL: chatbot staat op `/dashboard/chatbot`. */
export default function AiSettingsRedirectPage() {
  redirect("/dashboard/chatbot");
}
