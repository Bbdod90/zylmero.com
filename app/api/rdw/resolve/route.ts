import { NextResponse } from "next/server";
import { resolveKentekenFromText } from "@/lib/rdw/kenteken";

/** Zoek het eerste geldige kenteken in vrije tekst (homepage-demo). */
export async function POST(req: Request) {
  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldig verzoek" }, { status: 400 });
  }
  const message = String(body.message || "").trim();
  if (!message) {
    return NextResponse.json({ ok: false, vehicle: null });
  }
  const vehicle = await resolveKentekenFromText(message);
  return NextResponse.json({ ok: true, vehicle });
}
