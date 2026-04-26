import { BRAND_NAME } from "@/lib/brand";
import { getTemplate } from "@/lib/marketing/email-templates";

export async function sendQueuedMarketingEmail(input: {
  to: string;
  templateKey: string;
  payload: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string }> {
  const tpl = getTemplate(input.templateKey);
  if (!tpl) {
    return { ok: false, error: `Onbekende template: ${input.templateKey}` };
  }
  let subject = tpl.subject;
  if (input.templateKey === "lead_broadcast") {
    const s = input.payload?.subject;
    if (typeof s === "string" && s.trim()) {
      subject = s.trim().slice(0, 998);
    } else {
      subject = "Bericht";
    }
  }
  const html = tpl.html(input.payload);

  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    `${BRAND_NAME} <onboarding@resend.dev>`;

  if (!key) {
    console.info(
      `[marketing-email] (geen RESEND_API_KEY)`,
      input.to,
      subject,
    );
    return { ok: true };
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
        subject,
        html,
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
