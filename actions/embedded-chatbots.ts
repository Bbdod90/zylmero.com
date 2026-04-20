"use server";

import { revalidatePath } from "next/cache";
import { requireCompany } from "@/lib/auth";
import { maxEmbeddedChatbotsForPlan } from "@/lib/billing/embedded-chat-limits";
import type { EmbeddedChatTone, EmbeddedChatbotSourceType } from "@/lib/embedded-chat/types";
import type { WizardGoalId } from "@/lib/embedded-chat/wizard-presets";
import { WIZARD_GOAL_PRESETS } from "@/lib/embedded-chat/wizard-presets";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isNonPublicKnowledgeHost, normalizeKnowledgeWebsiteUrl } from "@/lib/url/public-site-url";

function needSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is niet geconfigureerd. Vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in.");
  }
}

export async function createEmbeddedChatbot() {
  needSupabase();
  const { company } = await requireCompany();
  const supabase = await createClient();
  const max = maxEmbeddedChatbotsForPlan(company.plan);
  const { count } = await supabase
    .from("embedded_chatbots")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);

  if (count != null && count >= max) {
    return {
      ok: false as const,
      error: `Je huidige pakket staat maximaal ${max} website-chatbot(s) toe. Upgrade om meer toe te voegen.`,
    };
  }

  const { data, error } = await supabase
    .from("embedded_chatbots")
    .insert({
      company_id: company.id,
      name: "Website-assistent",
      tone: "zakelijk",
      instructions:
        "Beantwoord vragen over onze diensten, prijzen en planning. Helpt klanten naar een concrete afspraak of volgende stap.",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return { ok: false as const, error: "Aanmaken mislukt. Probeer het opnieuw." };
  }
  revalidatePath("/dashboard/chatbots");
  return { ok: true as const, id: data.id };
}

export async function createEmbeddedChatbotFromWizard(form: {
  goal: WizardGoalId;
  websiteUrl?: string | null;
}) {
  needSupabase();
  const { company } = await requireCompany();
  const supabase = await createClient();
  const max = maxEmbeddedChatbotsForPlan(company.plan);
  const { count } = await supabase
    .from("embedded_chatbots")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);

  if (count != null && count >= max) {
    return {
      ok: false as const,
      error: `Je huidige pakket staat maximaal ${max} website-chatbot(s) toe. Upgrade om meer toe te voegen.`,
    };
  }

  const rawUrl = form.websiteUrl?.trim();
  let normalizedUrl: string | null = null;
  if (rawUrl) {
    let n = rawUrl;
    if (!/^https?:\/\//i.test(n)) {
      n = `https://${n}`;
    }
    try {
      // eslint-disable-next-line no-new -- validate URL shape
      new URL(n);
    } catch {
      return {
        ok: false as const,
        error: "Die URL lijkt ongeldig. Gebruik bijvoorbeeld https://jouwdomein.nl",
      };
    }
    normalizedUrl = n;
  }

  const preset = WIZARD_GOAL_PRESETS[form.goal];
  const { data, error } = await supabase
    .from("embedded_chatbots")
    .insert({
      company_id: company.id,
      name: preset.name,
      tone: preset.tone,
      instructions: preset.instructions,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return { ok: false as const, error: "Aanmaken mislukt. Probeer het opnieuw." };
  }

  let urlWarning: string | undefined;
  if (normalizedUrl) {
    const { error: srcErr } = await supabase.from("embedded_chatbot_sources").insert({
      chatbot_id: data.id,
      type: "url",
      content: normalizedUrl,
    });
    if (srcErr) {
      urlWarning =
        "De website-URL kon niet worden opgeslagen. Voeg hem handmatig toe bij Kennis op de volgende pagina.";
    }
  }

  revalidatePath("/dashboard/chatbots");
  revalidatePath(`/dashboard/chatbots/${data.id}`);
  return { ok: true as const, id: data.id, warning: urlWarning };
}

export async function updateEmbeddedChatbot(form: {
  id: string;
  name: string;
  tone: EmbeddedChatTone;
  instructions: string;
}) {
  needSupabase();
  await requireCompany();
  const supabase = await createClient();
  const name = form.name.trim();
  if (!name) {
    return { ok: false as const, error: "Naam is verplicht." };
  }
  const { error } = await supabase
    .from("embedded_chatbots")
    .update({
      name,
      tone: form.tone,
      instructions: form.instructions.trim(),
    })
    .eq("id", form.id);

  if (error) {
    return { ok: false as const, error: "Opslaan mislukt." };
  }
  revalidatePath("/dashboard/chatbots");
  revalidatePath(`/dashboard/chatbots/${form.id}`);
  return { ok: true as const };
}

export async function deleteEmbeddedChatbot(id: string) {
  needSupabase();
  await requireCompany();
  const supabase = await createClient();
  const { error } = await supabase.from("embedded_chatbots").delete().eq("id", id);
  if (error) {
    return { ok: false as const, error: "Verwijderen mislukt." };
  }
  revalidatePath("/dashboard/chatbots");
  return { ok: true as const };
}

export async function addEmbeddedChatbotSource(form: {
  chatbotId: string;
  type: EmbeddedChatbotSourceType;
  content: string;
}) {
  needSupabase();
  await requireCompany();
  const supabase = await createClient();
  let content = form.content.trim();
  if (!content) {
    return { ok: false as const, error: "Vul tekst of een URL in." };
  }
  if (form.type === "url") {
    content = normalizeKnowledgeWebsiteUrl(content);
    if (!/^https?:\/\//i.test(content)) {
      return { ok: false as const, error: "Vul een geldige website in (bijv. jouwbedrijf.nl)." };
    }
    if (isNonPublicKnowledgeHost(content)) {
      return {
        ok: false as const,
        error: "Gebruik je publieke website (geen localhost).",
      };
    }
  }
  const { error } = await supabase.from("embedded_chatbot_sources").insert({
    chatbot_id: form.chatbotId,
    type: form.type,
    content,
  });
  if (error) {
    return { ok: false as const, error: "Bron toevoegen mislukt." };
  }
  revalidatePath(`/dashboard/chatbots/${form.chatbotId}`);
  return { ok: true as const };
}

export async function deleteEmbeddedChatbotSource(id: string, chatbotId: string) {
  needSupabase();
  await requireCompany();
  const supabase = await createClient();
  const { error } = await supabase.from("embedded_chatbot_sources").delete().eq("id", id);
  if (error) {
    return { ok: false as const, error: "Verwijderen mislukt." };
  }
  revalidatePath(`/dashboard/chatbots/${chatbotId}`);
  return { ok: true as const };
}
