import { getAuth } from "@/lib/auth";
import { isDemoCompanyId } from "@/lib/billing/trial";
import { isSalesMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { ensureCompanyReferralCode } from "@/lib/referral/code";
import { PageFrame } from "@/components/layout/page-frame";
import { GrowthDashboard } from "@/components/growth/growth-dashboard";
import { ReferralInviteSection } from "@/components/growth/referral-invite-section";
import { resolveSiteUrl } from "@/lib/site-url";

export default async function GrowthPage() {
  const auth = await getAuth();
  if (!auth.company) return null;

  const siteUrl = resolveSiteUrl();

  const supabase = await createClient();
  let referralCode = auth.company.referral_code;
  let referralCount = 0;
  if (isDemoCompanyId(auth.company.id)) {
    referralCode = referralCode || "DEMO";
  } else {
    if (!referralCode) {
      referralCode = await ensureCompanyReferralCode(supabase, auth.company.id);
    }
    const { count } = await supabase
      .from("referral_conversions")
      .select("*", { count: "exact", head: true })
      .eq("referrer_company_id", auth.company.id);
    referralCount = count ?? 0;
  }

  return (
    <PageFrame
      title="Klanten werven"
      subtitle="Volg dit systeem — benadering, demo&apos;s en afsluitingen. Geen blog: een pijplijn."
      dismissHref="/dashboard"
      dismissLabel="Terug naar dashboard"
    >
      <div className="mb-10">
        <ReferralInviteSection
          siteUrl={siteUrl}
          initialCode={referralCode}
          referralCount={referralCount}
          creditPerReferralEur={10}
        />
      </div>
      <GrowthDashboard
        siteUrl={siteUrl}
        salesModeInitial={isSalesMode()}
      />
    </PageFrame>
  );
}
