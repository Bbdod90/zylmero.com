import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import {
  hasSubscriptionAccess,
  isDemoCompanyId,
  trialDaysRemaining,
} from "@/lib/billing/trial";
import { getUpgradeNudgeSignals } from "@/lib/queries/monetization";
import { MonetizationClient } from "@/components/monetization/monetization-client";
import { isDemoMode, isForcedDemoEnv } from "@/lib/env";
import { getDemoNicheId } from "@/lib/demo/niche-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DemoBanner } from "@/components/sales/demo-banner";
import { ANONYMOUS_DEMO_USER_ID } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";
import { syncNotificationsForCompany } from "@/lib/notifications/sync";
import { fetchNotificationsForCompany } from "@/lib/queries/notifications";
import { PastDueBanner } from "@/components/billing/past-due-banner";
import { ProfileIntakeBanner } from "@/components/dashboard/profile-intake-banner";
import { DeferredSetupBanner } from "@/components/dashboard/deferred-setup-banner";
import { ConversionUrgencyBar } from "@/components/dashboard/conversion-urgency-bar";
import { isFounderUser } from "@/lib/founder/access";
import type { AppNotification } from "@/lib/types";

export default async function MainDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getAuth();
  if (!auth.company || !auth.company.onboarding_completed) {
    redirect("/dashboard/onboarding");
  }

  if (
    !isDemoCompanyId(auth.company.id) &&
    !hasSubscriptionAccess(auth.company)
  ) {
    redirect("/dashboard/upgrade");
  }

  const demoOn = isDemoMode();
  const demoForced = isForcedDemoEnv();
  const trialDays =
    !isDemoCompanyId(auth.company.id) && auth.company.plan === "trial"
      ? trialDaysRemaining(auth.company)
      : null;
  const isAnonymousPreview = auth.user.id === ANONYMOUS_DEMO_USER_ID;

  const supabase = await createClient();
  const founderSales = await isFounderUser(supabase, auth.user.id);

  let needsAiSetupNudge = false;
  let needsValueMomentNudge = false;
  if (!demoOn && !isDemoCompanyId(auth.company.id)) {
    needsValueMomentNudge = !auth.company.value_moment_completed_at;
    const { data: stRow } = await supabase
      .from("company_settings")
      .select("ai_setup_completed_at")
      .eq("company_id", auth.company.id)
      .maybeSingle();
    needsAiSetupNudge = !stRow?.ai_setup_completed_at;
  }

  let notifications: AppNotification[] = [];
  let showUpgradeNudge = false;
  let upgradeNudgeReason: "leads" | "quotes" | "ai" | null = null;
  if (!isDemoCompanyId(auth.company.id) && !demoOn) {
    await syncNotificationsForCompany(supabase, auth.company.id);
    notifications = await fetchNotificationsForCompany(supabase, auth.company.id);
    const signals = await getUpgradeNudgeSignals(supabase, auth.company.id);
    showUpgradeNudge =
      signals.shouldNudge &&
      auth.company.plan === "trial" &&
      hasSubscriptionAccess(auth.company);
    upgradeNudgeReason = showUpgradeNudge ? signals.nudgeReason : null;
  }

  const sidebarProps = {
    companyName: auth.company.name,
    demoActive: demoOn,
    demoForced: demoForced,
    trialDaysLeft: trialDays,
    isAnonymousPreview: isAnonymousPreview,
    notifications,
    founderSales,
  };

  return (
    <DashboardShell sidebarProps={sidebarProps}>
      {demoOn ? (
        <DemoBanner forced={demoForced} demoNicheId={getDemoNicheId()} />
      ) : null}
      <PastDueBanner company={auth.company} />
      {!demoOn &&
      !isDemoCompanyId(auth.company.id) &&
      !auth.company.profile_intake_completed ? (
        <ProfileIntakeBanner />
      ) : null}
      {!demoOn && !isDemoCompanyId(auth.company.id) ? (
        <DeferredSetupBanner
          needsAiSetup={needsAiSetupNudge}
          needsValueMoment={needsValueMomentNudge}
        />
      ) : null}
      <ConversionUrgencyBar demoMode={demoOn} />
      <MonetizationClient
        companyId={auth.company.id}
        plan={auth.company.plan}
        showUpgradeNudge={showUpgradeNudge}
        nudgeReason={upgradeNudgeReason}
      />
      {children}
    </DashboardShell>
  );
}
