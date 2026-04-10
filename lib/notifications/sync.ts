import type { SupabaseClient } from "@supabase/supabase-js";
import { insertNotificationIfNew } from "@/lib/notifications/create";

/**
 * Derives in-app notifications from live data (deduped).
 * Called once per dashboard load for the signed-in company.
 */
export async function syncNotificationsForCompany(
  supabase: SupabaseClient,
  companyId: string,
): Promise<void> {
  const now = Date.now();
  const staleHours = 4;

  const { data: leads } = await supabase
    .from("leads")
    .select("id, full_name, score, created_at, last_message_at")
    .eq("company_id", companyId)
    .limit(200);

  for (const lead of leads || []) {
    const score = typeof lead.score === "number" ? lead.score : 0;
    if (score >= 75) {
      await insertNotificationIfNew(supabase, {
        company_id: companyId,
        type: "hot_lead",
        title: "Hete lead",
        body: `${lead.full_name} scoort ${score}+ — grijp in terwijl de interesse hoog is.`,
        dedupe_key: `hot_lead:${lead.id}`,
        metadata: { lead_id: lead.id },
      });
    }

    const created = new Date(lead.created_at as string).getTime();
    if (now - created < 48 * 3600000) {
      await insertNotificationIfNew(supabase, {
        company_id: companyId,
        type: "new_lead",
        title: "Nieuwe lead",
        body: `${lead.full_name} is recent in je pijplijn gekomen.`,
        dedupe_key: `new_lead:${lead.id}`,
        metadata: { lead_id: lead.id },
      });
    }
  }

  const { data: convs } = await supabase
    .from("conversations")
    .select("id, lead_id")
    .eq("company_id", companyId)
    .limit(80);

  for (const c of convs || []) {
    const { data: last } = await supabase
      .from("messages")
      .select("role, created_at")
      .eq("conversation_id", c.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!last || last.role !== "user") continue;
    const h =
      (now - new Date(last.created_at as string).getTime()) / 3600000;
    if (h < staleHours) continue;
    const { data: lead } = await supabase
      .from("leads")
      .select("full_name")
      .eq("id", c.lead_id)
      .maybeSingle();
    await insertNotificationIfNew(supabase, {
      company_id: companyId,
      type: "no_reply_risk",
      title: "Risico: geen antwoord",
      body: `${lead?.full_name ?? "Een lead"} wacht al ${Math.floor(h)} u+.`,
      dedupe_key: `stale:${c.lead_id}`,
      metadata: { lead_id: c.lead_id, conversation_id: c.id },
    });
  }

  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, title, total, updated_at, status")
    .eq("company_id", companyId)
    .eq("status", "accepted")
    .order("updated_at", { ascending: false })
    .limit(30);

  for (const q of quotes || []) {
    const updated = new Date(q.updated_at as string).getTime();
    if (now - updated > 14 * 24 * 3600000) continue;
    await insertNotificationIfNew(supabase, {
      company_id: companyId,
      type: "quote_accepted",
      title: "Offerte geaccepteerd",
      body: `${q.title} — ${Number(q.total).toFixed(0)} EUR`,
      dedupe_key: `quote_accepted:${q.id}`,
      metadata: { quote_id: q.id },
    });
  }
}
