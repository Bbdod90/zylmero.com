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

export async function connectAppleCalendarAction(input: {
  icsUrl: string;
  displayName?: string;
}) {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false as const, error: "Niet ingelogd." };
  }
  if (auth.companyRole !== "owner") {
    return { ok: false as const, error: "Alleen de eigenaar kan kalender koppelen." };
  }
  const rawUrl = input.icsUrl.trim();
  if (!rawUrl) return { ok: false as const, error: "ICS URL is verplicht." };
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false as const, error: "Ongeldige URL." };
  }
  if (url.protocol !== "https:") {
    return { ok: false as const, error: "Gebruik een HTTPS iCal/ICS URL." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("company_social_connections").upsert(
    {
      company_id: auth.company.id,
      provider: "apple_calendar",
      status: "connected",
      display_name: input.displayName?.trim() || "Apple Calendar (iCal)",
      external_page_id: null,
      metadata: { ics_url: url.toString() },
      encrypted_token: null,
      token_expires_at: null,
      last_error: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "company_id,provider" },
  );
  if (error) {
    return { ok: false as const, error: error.message };
  }
  revalidatePath("/dashboard/socials");
  return { ok: true as const };
}
