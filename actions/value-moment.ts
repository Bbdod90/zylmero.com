"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function completeValueMomentAction(): Promise<void> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({ value_moment_completed_at: new Date().toISOString() })
    .eq("id", auth.company.id)
    .eq("owner_user_id", auth.user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard?welcome=1");
}
