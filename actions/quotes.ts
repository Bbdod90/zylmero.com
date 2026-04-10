"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import type { ActionResult } from "@/actions/ai";
import type { QuoteStatus } from "@/lib/types";

const VALID: QuoteStatus[] = ["draft", "sent", "accepted", "declined"];

function isQuoteStatus(s: string): s is QuoteStatus {
  return VALID.includes(s as QuoteStatus);
}

export async function updateQuoteStatus(
  quoteId: string,
  status: QuoteStatus,
): Promise<ActionResult<{ status: QuoteStatus }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  if (!isQuoteStatus(status)) {
    return { ok: false, error: "Ongeldige status." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId)
    .eq("company_id", auth.company.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/quotes");
  revalidatePath(`/dashboard/quotes/${quoteId}`);
  return { ok: true, data: { status } };
}
