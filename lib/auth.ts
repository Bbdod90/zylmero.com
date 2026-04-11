import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getDemoCompany } from "@/lib/demo/company";
import { isDemoMode } from "@/lib/env";
import type { Company, CompanyRole } from "@/lib/types";
import { mapCompanyRow } from "@/lib/auth/map-company";
import { ANONYMOUS_DEMO_USER_ID } from "@/lib/auth/constants";
import { COOKIE_ANON_DEMO } from "@/lib/app-cookies";
import { BRAND_DEMO_PREVIEW_EMAIL } from "@/lib/brand";

export type AuthState =
  | { user: null; company: null; companyRole: null }
  | { user: { id: string; email?: string }; company: null; companyRole: null }
  | {
      user: { id: string; email?: string };
      company: Company;
      companyRole: CompanyRole;
    };

export const getAuth = cache(async (): Promise<AuthState> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    try {
      if (
        cookies().get(COOKIE_ANON_DEMO)?.value === "1" ||
        cookies().get("cf_anon_demo")?.value === "1"
      ) {
        return {
          user: {
            id: ANONYMOUS_DEMO_USER_ID,
            email: BRAND_DEMO_PREVIEW_EMAIL,
          },
          company: getDemoCompany(),
          companyRole: "owner",
        };
      }
    } catch {
      /* cookies unavailable */
    }
    return { user: null, company: null, companyRole: null };
  }

  if (isDemoMode()) {
    return {
      user: { id: user.id, email: user.email ?? undefined },
      company: getDemoCompany(),
      companyRole: "owner",
    };
  }

  const { data: owned } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (owned) {
    return {
      user: { id: user.id, email: user.email ?? undefined },
      company: mapCompanyRow(owned as Record<string, unknown>),
      companyRole: "owner",
    };
  }

  const { data: membership } = await supabase
    .from("company_members")
    .select("role, companies(*)")
    .eq("user_id", user.id)
    .maybeSingle();

  const rawComp = membership?.companies as unknown;
  const comp =
    rawComp && !Array.isArray(rawComp)
      ? (rawComp as Record<string, unknown>)
      : Array.isArray(rawComp) && rawComp[0]
        ? (rawComp[0] as Record<string, unknown>)
        : null;
  if (comp && membership?.role) {
    const companyRole: CompanyRole =
      membership.role === "admin" ? "admin" : "medewerker";
    return {
      user: { id: user.id, email: user.email ?? undefined },
      company: mapCompanyRow(comp),
      companyRole,
    };
  }

  return {
    user: { id: user.id, email: user.email ?? undefined },
    company: null,
    companyRole: null,
  };
});

export async function requireUser() {
  const auth = await getAuth();
  if (!auth.user) {
    redirect("/login");
  }
  return auth.user;
}

export async function requireCompany() {
  const auth = await getAuth();
  if (!auth.user) {
    redirect("/login");
  }
  if (!auth.company || !auth.companyRole) {
    redirect("/dashboard/onboarding");
  }
  return {
    user: auth.user,
    company: auth.company,
    companyRole: auth.companyRole,
  };
}

export async function requireGuestForOnboarding() {
  const auth = await getAuth();
  if (!auth.user) {
    redirect("/login");
  }
  if (auth.company?.onboarding_completed) {
    redirect("/dashboard");
  }
}
