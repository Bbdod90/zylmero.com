"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/i18n/auth-errors";
import { scheduleMarketingDrip } from "@/lib/marketing/drip";
import { COOKIE_ANON_DEMO, COOKIE_DEMO, COOKIE_DEMO_ENTRY, COOKIE_SALES_MODE, LEGACY_COOKIES_TO_CLEAR } from "@/lib/app-cookies";
import { tryResolveSiteUrl } from "@/lib/site-url";

export type AuthFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    return { error: "E-mail en wachtwoord zijn verplicht." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { error: mapAuthError(error.message) };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Signup gebeurt in de browser (`createBrowserClient`) zodat Supabase rate limits per
 * eindgebruiker-IP telt — server-side signup deelt één IP (Railway/Vercel) en raakt snel “te veel pogingen”.
 * Deze action alleen als er direct een sessie is (e-mailbevestiging uit in Supabase).
 */
export async function signUpMarketingHookAction(email: string): Promise<void> {
  try {
    await scheduleMarketingDrip({ email, source: "signup" });
  } catch {
    /* niet blokkerend */
  }
  revalidatePath("/", "layout");
}

export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    return { error: "Vul je e-mailadres in." };
  }

  /* Direct naar /reset-password: anders kan Supabase bij afwijkende callback naar Site URL (/) gaan. */
  const base = tryResolveSiteUrl();
  if (!base) {
    return {
      error:
        "Site-URL ontbreekt: zet SITE_URL of NEXT_PUBLIC_SITE_URL in .env (zelfde basis-URL als je live app). Anders kan Supabase geen geldige resetlink maken.",
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    /* `?r=1` zodat e-mailtemplate altijd `&token_hash=…` mag gebruiken (cross-device, geen PKCE). */
    redirectTo: `${base}/reset-password?r=1`,
  });
  if (error) {
    return { error: mapAuthError(error.message) };
  }
  return {
    success: true,
    message:
      "Als dit e-mailadres bij ons bekend is, ontvang je een link om je wachtwoord te resetten.",
  };
}

export async function updatePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 8) {
    return { error: "Kies een wachtwoord van minimaal 8 tekens." };
  }
  if (password !== confirm) {
    return { error: "Wachtwoorden komen niet overeen." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: mapAuthError(error.message) };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard?notice=wachtwoord-bijgewerkt");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  try {
    const store = cookies();
    for (const name of [
      COOKIE_ANON_DEMO,
      COOKIE_DEMO,
      COOKIE_SALES_MODE,
      COOKIE_DEMO_ENTRY,
      ...LEGACY_COOKIES_TO_CLEAR,
    ]) {
      store.set(name, "", { path: "/", maxAge: 0 });
    }
  } catch {
    /* ignore */
  }
  revalidatePath("/", "layout");
  redirect("/");
}
