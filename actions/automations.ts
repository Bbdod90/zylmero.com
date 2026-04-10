"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  canUseAutomations,
  entitlementUpgradeMessage,
} from "@/lib/billing/entitlements";

export type AutoState = { ok?: boolean; error?: string };

export async function toggleAutomation(
  id: string,
  enabled: boolean,
): Promise<AutoState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return { error: "Niet ingelogd." };
  if (enabled && !canUseAutomations(auth.company)) {
    return { error: entitlementUpgradeMessage("automations") };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("automations")
    .update({ enabled })
    .eq("id", id)
    .eq("company_id", auth.company.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/automations");
  return { ok: true };
}

export async function updateAutomationAction(
  _prev: AutoState,
  formData: FormData,
): Promise<AutoState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return { error: "Niet ingelogd." };
  if (!canUseAutomations(auth.company)) {
    return { error: entitlementUpgradeMessage("automations") };
  }
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const template_text = String(formData.get("template_text") || "").trim();
  const delay_minutes = Number(formData.get("delay_minutes") || 0);

  if (!id || !name || !template_text) {
    return { error: "Velden ontbreken." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("automations")
    .update({ name, template_text, delay_minutes })
    .eq("id", id)
    .eq("company_id", auth.company.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/automations");
  return { ok: true };
}

export async function createDefaultAutomations(): Promise<AutoState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return { error: "Niet ingelogd." };
  if (!canUseAutomations(auth.company)) {
    return { error: entitlementUpgradeMessage("automations") };
  }
  const supabase = await createClient();
  const { count } = await supabase
    .from("automations")
    .select("*", { count: "exact", head: true })
    .eq("company_id", auth.company.id);
  if (count && count > 0) return { ok: true };

  const { error } = await supabase.from("automations").insert([
    {
      company_id: auth.company.id,
      name: "Snelle opvolging",
      trigger_type: "lead_created",
      delay_minutes: 10,
      template_text:
        "Hi {{name}}, bedankt voor je bericht. Kunnen we vandaag nog 10 minuten afstemmen over je voertuig?",
      enabled: true,
    },
    {
      company_id: auth.company.id,
      name: "Offerte reminder",
      trigger_type: "quote_sent",
      delay_minutes: 1440,
      template_text:
        "Hi {{name}}, even checken: heb je de offerte kunnen bekijken? Ik help je graag verder.",
      enabled: true,
    },
    {
      company_id: auth.company.id,
      name: "Laatste opvolging",
      trigger_type: "no_reply",
      delay_minutes: 4320,
      template_text:
        "Hi {{name}}, ik sluit je dossier bij geen reactie. Zal ik je over 2 weken een seintje geven?",
      enabled: true,
    },
  ]);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/automations");
  return { ok: true };
}
