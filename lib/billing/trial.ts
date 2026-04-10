import type { Company } from "@/lib/types";
import { DEMO_COMPANY_ID } from "@/lib/demo/company";

/** Demo / preview sessions always pass the gate */
export function isDemoCompanyId(companyId: string): boolean {
  return companyId === DEMO_COMPANY_ID;
}

/**
 * Full product access: active trial, or paid Stripe subscription in good standing.
 * `past_due` still allows access so customers can fix payment without instant lockout.
 */
export function hasSubscriptionAccess(company: Company): boolean {
  if (!company.is_active) return false;
  if (isDemoCompanyId(company.id)) return true;

  if (company.plan === "trial") {
    if (!company.trial_ends_at) return true;
    return new Date(company.trial_ends_at).getTime() >= Date.now();
  }

  const s = company.subscription_status;
  return s === "active" || s === "trialing" || s === "past_due";
}

export function isTrialExpired(company: Company): boolean {
  if (company.plan !== "trial") return false;
  if (!company.trial_ends_at) return false;
  return new Date(company.trial_ends_at).getTime() < Date.now();
}

export function trialDaysRemaining(company: Company): number | null {
  if (company.plan !== "trial" || !company.trial_ends_at) return null;
  const ms = new Date(company.trial_ends_at).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}
