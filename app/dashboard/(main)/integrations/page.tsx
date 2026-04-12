import { redirect } from "next/navigation";

/** Oude URL: alles staat nu onder AI & koppelingen. */
export default function IntegrationsPageRedirect() {
  redirect("/dashboard/ai-koppelingen");
}
