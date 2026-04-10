"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationRead(id: string): Promise<{ ok?: boolean; error?: string }> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return { error: "Niet geautoriseerd" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", auth.company.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<{ ok?: boolean; error?: string }> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return { error: "Niet geautoriseerd" };
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("company_id", auth.company.id)
    .is("read_at", null);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}
