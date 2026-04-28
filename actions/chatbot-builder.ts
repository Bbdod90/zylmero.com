"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ChatbotGoals = {
  vragenBeantwoorden: boolean;
  klantenHelpen: boolean;
  contactAanvragenVerwerken: boolean;
};

export type SaveChatbotBuilderInput = {
  chatbotId: string;
  bedrijfsOmschrijving: string;
  websiteUrl: string;
  extraInfo: string;
  openingszin: string;
  doelen: ChatbotGoals;
};

export type SaveChatbotBuilderResult =
  | { ok: true; chatbotId: string }
  | { ok: false; error: string };

function normalizeWebsite(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const raw = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function saveChatbotBuilderAction(
  input: SaveChatbotBuilderInput,
): Promise<SaveChatbotBuilderResult> {
  const auth = await getAuth();
  if (!auth.user) return { ok: false, error: "Niet ingelogd." };

  const bedrijfsOmschrijving = input.bedrijfsOmschrijving.trim();
  if (!bedrijfsOmschrijving) {
    return { ok: false, error: "Bedrijfsomschrijving is verplicht." };
  }
  if (bedrijfsOmschrijving.length > 3000) {
    return { ok: false, error: "Bedrijfsomschrijving is te lang (max 3000 tekens)." };
  }

  const websiteUrl = normalizeWebsite(input.websiteUrl);
  if (input.websiteUrl.trim() && !websiteUrl) {
    return { ok: false, error: "Website URL is ongeldig." };
  }

  const extraInfo = input.extraInfo.trim();
  if (extraInfo.length > 6000) {
    return { ok: false, error: "Extra info is te lang (max 6000 tekens)." };
  }

  const openingszin = input.openingszin.trim();
  if (openingszin.length > 400) {
    return { ok: false, error: "Openingszin is te lang (max 400 tekens)." };
  }

  const settings = {
    doelen: {
      vragen_beantwoorden: Boolean(input.doelen.vragenBeantwoorden),
      klanten_helpen: Boolean(input.doelen.klantenHelpen),
      contactaanvragen_verwerken: Boolean(input.doelen.contactAanvragenVerwerken),
    },
    communicatiestijl: "zakelijk",
    antwoord_lengte: "kort",
    automation_regels: [],
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("chatbots")
    .update({
      bedrijfs_omschrijving: bedrijfsOmschrijving,
      website_url: websiteUrl,
      extra_info: extraInfo || null,
      openingszin: openingszin || null,
      settings,
      is_active: true,
    })
    .eq("id", input.chatbotId)
    .eq("user_id", auth.user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/chatbot");
  revalidatePath("/dashboard/chatbot/settings");
  return { ok: true, chatbotId: input.chatbotId };
}

export type UpdateChatbotRuntimeSettingsInput = {
  chatbotId: string;
  communicatiestijl: "zakelijk" | "informeel";
  antwoordLengte: "kort" | "normaal" | "uitgebreid";
  automationRegels: string;
};

export type UpdateChatbotRuntimeSettingsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateChatbotRuntimeSettingsAction(
  input: UpdateChatbotRuntimeSettingsInput,
): Promise<UpdateChatbotRuntimeSettingsResult> {
  const auth = await getAuth();
  if (!auth.user) return { ok: false, error: "Niet ingelogd." };

  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("chatbots")
    .select("settings")
    .eq("id", input.chatbotId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (readError) return { ok: false, error: readError.message };
  if (!existing) return { ok: false, error: "Chatbot niet gevonden." };

  const currentSettings =
    existing.settings && typeof existing.settings === "object" ? existing.settings : {};
  const nextSettings = {
    ...currentSettings,
    communicatiestijl: input.communicatiestijl,
    antwoord_lengte: input.antwoordLengte,
    automation_regels: input.automationRegels
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  };

  const { error } = await supabase
    .from("chatbots")
    .update({ settings: nextSettings })
    .eq("id", input.chatbotId)
    .eq("user_id", auth.user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/chatbot/settings");
  revalidatePath("/dashboard/chatbot");
  return { ok: true };
}
