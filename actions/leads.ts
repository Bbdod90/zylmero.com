"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { hasSubscriptionAccess } from "@/lib/billing/trial";
import { PAYWALL_AI_LEADS } from "@/lib/billing/paywall";
import type { ActionResult } from "@/actions/ai";
import type { LeadStatus } from "@/lib/types";
import { logTeamActivity } from "@/lib/team-activity";

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "active",
  "quote_sent",
  "appointment_booked",
  "won",
  "lost",
];

function isLeadStatus(s: string): s is LeadStatus {
  return LEAD_STATUSES.includes(s as LeadStatus);
}

export async function updateLeadNotes(
  leadId: string,
  notes: string,
): Promise<ActionResult<{ saved: true }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ notes })
    .eq("id", leadId)
    .eq("company_id", auth.company.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  return { ok: true, data: { saved: true } };
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
): Promise<ActionResult<{ status: LeadStatus }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  if (!isLeadStatus(status)) {
    return { ok: false, error: "Ongeldige status." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId)
    .eq("company_id", auth.company.id);
  if (error) return { ok: false, error: error.message };
  await logTeamActivity(supabase, {
    company_id: auth.company.id,
    user_id: auth.user.id,
    event_type: "lead_status_changed",
    entity_type: "lead",
    entity_id: leadId,
    meta: { status },
  });
  if (status === "won") {
    await logTeamActivity(supabase, {
      company_id: auth.company.id,
      user_id: auth.user.id,
      event_type: "deal_won",
      entity_type: "lead",
      entity_id: leadId,
      meta: {},
    });
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/pipeline");
  return { ok: true, data: { status } };
}

export async function updateLeadCustomFields(
  leadId: string,
  custom_fields: Record<string, string>,
): Promise<ActionResult<{ saved: true }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(custom_fields)) {
    const key = k.trim();
    if (!key) continue;
    cleaned[key] = String(v).trim();
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ custom_fields: cleaned })
    .eq("id", leadId)
    .eq("company_id", auth.company.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath("/dashboard/inbox");
  return { ok: true, data: { saved: true } };
}

export async function updateLeadProfile(
  leadId: string,
  input: {
    full_name: string;
    email?: string | null;
    phone?: string | null;
    source?: string | null;
  },
): Promise<ActionResult<{ saved: true }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  const full_name = input.full_name.trim();
  if (!full_name) {
    return { ok: false, error: "Naam is verplicht." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({
      full_name,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      source: input.source?.trim() || null,
    })
    .eq("id", leadId)
    .eq("company_id", auth.company.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  return { ok: true, data: { saved: true } };
}

export async function createLead(input: {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
}): Promise<ActionResult<{ leadId: string }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  if (!hasSubscriptionAccess(auth.company)) {
    return { ok: false, error: PAYWALL_AI_LEADS };
  }
  const full_name = input.full_name.trim();
  if (!full_name) {
    return { ok: false, error: "Naam is verplicht." };
  }
  const supabase = await createClient();
  const { data: lead, error: le } = await supabase
    .from("leads")
    .insert({
      company_id: auth.company.id,
      full_name,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      source: input.source?.trim() || null,
      status: "new",
    })
    .select("id")
    .single();
  if (le || !lead) {
    return { ok: false, error: le?.message || "Lead kon niet worden aangemaakt." };
  }

  const { error: ce } = await supabase.from("conversations").insert({
    company_id: auth.company.id,
    lead_id: lead.id,
    channel: "inbox",
  });
  if (ce) {
    return { ok: false, error: ce.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/inbox");
  return { ok: true, data: { leadId: lead.id as string } };
}
