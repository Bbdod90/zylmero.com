"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import type { ActionResult } from "@/actions/ai";

const VALID = [
  "scheduled",
  "planned",
  "confirmed",
  "completed",
  "done",
  "cancelled",
  "canceled",
] as const;

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
): Promise<ActionResult<{ status: string }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const s = status.trim().toLowerCase();
  if (!VALID.includes(s as (typeof VALID)[number])) {
    return { ok: false, error: "Ongeldige status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({
      status: s,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .eq("company_id", auth.company.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  return { ok: true, data: { status: s } };
}

export async function createAppointment(input: {
  lead_id: string;
  starts_at: string;
  ends_at?: string | null;
  notes?: string | null;
}): Promise<ActionResult<{ appointmentId: string }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const starts = new Date(input.starts_at);
  if (Number.isNaN(starts.getTime())) {
    return { ok: false, error: "Ongeldige starttijd." };
  }
  let ends: Date;
  if (input.ends_at) {
    ends = new Date(input.ends_at);
    if (Number.isNaN(ends.getTime())) {
      return { ok: false, error: "Ongeldige eindtijd." };
    }
  } else {
    ends = new Date(starts.getTime() + 60 * 60 * 1000);
  }

  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("id", input.lead_id)
    .eq("company_id", auth.company.id)
    .maybeSingle();
  if (!lead) {
    return { ok: false, error: "Lead niet gevonden." };
  }

  const { data: row, error } = await supabase
    .from("appointments")
    .insert({
      company_id: auth.company.id,
      lead_id: input.lead_id,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      status: "scheduled",
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !row) {
    return { ok: false, error: error?.message || "Afspraak kon niet worden aangemaakt." };
  }

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${input.lead_id}`);
  revalidatePath("/dashboard");
  return { ok: true, data: { appointmentId: row.id as string } };
}

export async function updateAppointmentDetails(input: {
  appointmentId: string;
  starts_at: string;
  ends_at?: string | null;
  notes?: string | null;
}): Promise<ActionResult<{ appointmentId: string }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const starts = new Date(input.starts_at);
  if (Number.isNaN(starts.getTime())) {
    return { ok: false, error: "Ongeldige starttijd." };
  }
  let ends: Date | null = null;
  if (input.ends_at) {
    ends = new Date(input.ends_at);
    if (Number.isNaN(ends.getTime())) {
      return { ok: false, error: "Ongeldige eindtijd." };
    }
  }

  const supabase = await createClient();
  const { data: existing, error: fetchErr } = await supabase
    .from("appointments")
    .select("id, lead_id")
    .eq("id", input.appointmentId)
    .eq("company_id", auth.company.id)
    .maybeSingle();
  if (fetchErr || !existing) {
    return { ok: false, error: "Afspraak niet gevonden." };
  }
  const leadId = (existing as { lead_id: string | null }).lead_id;

  const endsIso =
    ends != null
      ? ends.toISOString()
      : new Date(starts.getTime() + 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("appointments")
    .update({
      starts_at: starts.toISOString(),
      ends_at: endsIso,
      notes: input.notes?.trim() ? input.notes.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.appointmentId)
    .eq("company_id", auth.company.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  if (leadId) {
    revalidatePath(`/dashboard/leads/${leadId}`);
  }
  return { ok: true, data: { appointmentId: input.appointmentId } };
}

export async function deleteAppointment(
  appointmentId: string,
): Promise<ActionResult<{ deleted: true }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const supabase = await createClient();
  const { data: row, error: fetchErr } = await supabase
    .from("appointments")
    .select("id, lead_id")
    .eq("id", appointmentId)
    .eq("company_id", auth.company.id)
    .maybeSingle();
  if (fetchErr || !row) {
    return { ok: false, error: "Afspraak niet gevonden." };
  }
  const leadId = (row as { lead_id: string | null }).lead_id;
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId)
    .eq("company_id", auth.company.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  if (leadId) {
    revalidatePath(`/dashboard/leads/${leadId}`);
  }
  return { ok: true, data: { deleted: true } };
}
