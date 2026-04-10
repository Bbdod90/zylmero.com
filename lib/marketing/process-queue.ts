import { createAdminClient } from "@/lib/supabase/admin";
import { sendQueuedMarketingEmail } from "@/lib/marketing/email-send";

export async function processDueMarketingEmails(
  limit = 30,
): Promise<{ processed: number; failed: number }> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { processed: 0, failed: 0 };
  }

  const now = new Date().toISOString();
  const { data: rows, error } = await admin
    .from("marketing_email_queue")
    .select("id, recipient_email, template_key, payload")
    .is("sent_at", null)
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (error || !rows?.length) {
    return { processed: 0, failed: error ? 1 : 0 };
  }

  let processed = 0;
  let failed = 0;
  for (const row of rows) {
    const r = row as {
      id: string;
      recipient_email: string;
      template_key: string;
      payload: Record<string, unknown> | null;
    };
    const send = await sendQueuedMarketingEmail({
      to: r.recipient_email,
      templateKey: r.template_key,
      payload: r.payload || {},
    });
    if (send.ok) {
      await admin
        .from("marketing_email_queue")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", r.id);
      processed += 1;
    } else {
      failed += 1;
    }
  }
  return { processed, failed };
}
