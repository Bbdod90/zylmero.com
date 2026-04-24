"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { SocialProvider } from "@/lib/queries/social-connections";

export async function disconnectSocialAction(provider: SocialProvider) {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false as const, error: "Niet ingelogd." };
  }
  if (auth.companyRole !== "owner") {
    return { ok: false as const, error: "Alleen de eigenaar kan koppelingen verwijderen." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_social_connections")
    .delete()
    .eq("company_id", auth.company.id)
    .eq("provider", provider);

  if (error) {
    console.error("[disconnectSocial]", error);
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/dashboard/socials");
  return { ok: true as const };
}
