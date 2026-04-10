"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scheduleMarketingDrip } from "@/lib/marketing/drip";

export type MarketingLeadState = { ok?: boolean; error?: string };

function friendlyInsertError(
  error: { code?: string; message: string } | null,
): string {
  if (!error) return "Opslaan mislukt. Probeer het later opnieuw.";
  const msg = error.message || "";
  if (
    error.code === "42P01" ||
    msg.includes("Could not find the table") ||
    msg.includes("does not exist")
  ) {
    return "Database nog niet bijgewerkt: voer de Supabase-migraties uit (zie README), daarna opnieuw proberen.";
  }
  if (msg.includes("row-level security") || error.code === "42501") {
    return "Opslaan geblokkeerd door rechten. Controleer of SUPABASE_SERVICE_ROLE_KEY in .env.local staat voor dit project.";
  }
  return "Opslaan mislukt. Probeer het later opnieuw.";
}

async function insertMarketingLeadRow(row: {
  full_name: string;
  company_name: string;
  email: string | null;
  phone: string | null;
  source: string;
}) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    try {
      const admin = createAdminClient();
      const { error } = await admin.from("leads_marketing").insert(row);
      if (!error) return { error: null };
      if (process.env.NODE_ENV === "development") {
        console.error("[marketing-leads] admin insert:", error.code, error.message);
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[marketing-leads] admin client:", e);
      }
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads_marketing").insert(row);
  if (error && process.env.NODE_ENV === "development") {
    console.error("[marketing-leads] user/anon insert:", error.code, error.message);
  }
  return { error };
}

export async function submitMarketingLeadAction(
  _prev: MarketingLeadState,
  formData: FormData,
): Promise<MarketingLeadState> {
  const full_name = String(formData.get("full_name") || "").trim();
  const company_name = String(formData.get("company_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!full_name || !company_name) {
    return { error: "Naam en bedrijf zijn verplicht." };
  }
  if (!email && !phone) {
    return { error: "Vul minimaal e-mail of telefoon in." };
  }

  try {
    const row = {
      full_name,
      company_name,
      email: email || null,
      phone: phone || null,
      source: "homepage",
    };
    const { error } = await insertMarketingLeadRow(row);
    if (error) {
      return { error: friendlyInsertError(error) };
    }
    if (email) {
      await scheduleMarketingDrip({ email, source: "lead_capture" });
    }
    return { ok: true };
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[marketing-leads]", e);
    }
    return { error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}
