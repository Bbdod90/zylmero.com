import { BRAND_NAME } from "@/lib/brand";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/utils";

function reminderWindowIso(): { from: string; to: string } {
  const now = Date.now();
  const from = new Date(now + 23 * 60 * 60 * 1000).toISOString();
  const to = new Date(now + 25 * 60 * 60 * 1000).toISOString();
  return { from, to };
}

async function sendResendHtml(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    `${BRAND_NAME} <onboarding@resend.dev>`;
  if (!key) {
    console.info(
      `[appointment-reminder] (geen RESEND_API_KEY) skip naar ${input.to}`,
    );
    return { ok: false, error: "geen RESEND_API_KEY" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: t || res.statusText };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "send failed",
    };
  }
}

const ACTIVE_STATUSES = new Set(["scheduled", "planned", "confirmed"]);

export async function processAppointmentReminders(): Promise<{
  sent: number;
  skipped: number;
  failed: number;
}> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { sent: 0, skipped: 0, failed: 0 };
  }

  const { from, to } = reminderWindowIso();

  const { data: rows, error } = await admin
    .from("appointments")
    .select("id, company_id, lead_id, starts_at, status, notes")
    .is("reminder_sent_at", null)
    .gte("starts_at", from)
    .lte("starts_at", to);

  if (error || !rows?.length) {
    return { sent: 0, skipped: 0, failed: error ? 1 : 0 };
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    return { sent: 0, skipped: rows.length, failed: 0 };
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const raw of rows) {
    const row = raw as {
      id: string;
      company_id: string;
      lead_id: string | null;
      starts_at: string;
      status: string | null;
      notes: string | null;
    };
    const st = (row.status || "").trim().toLowerCase();
    if (st && !ACTIVE_STATUSES.has(st)) {
      skipped++;
      continue;
    }

    const { data: company } = await admin
      .from("companies")
      .select("name, contact_email")
      .eq("id", row.company_id)
      .maybeSingle();

    const companyName =
      (company?.name as string) || "Je bedrijf";
    const companyEmail = (company?.contact_email as string)?.trim() || null;

    let leadName: string | null = null;
    let leadEmail: string | null = null;
    if (row.lead_id) {
      const { data: lead } = await admin
        .from("leads")
        .select("full_name, email")
        .eq("id", row.lead_id)
        .maybeSingle();
      leadName = (lead?.full_name as string) || null;
      leadEmail = (lead?.email as string)?.trim() || null;
    }

    const when = formatDateTime(row.starts_at);
    const subject = `Herinnering: afspraak ${when}`;

    const bodyHtml = () => `
      <div style="font-family:system-ui,sans-serif;max-width:560px;line-height:1.5;color:#111">
        <p style="font-size:18px;font-weight:600;margin:0 0 12px">Afspraak morgen</p>
        <p style="margin:0 0 8px">Dit is een automatische herinnering van <strong>${escapeHtml(
          companyName,
        )}</strong>.</p>
        <p style="margin:0 0 8px"><strong>Tijd:</strong> ${escapeHtml(when)}</p>
        ${
          leadName
            ? `<p style="margin:0 0 8px"><strong>Klant:</strong> ${escapeHtml(leadName)}</p>`
            : ""
        }
        ${row.notes ? `<p style="margin:0 0 8px"><strong>Notitie:</strong> ${escapeHtml(row.notes)}</p>` : ""}
        <p style="margin:16px 0 0;font-size:13px;color:#666">— ${BRAND_NAME}</p>
      </div>
    `;

    const targets: string[] = [];
    if (leadEmail) targets.push(leadEmail);
    if (companyEmail && companyEmail !== leadEmail) targets.push(companyEmail);

    if (targets.length === 0) {
      skipped++;
      continue;
    }

    let okAny = false;
    const html = bodyHtml();
    for (const toAddr of targets) {
      const res = await sendResendHtml({
        to: toAddr,
        subject,
        html,
      });
      if (res.ok) okAny = true;
      else failed++;
    }

    if (okAny) {
      await admin
        .from("appointments")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", row.id);
      sent++;
    }
  }

  return { sent, skipped, failed };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
