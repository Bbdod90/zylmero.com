"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ensureCompanyReferralCode } from "@/lib/referral/code";

export async function ensureReferralCodeAction(): Promise<{
  ok: boolean;
  code?: string;
  error?: string;
}> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const supabase = await createClient();
  const code = await ensureCompanyReferralCode(supabase, auth.company.id);
  if (!code) {
    return { ok: false, error: "Code kon niet worden aangemaakt." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/growth");
  return { ok: true, code };
}
