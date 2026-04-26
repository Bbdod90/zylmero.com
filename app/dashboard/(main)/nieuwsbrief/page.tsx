import { requireCompany } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageFrame } from "@/components/layout/page-frame";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import {
  NewsletterWorkspace,
  type NewsletterCampaignRow,
} from "@/components/newsletter/newsletter-workspace";
import { isDemoMode } from "@/lib/env";

export default async function NieuwsbriefPage() {
  const { company } = await requireCompany();
  const demo = isDemoMode();
  const supabase = await createClient();

  const [{ count: emailCount }, { data: campaigns }] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("company_id", company.id)
      .not("email", "is", null),
    supabase
      .from("company_email_campaigns")
      .select("id, subject, total_recipients, created_at, status")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const leadsWithEmailCount = emailCount ?? 0;

  return (
    <PageFrame
      title="Nieuwsbrief"
      subtitle="Eén bericht naar alle klanten die een e-mailadres bij je in het systeem hebben."
    >
      <DashboardWorkSurface>
        <NewsletterWorkspace
          demoMode={demo}
          leadsWithEmailCount={leadsWithEmailCount}
          recentCampaigns={(campaigns ?? []) as NewsletterCampaignRow[]}
        />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
