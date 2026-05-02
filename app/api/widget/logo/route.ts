import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/svg+xml") return "svg";
  return "bin";
}

/** Upload logo voor widget-kop; retourneert publieke https-URL. */
export async function POST(req: Request) {
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Geen bestand." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Bestand is te groot (max. 2 MB)." }, { status: 400 });
  }
  const mime = (file.type || "application/octet-stream").toLowerCase();
  if (!ALLOWED.has(mime)) {
    return NextResponse.json(
      { error: "Alleen JPG, PNG, WebP, GIF of SVG." },
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = extFromMime(mime);
    const path = `${auth.company.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await admin.storage.from("widget-logos").upload(path, buf, {
      contentType: mime,
      cacheControl: "86400",
      upsert: false,
    });
    if (upErr) {
      console.error("widget-logo upload:", upErr.message);
      return NextResponse.json(
        {
          error:
            "Upload mislukt. Controleer of de Supabase bucket `widget-logos` bestaat (zie migratie).",
        },
        { status: 503 },
      );
    }
    const { data } = admin.storage.from("widget-logos").getPublicUrl(path);
    if (!data?.publicUrl) {
      return NextResponse.json({ error: "Geen publieke URL." }, { status: 500 });
    }
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    console.error("widget-logo:", e);
    return NextResponse.json({ error: "Upload mislukt." }, { status: 500 });
  }
}
