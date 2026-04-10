"use server";

import { createClient } from "@/lib/supabase/server";

export type WaitlistState = { ok?: boolean; error?: string };

export async function joinWaitlistAction(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Vul een geldig e-mailadres in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({
    email,
    source: "landing",
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    return { error: error.message };
  }
  return { ok: true };
}
