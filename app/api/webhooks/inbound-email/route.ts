import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processInboundEmail, type InboundEmailPayload } from "@/lib/email/inbound";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function webhookSecret(): string | undefined {
  const a = process.env.INBOUND_EMAIL_WEBHOOK_SECRET?.trim();
  const b = process.env.WHATSAPP_WEBHOOK_SECRET?.trim();
  return a || b || undefined;
}

function verifySecret(req: Request): boolean {
  const expected = webhookSecret();
  if (!expected) return false;
  const header =
    req.headers.get("x-inbound-email-secret") ||
    req.headers.get("x-webhook-secret") ||
    req.headers.get("x-whatsapp-signature");
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === expected || bearer === expected;
}

export async function POST(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<InboundEmailPayload>;
  try {
    body = (await req.json()) as Partial<InboundEmailPayload>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await processInboundEmail(admin, {
    company_id: String(body.company_id || ""),
    from: String(body.from || ""),
    from_name: body.from_name ?? null,
    subject: body.subject ?? null,
    body: String(body.body || ""),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 422 });
  }
  return NextResponse.json(result);
}
