import type { SupabaseClient } from "@supabase/supabase-js";
import { suggestReply } from "@/lib/openai/suggest-reply";
import type { CompanySettings, Message } from "@/lib/types";
import { getCompanySettings } from "@/lib/company-settings";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function sendAutoReplyIfEnabled(params: {
  supabase: SupabaseClient;
  companyId: string;
  companyName: string;
  companyNiche?: string | null;
  conversationId: string;
  leadFirstName: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return { sent: false, error: "OPENAI_API_KEY missing" };
  }
  const settings = await getCompanySettings(params.supabase, params.companyId);
  if (!settings || !settings.auto_reply_enabled) {
    return { sent: false };
  }

  const capped = Math.min(
    Math.max(0, settings.auto_reply_delay_seconds),
    25,
  );
  await sleep(capped * 1000);

  const { data: msgs } = await params.supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", params.conversationId)
    .order("created_at", { ascending: true });

  const reply = await suggestReply({
    messages: (msgs || []) as Message[],
    companyName: params.companyName,
    settings: settings as CompanySettings,
    leadFirstName: params.leadFirstName,
    nicheId: params.companyNiche,
  });

  const { error } = await params.supabase.from("messages").insert({
    conversation_id: params.conversationId,
    role: "assistant",
    content: reply,
  });

  if (error) return { sent: false, error: error.message };

  await params.supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", params.conversationId);

  return { sent: true };
}
