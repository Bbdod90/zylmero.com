import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leadInsertJsonDefaults } from "@/lib/leads/insert-defaults";

function randomValue() {
  return Math.round(120 + Math.random() * 480);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!company?.id) {
    return NextResponse.json({ error: "Geen bedrijf" }, { status: 403 });
  }
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, full_name, status, estimated_value, source, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ leads: leads || [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!company?.id) {
    return NextResponse.json({ error: "Geen bedrijf" }, { status: 403 });
  }
  let payload: { name?: string; message?: string; channel?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }
  const full_name = String(payload.name || "Naamloos").trim().slice(0, 200);
  const message = String(payload.message || "").trim().slice(0, 2000);
  const channel = String(payload.channel || "website").trim().slice(0, 80);
  const estimated_value = randomValue();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      company_id: company.id,
      full_name,
      source: channel,
      intent: message || null,
      status: "new",
      estimated_value,
      ...leadInsertJsonDefaults,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: lead.id, estimated_value });
}
