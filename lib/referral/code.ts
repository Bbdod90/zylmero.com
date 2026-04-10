import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export function randomReferralCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

/** Zorgt voor een unieke referral_code op het bedrijf (idempotent). */
export async function ensureCompanyReferralCode(
  supabase: SupabaseClient,
  companyId: string,
): Promise<string | null> {
  const { data: row } = await supabase
    .from("companies")
    .select("referral_code")
    .eq("id", companyId)
    .maybeSingle();
  const existing = row?.referral_code as string | undefined;
  if (existing) return existing;

  for (let i = 0; i < 24; i++) {
    const code = randomReferralCode();
    const { data: taken } = await supabase
      .from("companies")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();
    if (taken) continue;
    const { error } = await supabase
      .from("companies")
      .update({ referral_code: code })
      .eq("id", companyId)
      .is("referral_code", null);
    if (!error) return code;
  }
  return null;
}
