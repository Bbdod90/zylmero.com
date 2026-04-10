"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { generateQuoteDraft } from "@/actions/ai";
import type { ActionResult } from "@/actions/ai";

function blocked(): ActionResult<never> {
  return { ok: false, error: "Niet beschikbaar in demo-modus." };
}

export async function markLeadWon(
  leadId: string,
): Promise<ActionResult<{ status: "won" }>> {
  if (isDemoMode()) return blocked();
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: "won" })
    .eq("id", leadId)
    .eq("company_id", auth.company.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  return { ok: true, data: { status: "won" } };
}

export async function convertLeadToAppointment(
  leadId: string,
): Promise<ActionResult<{ appointmentId: string }>> {
  if (isDemoMode()) return blocked();
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const supabase = await createClient();

  const starts = new Date();
  starts.setDate(starts.getDate() + 1);
  starts.setHours(9, 0, 0, 0);
  const ends = new Date(starts.getTime() + 60 * 60 * 1000);

  const { data: appt, error: ae } = await supabase
    .from("appointments")
    .insert({
      company_id: auth.company.id,
      lead_id: leadId,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      status: "scheduled",
      notes: "Aangemaakt via snelle actie",
    })
    .select("id")
    .single();

  if (ae || !appt) return { ok: false, error: ae?.message || "Opslaan mislukt" };

  const { error: le } = await supabase
    .from("leads")
    .update({ status: "appointment_booked" })
    .eq("id", leadId)
    .eq("company_id", auth.company.id);
  if (le) return { ok: false, error: le.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath("/dashboard/appointments");
  return { ok: true, data: { appointmentId: appt.id as string } };
}

export async function generateQuoteDraftAndSend(
  leadId: string,
): Promise<ActionResult<{ quoteId: string }>> {
  if (isDemoMode()) return blocked();
  const draft = await generateQuoteDraft(leadId);
  if (!draft.ok) return draft;

  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({ status: "sent", updated_at: new Date().toISOString() })
    .eq("id", draft.data.quoteId)
    .eq("company_id", auth.company.id);

  if (error) return { ok: false, error: error.message };

  const { error: le } = await supabase
    .from("leads")
    .update({ status: "quote_sent" })
    .eq("id", leadId)
    .eq("company_id", auth.company.id);
  if (le) return { ok: false, error: le.message };

  revalidatePath("/dashboard/quotes");
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  return { ok: true, data: { quoteId: draft.data.quoteId } };
}
