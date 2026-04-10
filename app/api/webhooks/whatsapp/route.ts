import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  processInboundWhatsApp,
  type InboundWebhookPayload,
} from "@/lib/whatsapp/inbound";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySecret(req: Request): boolean {
  const expected = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!expected) return false;
  const header =
    req.headers.get("x-whatsapp-signature") ||
    req.headers.get("x-webhook-secret");
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === expected || bearer === expected;
}

export async function POST(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<InboundWebhookPayload>;
  try {
    body = (await req.json()) as Partial<InboundWebhookPayload>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await processInboundWhatsApp(admin, {
    company_id: String(body.company_id || ""),
    from: String(body.from || ""),
    body: String(body.body || ""),
    provider: body.provider,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: 422 },
    );
  }
  return NextResponse.json(result);
}
