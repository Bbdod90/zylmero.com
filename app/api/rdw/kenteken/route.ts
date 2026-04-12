import { NextResponse } from "next/server";
import { lookupKenteken, normalizeKenteken } from "@/lib/rdw/kenteken";

/** Publieke RDW-lookup voor demo / chat (geen auth). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("kenteken") || "";
  const kenteken = normalizeKenteken(raw);
  if (!kenteken) {
    return NextResponse.json(
      { ok: false, error: "Ongeldig kenteken" },
      { status: 400 },
    );
  }
  const vehicle = await lookupKenteken(kenteken);
  if (!vehicle) {
    return NextResponse.json(
      { ok: false, error: "Kenteken niet gevonden bij RDW" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, vehicle });
}
