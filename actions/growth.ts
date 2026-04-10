"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@/lib/auth";
import { isDemoCompanyId } from "@/lib/billing/trial";
import { resolveSiteUrl } from "@/lib/site-url";

export type GrowthActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function setSalesModeCookie(enabled: boolean): Promise<GrowthActionResult> {
  const auth = await getAuth();
  if (!auth.user || !auth.company || isDemoCompanyId(auth.company.id)) {
    return { ok: false, error: "Inloggen vereist." };
  }
  cookies().set("cf_sales_mode", enabled ? "1" : "0", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/growth");
  return { ok: true };
}

/**
 * Invites a client by email (Supabase sends magic link).
 * Requires SUPABASE_SERVICE_ROLE_KEY in server env.
 */
export async function inviteClientAccount(input: {
  email: string;
  businessName: string;
}): Promise<GrowthActionResult> {
  const auth = await getAuth();
  if (!auth.user || !auth.company || isDemoCompanyId(auth.company.id)) {
    return { ok: false, error: "Inloggen vereist." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let siteUrl: string;
  try {
    siteUrl = resolveSiteUrl();
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Site-URL ontbreekt (NEXT_PUBLIC_SITE_URL).",
    };
  }

  if (!url || !serviceKey) {
    return {
      ok: false,
      error:
        "Voeg SUPABASE_SERVICE_ROLE_KEY toe aan je serveromgeving om uitnodigingen te versturen.",
    };
  }

  const email = input.email.trim().toLowerCase();
  const businessName = input.businessName.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Geldig e-mailadres vereist." };
  }
  if (!businessName) {
    return { ok: false, error: "Bedrijfsnaam vereist." };
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      invited_by_company: auth.company.id,
      suggested_business_name: businessName,
    },
    redirectTo: `${siteUrl}/auth/callback`,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
