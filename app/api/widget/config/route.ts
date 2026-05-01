import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildPublicWidgetConfig } from "@/lib/chatbot/widget-public-config";
import { buildWidgetContactLinks } from "@/lib/phone/widget-contact";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function safeString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** Publieke widget-config voor embedded chat (thema, logo, starters). Geen secrets. */
export async function GET(request: NextRequest) {
  const chatbotId = request.nextUrl.searchParams.get("chatbot_id")?.trim() || "";
  if (!chatbotId || !/^[0-9a-f-]{36}$/i.test(chatbotId)) {
    return NextResponse.json({ error: "Ongeldige chatbot_id." }, { status: 400, headers: CORS_HEADERS });
  }

  const supabase = createAdminClient();
  const { data: chatbot, error } = await supabase.from("chatbots").select("*").eq("id", chatbotId).maybeSingle();

  if (error || !chatbot) {
    return NextResponse.json({ error: "Chatbot niet gevonden." }, { status: 404, headers: CORS_HEADERS });
  }

  let companyId = safeString((chatbot as Record<string, unknown>).company_id);
  if (!companyId) {
    const ownerId = safeString((chatbot as Record<string, unknown>).user_id);
    if (ownerId) {
      const { data: ownerCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_user_id", ownerId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      companyId = safeString(ownerCompany?.id);
    }
  }

  let automationPrefs: Record<string, unknown> = {};
  let whiteLabelPrimary: string | null = null;
  let whiteLabelLogoUrl: string | null = null;
  let contactPhoneRaw: string | null = null;
  let whatsappPhoneRaw: string | null = null;

  if (companyId) {
    const [{ data: companyRow }, { data: settingsRow }] = await Promise.all([
      supabase.from("companies").select("contact_phone").eq("id", companyId).maybeSingle(),
      supabase
        .from("company_settings")
        .select("automation_preferences, white_label_primary, white_label_logo_url, whatsapp_channel")
        .eq("company_id", companyId)
        .maybeSingle(),
    ]);

    contactPhoneRaw =
      companyRow && typeof (companyRow as Record<string, unknown>).contact_phone === "string"
        ? String((companyRow as Record<string, unknown>).contact_phone).trim() || null
        : null;

    if (settingsRow && typeof settingsRow === "object") {
      const row = settingsRow as Record<string, unknown>;
      const ap = row.automation_preferences;
      automationPrefs = ap && typeof ap === "object" ? (ap as Record<string, unknown>) : {};
      whiteLabelPrimary =
        typeof row.white_label_primary === "string" && row.white_label_primary.trim()
          ? row.white_label_primary.trim()
          : null;
      whiteLabelLogoUrl =
        typeof row.white_label_logo_url === "string" && row.white_label_logo_url.trim()
          ? row.white_label_logo_url.trim()
          : null;
      const wa = row.whatsapp_channel;
      if (wa && typeof wa === "object") {
        const num = (wa as Record<string, unknown>).phone_number;
        whatsappPhoneRaw = typeof num === "string" && num.trim() ? num.trim() : null;
      }
    }
  }

  const base = buildPublicWidgetConfig({
    automationPreferences: automationPrefs,
    chatbotOpeningszin:
      typeof (chatbot as Record<string, unknown>).openingszin === "string"
        ? String((chatbot as Record<string, unknown>).openingszin)
        : null,
    whiteLabelPrimary,
    whiteLabelLogoUrl,
  });

  const cfg = {
    ...base,
    contact: buildWidgetContactLinks({
      contactPhoneRaw,
      whatsappPhoneRaw,
    }),
  };

  return NextResponse.json(cfg, {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, max-age=60, s-maxage=120",
    },
  });
}
