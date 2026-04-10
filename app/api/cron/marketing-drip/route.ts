import { NextResponse } from "next/server";
import { processDueMarketingEmails } from "@/lib/marketing/process-queue";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!secret || token !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await processDueMarketingEmails(40);
  return NextResponse.json({ ok: true, ...result });
}
