"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import type { ActionResult } from "@/actions/ai";
import { insertNotificationIfNew } from "@/lib/notifications/create";

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

function extractGesprekIdFromNotes(notes: string | null | undefined): string | null {
  const text = (notes || "").trim();
  if (!text) return null;
  const m = text.match(/\(([a-f0-9-]{36})\)/i);
  return m?.[1] || null;
}

function formatNlDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export async function reviewAppointmentRequest(input: {
  appointmentId: string;
  decision: "confirm" | "alternative";
  alternativeStartsAt?: string | null;
  noteToCustomer?: string | null;
}): Promise<ActionResult<{ appointmentId: string; status: string }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }

  const supabase = await createClient();
  const { data: appt, error: apptErr } = await supabase
    .from("appointments")
    .select("id, company_id, lead_id, starts_at, ends_at, status, notes")
    .eq("id", input.appointmentId)
    .eq("company_id", auth.company.id)
    .maybeSingle();
  if (apptErr || !appt) {
    return { ok: false, error: "Afspraak niet gevonden." };
  }

  const gesprekId = extractGesprekIdFromNotes(appt.notes as string | null);
  let nextStatus = "confirmed";
  let startsAt = appt.starts_at as string;
  let endsAt = appt.ends_at as string | null;
  let customerText = "";
  const ownerNote = (input.noteToCustomer || "").trim();

  if (input.decision === "confirm") {
    nextStatus = "confirmed";
    customerText = `Top, je afspraak is bevestigd voor ${formatNlDateTime(startsAt)}.${ownerNote ? ` ${ownerNote}` : ""}`;
  } else {
    const altRaw = (input.alternativeStartsAt || "").trim();
    const alt = new Date(altRaw);
    if (Number.isNaN(alt.getTime())) {
      return { ok: false, error: "Geef een geldige alternatieve datum/tijd." };
    }
    startsAt = alt.toISOString();
    endsAt = new Date(alt.getTime() + 60 * 60 * 1000).toISOString();
    nextStatus = "planned";
    customerText = `Het gevraagde moment lukt niet. Wel mogelijk: ${formatNlDateTime(startsAt)}. Laat weten of dit past.${ownerNote ? ` ${ownerNote}` : ""}`;
  }

  const { error: updErr } = await supabase
    .from("appointments")
    .update({
      status: nextStatus,
      starts_at: startsAt,
      ends_at: endsAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.appointmentId)
    .eq("company_id", auth.company.id);
  if (updErr) return { ok: false, error: updErr.message };

  if (gesprekId) {
    await supabase.from("berichten").insert({
      gesprek_id: gesprekId,
      rol: "bot",
      inhoud: customerText,
    });
  }

  await insertNotificationIfNew(supabase, {
    company_id: auth.company.id,
    type: "new_lead",
    title:
      input.decision === "confirm"
        ? "Afspraak bevestigd"
        : "Alternatief voorstel verstuurd",
    body:
      input.decision === "confirm"
        ? `Klant is bevestigd voor ${formatNlDateTime(startsAt)}`
        : `Alternatief gestuurd: ${formatNlDateTime(startsAt)}`,
    dedupe_key: `appointment-review:${input.appointmentId}:${nextStatus}:${startsAt}`,
    metadata: {
      appointment_id: input.appointmentId,
      decision: input.decision,
      starts_at: startsAt,
      gesprek_id: gesprekId,
    },
  });

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard");
  return { ok: true, data: { appointmentId: input.appointmentId, status: nextStatus } };
}

export async function createAppointment(input: {
  lead_id?: string | null;
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

  const leadId = input.lead_id?.trim() || null;

  const supabase = await createClient();
  if (leadId) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("id", leadId)
      .eq("company_id", auth.company.id)
      .maybeSingle();
    if (!lead) {
      return { ok: false, error: "Klant niet gevonden." };
    }
  }

  const { data: row, error } = await supabase
    .from("appointments")
    .insert({
      company_id: auth.company.id,
      lead_id: leadId,
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
  if (leadId) {
    revalidatePath(`/dashboard/leads/${leadId}`);
  }
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
