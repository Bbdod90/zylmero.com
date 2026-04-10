"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureCompanyReferralCode } from "@/lib/referral/code";
import {
  displayNicheLabel,
  getNicheConfig,
  isNicheId,
  type NicheId,
} from "@/lib/niches";

export type OnboardingState = { error?: string };

export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const auth = await getAuth();
  if (!auth.user) {
    redirect("/login");
  }
  if (auth.company) {
    redirect("/dashboard");
  }

  const name = String(formData.get("company_name") || "").trim();
  const nicheKeyRaw = String(formData.get("niche_key") || "").trim();
  const niche_custom = String(formData.get("niche_custom") || "").trim();
  const flowV5 = String(formData.get("onboarding_flow") || "") === "conversion_v5";

  if (!name) {
    return { error: "Bedrijfsnaam is verplicht." };
  }
  if (!nicheKeyRaw || !isNicheId(nicheKeyRaw)) {
    return { error: "Kies wat voor bedrijf je hebt." };
  }
  if (nicheKeyRaw === "other" && !niche_custom) {
    return { error: "Vul kort in wat voor bedrijf je hebt." };
  }

  const niche_key = nicheKeyRaw as NicheId;
  const config = getNicheConfig(niche_key);

  const intake: Record<string, string> = {};
  if (flowV5) {
    const avg = String(formData.get("avg_order_eur") || "").trim();
    const rt = String(formData.get("response_time") || "").trim();
    const ch: string[] = [];
    for (const id of ["whatsapp", "mail", "website", "instagram"]) {
      if (formData.get(`channel_${id}`) === "on") ch.push(id);
    }
    intake.avg_order_eur = avg;
    intake.response_time = rt;
    intake.channels = ch.join(",");
  }
  for (const [k, v] of Array.from(formData.entries())) {
    if (k.startsWith("intake_")) {
      const key = k.slice("intake_".length);
      intake[key] = String(v ?? "").trim();
    }
  }

  const servicesRaw = String(formData.get("services") || "");
  const servicesLines = servicesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const services = servicesLines.length
    ? servicesLines
    : [...config.defaultServices];

  const faqPairsRaw = String(formData.get("faq") || "").trim();
  const faqSource = faqPairsRaw || config.defaultFaqTemplate;
  const faqPairs = faqSource
    .split("\n\n")
    .map((block) => {
      const [q, a] = block.split("||");
      return { q: q?.trim() || "", a: a?.trim() || "" };
    })
    .filter((row) => row.q && row.a);

  const avgOrderNum = Number(formData.get("avg_order_eur") || 0);
  const responseTime = String(formData.get("response_time") || "");
  const chList: string[] = [];
  for (const id of ["whatsapp", "mail", "website", "instagram"]) {
    if (formData.get(`channel_${id}`) === "on") chList.push(id);
  }

  const pricing_hints = flowV5
    ? `Gemiddelde order rond €${avgOrderNum || "—"}. Kanalen: ${chList.join(", ") || "n.t.b."}. Reactietijd: ${responseTime || "—"}.`
    : String(formData.get("pricing_hints") || "").trim() ||
      config.defaultPricingHints;
  const hoursRaw = String(formData.get("business_hours") || "").trim();
  const tone = flowV5
    ? config.defaultTone
    : String(formData.get("tone") || "").trim() || config.defaultTone;
  const reply_style = flowV5
    ? config.defaultReplyStyle
    : String(formData.get("reply_style") || "").trim() ||
      config.defaultReplyStyle;
  const booking_link = String(formData.get("booking_link") || "").trim();
  const contact_email = String(formData.get("contact_email") || "").trim();
  const contact_phone = String(formData.get("contact_phone") || "").trim();

  const nicheLabel = displayNicheLabel(niche_key, niche_custom);

  const supabase = await createClient();
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const { data: company, error: cErr } = await supabase
    .from("companies")
    .insert({
      name,
      owner_user_id: auth.user.id,
      onboarding_completed: true,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      trial_starts_at: now.toISOString(),
      trial_ends_at: trialEnd.toISOString(),
      plan: "trial",
      is_active: true,
      niche: niche_key,
    })
    .select("id")
    .single();

  if (cErr || !company) {
    return { error: cErr?.message || "Bedrijf kon niet worden aangemaakt." };
  }

  const { error: sErr } = await supabase.from("company_settings").insert({
    company_id: company.id,
    niche: nicheLabel,
    services: services.length ? services : [],
    faq: faqPairs.length ? faqPairs : [],
    pricing_hints: pricing_hints || null,
    business_hours: hoursRaw
      ? ({ text: hoursRaw } as Record<string, string>)
      : {},
    booking_link: booking_link || null,
    tone: tone || null,
    reply_style: reply_style || null,
    language: "nl",
    niche_intake: intake,
    knowledge_snippets: [],
    automation_preferences: {
      niche_key,
      niche_intake: intake,
      ...(flowV5 ? { onboarding_flow: "conversion_v5" } : {}),
    },
  });

  if (sErr) {
    return { error: sErr.message };
  }

  await ensureCompanyReferralCode(supabase, company.id);

  try {
    const ref = cookies().get("cf_referral_code")?.value?.trim().toUpperCase();
    if (ref && ref.length >= 6) {
      const admin = createAdminClient();
      const { data: refRow } = await admin
        .from("companies")
        .select("id")
        .eq("referral_code", ref)
        .maybeSingle();
      if (refRow?.id && refRow.id !== company.id) {
        await admin.from("referral_conversions").insert({
          referrer_company_id: refRow.id,
          referee_company_id: company.id,
          referral_code: ref,
          credit_eur: 10,
        });
      }
    }
  } catch {
    /* referral niet verplicht */
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/ai-setup");
}
