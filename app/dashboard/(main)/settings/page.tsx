import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageFrame } from "@/components/layout/page-frame";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import {
  countLeadsThisMonth,
  maxLeadsPerMonth,
} from "@/lib/billing/entitlements";
import { siteUrl } from "@/lib/stripe/server";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { tab?: string; checkout?: string };
}) {
  const auth = await getAuth();
  if (!auth.company) return null;
  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();

  const mapped = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const leadsThisMonth = await countLeadsThisMonth(supabase, auth.company.id);
  const leadCap = maxLeadsPerMonth(auth.company);

  const defaultTab =
    searchParams?.tab === "billing" ||
    searchParams?.tab === "whatsapp" ||
    searchParams?.tab === "email" ||
    searchParams?.tab === "knowledge" ||
    searchParams?.tab === "branding" ||
    searchParams?.tab === "business" ||
    searchParams?.tab === "widget" ||
    searchParams?.tab === "quotes"
      ? searchParams.tab
      : "business";

  return (
    <PageFrame
      title="Instellingen"
      subtitle="Alle details: bedrijf, kennis, WhatsApp, widget en facturatie. Voor het stappenplan: zie AI & koppelingen."
    >
      <SettingsTabs
        company={auth.company}
        widgetEmbedToken={auth.company.widget_embed_token}
        leadsThisMonth={leadsThisMonth}
        leadCap={leadCap}
        siteOrigin={siteUrl()}
        defaultTab={defaultTab}
        settings={{
          niche: mapped?.niche ?? null,
          services: mapped?.services ?? [],
          faq: mapped?.faq ?? [],
          pricing_hints: mapped?.pricing_hints ?? null,
          business_hours: mapped?.business_hours ?? {},
          booking_link: mapped?.booking_link ?? null,
          whatsapp_channel:
            mapped?.whatsapp_channel ?? {
              provider: "mock",
              connected: false,
            },
          auto_reply_enabled: mapped?.auto_reply_enabled ?? false,
          auto_reply_delay_seconds: mapped?.auto_reply_delay_seconds ?? 30,
          email_inbound_enabled: mapped?.email_inbound_enabled ?? false,
          knowledge_snippets: mapped?.knowledge_snippets ?? [],
          white_label_logo_url: mapped?.white_label_logo_url ?? null,
          white_label_primary: mapped?.white_label_primary ?? null,
          quote_intro: mapped?.quote_intro ?? null,
          quote_footer: mapped?.quote_footer ?? null,
          quote_include_pricing_hints: mapped?.quote_include_pricing_hints ?? false,
          quote_include_zylmero_notice: mapped?.quote_include_zylmero_notice !== false,
        }}
      />
    </PageFrame>
  );
}
