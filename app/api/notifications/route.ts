import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchNotificationsForCompany } from "@/lib/queries/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!company) {
    return NextResponse.json({ error: "Geen bedrijf" }, { status: 400 });
  }
  const items = await fetchNotificationsForCompany(supabase, company.id, 40);
  return NextResponse.json({ notifications: items });
}
