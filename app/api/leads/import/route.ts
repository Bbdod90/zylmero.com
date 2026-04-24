import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { leadInsertJsonDefaults } from "@/lib/leads/insert-defaults";
import { hasEffectiveProductAccess } from "@/lib/platform/host-access";
import { PAYWALL_AI_LEADS } from "@/lib/billing/paywall";

export const dynamic = "force-dynamic";

function normalizeRow(raw: Record<string, unknown>): {
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
} | null {
  const name = String(
    raw.naam ?? raw.name ?? raw.Naam ?? raw.Name ?? "",
  ).trim();
  if (!name) return null;
  const email = String(raw.email ?? raw.Email ?? "").trim() || null;
  const phone =
    String(raw.telefoon ?? raw.phone ?? raw.Telefoon ?? raw.Phone ?? "").trim() ||
    null;
  const notes =
    String(raw.notities ?? raw.notes ?? raw.Notities ?? "").trim() || null;
  if (!email && !phone) return null;
  return { full_name: name, email, phone, notes };
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!hasEffectiveProductAccess(auth.company, auth.user.id)) {
    return NextResponse.json({ ok: false, error: PAYWALL_AI_LEADS }, { status: 402 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ ok: false, error: "Geen bestand." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const name = (file as File).name?.toLowerCase() ?? "";
  let rows: Record<string, unknown>[] = [];

  try {
    if (name.endsWith(".csv")) {
      const text = buf.toString("utf8");
      const parsed = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      if (parsed.errors.length) {
        return NextResponse.json(
          { ok: false, error: "CSV kon niet worden gelezen." },
          { status: 400 },
        );
      }
      rows = parsed.data.filter((r) => Object.keys(r).length > 0);
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const wb = XLSX.read(buf, { type: "buffer" });
      const sheet = wb.Sheets[wb.SheetNames[0]!];
      if (!sheet) {
        return NextResponse.json(
          { ok: false, error: "Leeg Excel-bestand." },
          { status: 400 },
        );
      }
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    } else {
      return NextResponse.json(
        { ok: false, error: "Alleen CSV of Excel (.xlsx)." },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bestand kon niet worden gelezen." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]!;
    const n = normalizeRow(raw);
    if (!n) {
      skipped += 1;
      continue;
    }
    const { data: lead, error: le } = await supabase
      .from("leads")
      .insert({
        company_id: auth.company.id,
        full_name: n.full_name,
        email: n.email,
        phone: n.phone,
        source: "import",
        status: "new",
        notes: n.notes,
        ...leadInsertJsonDefaults,
      })
      .select("id")
      .single();
    if (le || !lead) {
      errors.push(`Rij ${i + 2}: ${le?.message ?? "fout"}`);
      continue;
    }
    const { error: ce } = await supabase.from("conversations").insert({
      company_id: auth.company.id,
      lead_id: lead.id as string,
      channel: "inbox",
    });
    if (ce) {
      errors.push(`Rij ${i + 2}: conversatie ${ce.message}`);
      continue;
    }
    imported += 1;
  }

  return NextResponse.json({
    ok: true,
    imported,
    skipped,
    total: rows.length,
    errors: errors.slice(0, 12),
  });
}
