"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/env";
import type { ActionResult } from "@/actions/ai";
import { escapeHtmlText } from "@/lib/marketing/email-templates";
import { personalizeNewsletterHtml } from "@/lib/email-campaigns/personalize-html";

const MAX_RECIPIENTS = 2000;
const INSERT_CHUNK = 400;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function enqueueNewsletterToAllLeads(
  subject: string,
  bodyHtml: string,
): Promise<ActionResult<{ campaignId: string; queued: number }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }

  const subj = subject.trim();
  if (subj.length < 2 || subj.length > 200) {
    return { ok: false, error: "Onderwerp: gebruik 2 tot 200 tekens." };
  }
  const body = bodyHtml.trim();
  if (body.length < 10) {
    return { ok: false, error: "Bericht is te kort (minimaal 10 tekens)." };
  }
  if (body.length > 400_000) {
    return { ok: false, error: "Bericht is te lang." };
  }

  const supabase = await createClient();
  const { data: leadsRaw, error: leadsErr } = await supabase
    .from("leads")
    .select("id,email,full_name")
    .eq("company_id", auth.company.id)
    .not("email", "is", null);

  if (leadsErr) {
    return { ok: false, error: leadsErr.message };
  }

  const leads = (leadsRaw ?? []).filter((l) => {
    const e = typeof l.email === "string" ? l.email.trim().toLowerCase() : "";
    return e.length > 3 && EMAIL_RE.test(e);
  });

  if (!leads.length) {
    return {
      ok: false,
      error:
        "Geen klanten met een geldig e-mailadres. Vul eerst e-mail in bij Klanten.",
    };
  }
  if (leads.length > MAX_RECIPIENTS) {
    return {
      ok: false,
      error: `Maximaal ${MAX_RECIPIENTS} ontvangers per campagne. Verklein je lijst of neem contact op.`,
    };
  }

  const { data: campaignRow, error: campErr } = await supabase
    .from("company_email_campaigns")
    .insert({
      company_id: auth.company.id,
      subject: subj,
      body_html: body,
      status: "queued",
      total_recipients: leads.length,
      created_by: auth.user.id,
    })
    .select("id")
    .single();

  if (campErr || !campaignRow?.id) {
    return {
      ok: false,
      error: campErr?.message ?? "Campagne aanmaken mislukt.",
    };
  }

  const campaignId = campaignRow.id as string;
  const companyName = auth.company.name?.trim() || "Je bedrijf";
  const footerLine = escapeHtmlText(`— ${companyName}`);

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    await supabase
      .from("company_email_campaigns")
      .delete()
      .eq("id", campaignId)
      .eq("company_id", auth.company.id);
    return {
      ok: false,
      error: "Verzenden is nu niet geconfigureerd (server).",
    };
  }

  const { data: verify } = await admin
    .from("company_email_campaigns")
    .select("company_id")
    .eq("id", campaignId)
    .single();

  if (!verify || verify.company_id !== auth.company.id) {
    return { ok: false, error: "Campagne niet gevonden." };
  }

  const scheduledFor = new Date().toISOString();
  const rows = leads.map((l) => {
    const email = (l.email as string).trim().toLowerCase();
    return {
      recipient_email: email,
      template_key: "lead_broadcast",
      campaign_source: "company_newsletter",
      scheduled_for: scheduledFor,
      campaign_id: campaignId,
      payload: {
        subject: subj,
        html: personalizeNewsletterHtml(body, {
          full_name: (l.full_name as string) ?? "",
        }),
        footer_line: footerLine,
      },
    };
  });

  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const chunk = rows.slice(i, i + INSERT_CHUNK);
    const { error: insErr } = await admin.from("marketing_email_queue").insert(chunk);
    if (insErr) {
      await admin.from("marketing_email_queue").delete().eq("campaign_id", campaignId);
      await admin.from("company_email_campaigns").delete().eq("id", campaignId);
      return { ok: false, error: insErr.message };
    }
  }

  revalidatePath("/dashboard/nieuwsbrief");
  return { ok: true, data: { campaignId, queued: leads.length } };
}
