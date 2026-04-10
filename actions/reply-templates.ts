"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ReplyTemplate } from "@/lib/types";

export type TemplateState = { ok?: boolean; error?: string };

export async function listReplyTemplates(): Promise<ReplyTemplate[]> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reply_templates")
    .select("*")
    .eq("company_id", auth.company.id)
    .order("updated_at", { ascending: false });
  if (error) return [];
  return (data || []) as ReplyTemplate[];
}

export async function createReplyTemplate(
  _prev: TemplateState,
  formData: FormData,
): Promise<TemplateState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return { error: "Niet ingelogd." };
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const shortcut = String(formData.get("shortcut") || "").trim() || null;
  if (!title || !body) return { error: "Titel en inhoud zijn verplicht." };
  const supabase = await createClient();
  const { error } = await supabase.from("reply_templates").insert({
    company_id: auth.company.id,
    title,
    body,
    shortcut,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/templates");
  return { ok: true };
}

export async function deleteReplyTemplate(id: string): Promise<TemplateState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return { error: "Niet ingelogd." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("reply_templates")
    .delete()
    .eq("id", id)
    .eq("company_id", auth.company.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/templates");
  return { ok: true };
}
