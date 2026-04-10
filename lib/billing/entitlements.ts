import type { SupabaseClient } from "@supabase/supabase-js";
import type { BillingPlanId, Company } from "@/lib/types";
import { isDemoCompanyId } from "@/lib/billing/trial";
import { isDemoMode } from "@/lib/env";

/** Effective tier for limits (trial maps to growth for evaluation). */
export function effectivePlanTier(company: Company): Exclude<BillingPlanId, "trial"> {
  if (company.plan === "trial") return "growth";
  return company.plan;
}

const LEAD_CAPS: Record<Exclude<BillingPlanId, "trial">, number> = {
  starter: 100,
  growth: 500,
  pro: 1_000_000,
};

export function maxLeadsPerMonth(company: Company): number {
  if (isDemoMode() || isDemoCompanyId(company.id)) return LEAD_CAPS.pro;
  return LEAD_CAPS[effectivePlanTier(company)];
}

export function canUseQuotes(company: Company): boolean {
  if (isDemoMode() || isDemoCompanyId(company.id)) return true;
  return effectivePlanTier(company) !== "starter";
}

export function canUseAutomations(company: Company): boolean {
  if (isDemoMode() || isDemoCompanyId(company.id)) return true;
  return effectivePlanTier(company) !== "starter";
}

/** Pro + demo: full AI (progression, smart follow-up depth). */
export function canUseFullAi(company: Company): boolean {
  if (isDemoMode() || isDemoCompanyId(company.id)) return true;
  return effectivePlanTier(company) === "pro";
}

export async function countLeadsThisMonth(
  supabase: SupabaseClient,
  companyId: string,
): Promise<number> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .gte("created_at", start.toISOString());
  if (error) return 0;
  return count ?? 0;
}

export async function isLeadCapReached(
  supabase: SupabaseClient,
  company: Company,
): Promise<boolean> {
  const cap = maxLeadsPerMonth(company);
  const n = await countLeadsThisMonth(supabase, company.id);
  return n >= cap;
}

export function entitlementUpgradeMessage(feature: "quotes" | "automations" | "full_ai" | "leads"): string {
  switch (feature) {
    case "quotes":
      return "Offertes zitten in Growth en Pro. Upgrade om offertekladen te ontgrendelen.";
    case "automations":
      return "Automatiseringen zitten in Growth en Pro. Upgrade om opvolgingsflows te ontgrendelen.";
    case "full_ai":
      return "De volledige AI-closer is een Pro-functie. Upgrade voor slimme vervolgstappen en opvolging.";
    case "leads":
      return "Je hebt je maandelijkse leadlimiet bereikt. Upgrade voor meer capaciteit.";
    default:
      return "Upgrade je abonnement om dit te gebruiken.";
  }
}
