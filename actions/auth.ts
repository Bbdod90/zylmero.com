"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/i18n/auth-errors";
import { scheduleMarketingDrip } from "@/lib/marketing/drip";
import { resolveSiteUrl } from "@/lib/site-url";

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
    return {
      error: "Ongeldige gegevens. Controleer je e-mail en wachtwoord.",
    };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password || password.length < 8) {
    return { error: "E-mail en wachtwoord (min. 8 tekens) zijn verplicht." };
  }

  const base = resolveSiteUrl();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${base}/auth/callback`,
    },
  });
  if (error) {
    return { error: mapAuthError(error.message) };
  }

  const refCookie = String(formData.get("referral_code") || "").trim();
  if (refCookie) {
    try {
      cookies().set("cf_referral_code", refCookie.toUpperCase().slice(0, 12), {
        path: "/",
        maxAge: 60 * 60 * 24 * 90,
        sameSite: "lax",
      });
    } catch {
      /* ignore */
    }
  }

  if (!data.session) {
    return { success: true };
  }

  try {
    await scheduleMarketingDrip({ email, source: "signup" });
  } catch {
    /* niet blokkerend */
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/onboarding");
}

export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    return { error: "Vul je e-mailadres in." };
  }

  const base = resolveSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${base}/reset-password`,
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
    cookies().set("cf_anon_demo", "", { path: "/", maxAge: 0 });
    cookies().set("closerflow_demo", "", { path: "/", maxAge: 0 });
    cookies().set("cf_sales_mode", "", { path: "/", maxAge: 0 });
  } catch {
    /* ignore */
  }
  revalidatePath("/", "layout");
  redirect("/");
}
