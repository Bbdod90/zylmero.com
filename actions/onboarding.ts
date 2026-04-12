"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
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

/**
 * Bestaand bedrijf: door naar dashboard als alles klopt.
 * Anders (alleen company-rij, geen settings — mislukte eerdere poging): opruimen zodat onboarding opnieuw kan.
 */
async function resolveExistingCompanyForOnboarding(
  supabase: SupabaseClient,
  userId: string,
  companyId: string,
): Promise<{ error?: string }> {
  const { data: existingSettings } = await supabase
    .from("company_settings")
    .select("company_id")
    .eq("company_id", companyId)
    .maybeSingle();
  if (existingSettings) {
    redirect("/dashboard");
  }
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId)
    .eq("owner_user_id", userId);
  if (error) {
    return {
      error:
        "Je account heeft een incompleet bedrijfsprofiel. Vernieuw de pagina of neem contact op met support.",
    };
  }
  revalidatePath("/", "layout");
  return {};
}

const QUICK_START_COMPANY_NAME = "Mijn bedrijf";
const QUICK_START_NICHE: NicheId = "general_services";

/** Verplaatst automation_preferences naar niche_intake en verwijdert de kolom uit de payload. */
function rowWithoutAutomationPreferences(
  row: Record<string, unknown>,
): Record<string, unknown> {
  const prefs = (row.automation_preferences as Record<string, unknown>) || {};
  const baseIntake =
    row.niche_intake &&
    typeof row.niche_intake === "object" &&
    !Array.isArray(row.niche_intake)
      ? { ...(row.niche_intake as Record<string, string>) }
      : {};
  const prefIntake =
    prefs.niche_intake &&
    typeof prefs.niche_intake === "object" &&
    !Array.isArray(prefs.niche_intake)
      ? (prefs.niche_intake as Record<string, string>)
      : {};
  const nicheKey =
    typeof prefs.niche_key === "string" ? prefs.niche_key : undefined;
  const onboardingFlow =
    prefs.onboarding_flow != null ? String(prefs.onboarding_flow) : undefined;
  const { automation_preferences: _a, ...rest } = row;
  return {
    ...rest,
    niche_intake: {
      ...baseIntake,
      ...prefIntake,
      ...(nicheKey ? { niche_key: nicheKey } : {}),
      ...(onboardingFlow ? { onboarding_flow: onboardingFlow } : {}),
    },
  };
}

function omitBookingLink(row: Record<string, unknown>): Record<string, unknown> {
  const { booking_link: _b, ...rest } = row;
  return rest;
}

function omitBusinessHours(row: Record<string, unknown>): Record<string, unknown> {
  const { business_hours: _h, ...rest } = row;
  return rest;
}

function omitNicheIntakeAndKnowledge(row: Record<string, unknown>): Record<string, unknown> {
  const { niche_intake: _n, knowledge_snippets: _k, ...rest } = row;
  return rest;
}

function omitLanguage(row: Record<string, unknown>): Record<string, unknown> {
  const { language: _l, ...rest } = row;
  return rest;
}

function omitNicheColumn(row: Record<string, unknown>): Record<string, unknown> {
  const { niche: _n, ...rest } = row;
  return rest;
}

async function insertCompanySettingsResilient(
  supabase: SupabaseClient,
  fullRow: Record<string, unknown>,
): Promise<{ error: { message: string } | null }> {
  const noAuto = rowWithoutAutomationPreferences(fullRow);
  const baseAttempts: Record<string, unknown>[] = [
    fullRow,
    omitBookingLink(fullRow),
    omitBusinessHours(fullRow),
    omitBookingLink(omitBusinessHours(fullRow)),
    noAuto,
    omitBookingLink(noAuto),
    omitBusinessHours(noAuto),
    omitBookingLink(omitBusinessHours(noAuto)),
    omitNicheIntakeAndKnowledge(omitBookingLink(omitBusinessHours(noAuto))),
    {
      company_id: fullRow.company_id,
      niche: fullRow.niche,
      services: fullRow.services ?? [],
      faq: fullRow.faq ?? [],
      pricing_hints: fullRow.pricing_hints ?? null,
      language: (fullRow.language as string) || "nl",
    },
    {
      company_id: fullRow.company_id,
      niche: fullRow.niche,
      services: fullRow.services ?? [],
      faq: fullRow.faq ?? [],
      pricing_hints: fullRow.pricing_hints ?? null,
    },
    {
      company_id: fullRow.company_id,
      services: fullRow.services ?? [],
      faq: fullRow.faq ?? [],
      pricing_hints: fullRow.pricing_hints ?? null,
      language: (fullRow.language as string) || "nl",
    },
    {
      company_id: fullRow.company_id,
      services: fullRow.services ?? [],
      faq: fullRow.faq ?? [],
      pricing_hints: fullRow.pricing_hints ?? null,
    },
    { company_id: fullRow.company_id },
  ];
  const attempts: Record<string, unknown>[] = [
    ...baseAttempts,
    ...baseAttempts.map(omitLanguage),
    ...baseAttempts.map(omitNicheColumn),
    ...baseAttempts.map((r) => omitNicheColumn(omitLanguage(r))),
  ];

  let last: { message: string } | null = null;
  for (const attempt of attempts) {
    const { error } = await supabase.from("company_settings").insert(attempt);
    if (!error) return { error: null };
    last = error;
  }
  return { error: last };
}

async function applyReferralIfPresent(companyId: string) {
  try {
    const ref =
      cookies().get("zm_referral_code")?.value?.trim().toUpperCase() ||
      cookies().get("cf_referral_code")?.value?.trim().toUpperCase();
    if (ref && ref.length >= 6) {
      const admin = createAdminClient();
      const { data: refRow } = await admin
        .from("companies")
        .select("id")
        .eq("referral_code", ref)
        .maybeSingle();
      if (refRow?.id && refRow.id !== companyId) {
        await admin.from("referral_conversions").insert({
          referrer_company_id: refRow.id,
          referee_company_id: companyId,
          referral_code: ref,
          credit_eur: 10,
        });
      }
    }
  } catch {
    /* referral niet verplicht */
  }
}

export async function skipOnboardingWizardAction(): Promise<OnboardingState> {
  const auth = await getAuth();
  if (!auth.user) {
    redirect("/login");
  }

  const supabase = await createClient();
  if (auth.company) {
    const r = await resolveExistingCompanyForOnboarding(
      supabase,
      auth.user.id,
      auth.company.id,
    );
    if (r.error) return { error: r.error };
  }

  const niche_key = QUICK_START_NICHE;
  const config = getNicheConfig(niche_key);
  const nicheLabel = displayNicheLabel(niche_key, "");

  const faqPairs = config.defaultFaqTemplate
    .split("\n\n")
    .map((block) => {
      const [q, a] = block.split("||");
      return { q: q?.trim() || "", a: a?.trim() || "" };
    })
    .filter((row) => row.q && row.a);

  const now = new Date();
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const { data: company, error: cErr } = await supabase
    .from("companies")
    .insert({
      name: QUICK_START_COMPANY_NAME,
      owner_user_id: auth.user.id,
      onboarding_completed: true,
      profile_intake_completed: false,
      contact_email: null,
      contact_phone: null,
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

  const automation_preferences = {
    niche_key,
    niche_intake: {} as Record<string, string>,
    onboarding_skipped: true,
  };

  const settingsRow: Record<string, unknown> = {
    company_id: company.id,
    niche: nicheLabel,
    services: [...config.defaultServices],
    faq: faqPairs.length ? faqPairs : [],
    pricing_hints: config.defaultPricingHints || null,
    business_hours: {},
    booking_link: null,
    tone: config.defaultTone,
    reply_style: config.defaultReplyStyle,
    language: "nl",
    knowledge_snippets: [],
    niche_intake: {},
    automation_preferences,
  };

  const { error: sErr } = await insertCompanySettingsResilient(
    supabase,
    settingsRow,
  );
  if (sErr) {
    await supabase.from("companies").delete().eq("id", company.id).eq("owner_user_id", auth.user.id);
    revalidatePath("/", "layout");
    return { error: sErr.message };
  }

  await ensureCompanyReferralCode(supabase, company.id);
  await applyReferralIfPresent(company.id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const auth = await getAuth();
  if (!auth.user) {
    redirect("/login");
  }

  const supabase = await createClient();
  if (auth.company) {
    const r = await resolveExistingCompanyForOnboarding(
      supabase,
      auth.user.id,
      auth.company.id,
    );
    if (r.error) return { error: r.error };
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

  const weeklyBand = intake.weekly_leads_band || "";
  const teamSz = intake.team_size || "";
  const pain = intake.pain_note || "";
  const pricing_hints = flowV5
    ? [
        `Gemiddelde order rond €${avgOrderNum || "—"}.`,
        `Kanalen: ${chList.join(", ") || "n.t.b."}.`,
        `Reactietijd nu: ${responseTime || "—"}.`,
        weeklyBand ? `Geschatte aanvragen per week: ${weeklyBand}.` : "",
        teamSz ? `Team: ${teamSz}.` : "",
        pain ? `Belangrijkste knelpunt: ${pain}.` : "",
      ]
        .filter(Boolean)
        .join(" ")
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

  const now = new Date();
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const { data: company, error: cErr } = await supabase
    .from("companies")
    .insert({
      name,
      owner_user_id: auth.user.id,
      onboarding_completed: true,
      profile_intake_completed: true,
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

  const automation_preferences = {
    niche_key,
    niche_intake: intake,
    ...(flowV5 ? { onboarding_flow: "conversion_v5" } : {}),
  };

  const settingsRow: Record<string, unknown> = {
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
    knowledge_snippets: [],
    niche_intake: intake,
    automation_preferences,
  };

  const { error: sErr } = await insertCompanySettingsResilient(
    supabase,
    settingsRow,
  );

  if (sErr) {
    await supabase.from("companies").delete().eq("id", company.id).eq("owner_user_id", auth.user.id);
    revalidatePath("/", "layout");
    return { error: sErr.message };
  }

  await ensureCompanyReferralCode(supabase, company.id);
  await applyReferralIfPresent(company.id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
