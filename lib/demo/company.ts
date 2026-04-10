import type { Company } from "@/lib/types";
import { getNicheConfig } from "@/lib/niches";
import { getDemoNicheId } from "@/lib/demo/niche-context";
import { DEMO_GARAGE_BRAND } from "@/lib/demo/demo-brand";

/** Stable id for demo UI; no DB row required when demo mode uses static data only. */
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export const DEMO_COMPANY_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

export const DEMO_COMPANY: Company = {
  id: DEMO_COMPANY_ID,
  name: "CloserFlow Demo",
  owner_user_id: DEMO_USER_ID,
  niche: "garage",
  onboarding_completed: true,
  contact_email: "demo@closerflow.local",
  contact_phone: "+31 40 000 0000",
  trial_starts_at: null,
  trial_ends_at: null,
  plan: "trial",
  is_active: true,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  subscription_status: "active",
  current_period_end: null,
  value_moment_completed_at: new Date().toISOString(),
  referral_code: "DEMO",
  widget_embed_token: "00000000-0000-4000-8000-000000000001",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/** Demo-bedrijf met branche uit cookie (SSR). */
export function getDemoCompany(): Company {
  const id = getDemoNicheId();
  if (id === "garage") {
    return {
      ...DEMO_COMPANY,
      niche: id,
      name: DEMO_GARAGE_BRAND.legalName,
      contact_email: DEMO_GARAGE_BRAND.email,
      contact_phone: DEMO_GARAGE_BRAND.phoneDisplay,
    };
  }
  const niche = getNicheConfig(id);
  return {
    ...DEMO_COMPANY,
    niche: id,
    name: `${niche.label} · Demo`,
  };
}
