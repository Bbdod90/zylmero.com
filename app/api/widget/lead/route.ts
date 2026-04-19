import { NextResponse } from "next/server";
import { mapCompanyRow } from "@/lib/auth/map-company";
import { hasSubscriptionAccess } from "@/lib/billing/trial";
import { createAdminClient } from "@/lib/supabase/admin";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    };
    const token = String(body.token || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim() || null;
    const phone = String(body.phone || "").trim() || null;
    const message = String(body.message || "").trim() || null;

    if (!token || !name) {
      return NextResponse.json(
        { ok: false, error: "token en naam verplicht" },
        { status: 400, headers: cors },
      );
    }

    const admin = createAdminClient();
    const { data: row, error: cErr } = await admin
      .from("companies")
      .select("*")
      .eq("widget_embed_token", token)
      .maybeSingle();

    if (cErr || !row?.id) {
      return NextResponse.json(
        { ok: false, error: "ongeldige widget" },
        { status: 404, headers: cors },
      );
    }

    const company = mapCompanyRow(row as Record<string, unknown>);
    if (!hasSubscriptionAccess(company)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Chat tijdelijk niet beschikbaar — het abonnement van dit bedrijf is niet actief. Probeer het later opnieuw of neem rechtstreeks contact op.",
        },
        { status: 403, headers: cors },
      );
    }

    const summaryParts = [message, email ? `E-mail: ${email}` : null, phone ? `Tel: ${phone}` : null]
      .filter(Boolean)
      .join("\n");

    const { error: lErr } = await admin.from("leads").insert({
      company_id: company.id,
      full_name: name,
      email,
      phone,
      source: "website_widget",
      status: "new",
      summary: summaryParts || null,
    });

    if (lErr) {
      return NextResponse.json(
        { ok: false, error: "lead opslaan mislukt" },
        { status: 500, headers: cors },
      );
    }

    return NextResponse.json({ ok: true }, { headers: cors });
  } catch {
    return NextResponse.json(
      { ok: false, error: "ongeldig verzoek" },
      { status: 400, headers: cors },
    );
  }
}
