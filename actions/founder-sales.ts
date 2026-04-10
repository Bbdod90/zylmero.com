"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isFounderUser } from "@/lib/founder/access";
import type { FounderSalesChannel, FounderSalesStatus } from "@/lib/types";

const channelSchema = z.enum(["instagram", "whatsapp", "email"]);
const statusSchema = z.enum([
  "contacted",
  "replied",
  "demo_sent",
  "interested",
  "closed",
  "lost",
]);

async function requireFounder() {
  const auth = await getAuth();
  if (!auth.user) return { ok: false as const, error: "Geen toegang" };
  const supabase = await createClient();
  const ok = await isFounderUser(supabase, auth.user.id);
  if (!ok) return { ok: false as const, error: "Geen rechten" };
  return { ok: true as const, userId: auth.user.id, supabase };
}

export async function createFounderProspectAction(formData: FormData) {
  const gate = await requireFounder();
  if (!gate.ok) return { ok: false, error: gate.error };

  const rawEmail = (formData.get("contact_email") as string | null)?.trim() || null;
  if (rawEmail && !z.string().email().safeParse(rawEmail).success) {
    return { ok: false, error: "Ongeldig e-mailadres" };
  }

  const parsed = z
    .object({
      business_name: z.string().min(1).max(500),
      contact_name: z.string().max(200).optional().nullable(),
      channel: channelSchema,
      status: statusSchema.optional(),
      notes: z.string().max(8000).optional().nullable(),
      instagram_handle: z.string().max(200).optional().nullable(),
      whatsapp_e164: z.string().max(32).optional().nullable(),
      next_follow_up_at: z.string().optional().nullable(),
    })
    .safeParse({
      business_name: formData.get("business_name"),
      contact_name: formData.get("contact_name") || null,
      channel: formData.get("channel"),
      status: formData.get("status") || "contacted",
      notes: formData.get("notes") || null,
      instagram_handle: formData.get("instagram_handle") || null,
      whatsapp_e164: formData.get("whatsapp_e164") || null,
      next_follow_up_at: formData.get("next_follow_up_at") || null,
    });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const v = { ...parsed.data, contact_email: rawEmail };
  const now = new Date().toISOString();
  const payload = {
    business_name: v.business_name,
    contact_name: v.contact_name || null,
    channel: v.channel,
    status: (v.status ?? "contacted") as FounderSalesStatus,
    notes: v.notes || null,
    instagram_handle: v.instagram_handle || null,
    contact_email: v.contact_email || null,
    whatsapp_e164: v.whatsapp_e164 || null,
    last_outbound_at: now,
    last_contact_at: now,
    next_follow_up_at: v.next_follow_up_at || null,
    messages_sent_count: 1,
  };

  const { error } = await gate.supabase
    .from("founder_sales_prospects")
    .insert(payload);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function updateFounderProspectAction(input: {
  id: string;
  business_name?: string;
  contact_name?: string | null;
  channel?: FounderSalesChannel;
  status?: FounderSalesStatus;
  notes?: string | null;
  next_follow_up_at?: string | null;
  instagram_handle?: string | null;
  contact_email?: string | null;
  whatsapp_e164?: string | null;
}) {
  const gate = await requireFounder();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { id, ...rest } = input;
  const patch: Record<string, unknown> = {
    last_contact_at: new Date().toISOString(),
  };
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) patch[k] = v;
  }
  const { error } = await gate.supabase
    .from("founder_sales_prospects")
    .update(patch)
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function sendFollowUpFounderAction(prospectId: string) {
  const gate = await requireFounder();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { data: row } = await gate.supabase
    .from("founder_sales_prospects")
    .select("messages_sent_count")
    .eq("id", prospectId)
    .single();

  const next = (row?.messages_sent_count as number | undefined ?? 0) + 1;
  const now = new Date().toISOString();

  const { error } = await gate.supabase
    .from("founder_sales_prospects")
    .update({
      messages_sent_count: next,
      last_outbound_at: now,
      last_contact_at: now,
    })
    .eq("id", prospectId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function markDemoSentFounderAction(prospectId: string) {
  const gate = await requireFounder();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { data: row } = await gate.supabase
    .from("founder_sales_prospects")
    .select("demos_sent_count")
    .eq("id", prospectId)
    .single();

  const next = (row?.demos_sent_count as number | undefined ?? 0) + 1;
  const now = new Date().toISOString();

  const { error } = await gate.supabase
    .from("founder_sales_prospects")
    .update({
      status: "demo_sent",
      demos_sent_count: next,
      last_contact_at: now,
    })
    .eq("id", prospectId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function markClosedFounderAction(prospectId: string) {
  const gate = await requireFounder();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { error } = await gate.supabase
    .from("founder_sales_prospects")
    .update({
      status: "closed",
      last_contact_at: new Date().toISOString(),
    })
    .eq("id", prospectId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function markLostFounderAction(prospectId: string) {
  const gate = await requireFounder();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { error } = await gate.supabase
    .from("founder_sales_prospects")
    .update({
      status: "lost",
      last_contact_at: new Date().toISOString(),
    })
    .eq("id", prospectId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function recordReplyFounderAction(prospectId: string) {
  const gate = await requireFounder();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { data: row } = await gate.supabase
    .from("founder_sales_prospects")
    .select("replies_received_count, first_reply_at")
    .eq("id", prospectId)
    .single();

  const now = new Date().toISOString();
  const next = (row?.replies_received_count as number | undefined ?? 0) + 1;
  const existingFirst = row?.first_reply_at as string | null | undefined;

  const { error } = await gate.supabase
    .from("founder_sales_prospects")
    .update({
      status: "replied",
      replies_received_count: next,
      first_reply_at: existingFirst ?? now,
      last_contact_at: now,
    })
    .eq("id", prospectId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function incrementDailyContactGoalAction() {
  const gate = await requireFounder();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { data: s } = await gate.supabase
    .from("founder_sales_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (!s) return { ok: false, error: "Instellingen ontbreken" };

  const todayUtc = new Date().toISOString().slice(0, 10);
  let completed = Number(s.contacts_completed_today ?? 0);
  let goalDate = String(s.goal_date ?? "").slice(0, 10);
  if (goalDate !== todayUtc) {
    completed = 0;
    goalDate = todayUtc;
  }

  const { error } = await gate.supabase
    .from("founder_sales_settings")
    .update({
      contacts_completed_today: completed + 1,
      goal_date: goalDate,
    })
    .eq("id", s.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sales");
  return { ok: true as const };
}

export async function updateFounderNotesAction(prospectId: string, notes: string) {
  const gate = await requireFounder();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { error } = await gate.supabase
    .from("founder_sales_prospects")
    .update({ notes: notes.slice(0, 8000) })
    .eq("id", prospectId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sales");
  return { ok: true as const };
}
