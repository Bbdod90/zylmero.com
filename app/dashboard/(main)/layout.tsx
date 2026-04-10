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
import { isDemoMode } from "@/lib/env";
import { getDemoNicheId } from "@/lib/demo/niche-context";
import { AppSidebar } from "@/components/layout/sidebar";
import { DemoBanner } from "@/components/sales/demo-banner";
import { ANONYMOUS_DEMO_USER_ID } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";
import { syncNotificationsForCompany } from "@/lib/notifications/sync";
import { fetchNotificationsForCompany } from "@/lib/queries/notifications";
import { PastDueBanner } from "@/components/billing/past-due-banner";
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

  if (
    !isDemoCompanyId(auth.company.id) &&
    !auth.company.value_moment_completed_at
  ) {
    redirect("/dashboard/value-moment");
  }

  const demoOn = isDemoMode();
  const demoForced = process.env.NEXT_PUBLIC_CLOSERFLOW_DEMO === "true";
  const trialDays =
    !isDemoCompanyId(auth.company.id) && auth.company.plan === "trial"
      ? trialDaysRemaining(auth.company)
      : null;
  const isAnonymousPreview = auth.user.id === ANONYMOUS_DEMO_USER_ID;

  const supabase = await createClient();
  const founderSales = await isFounderUser(supabase, auth.user.id);

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

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        companyName={auth.company.name}
        demoActive={demoOn}
        demoForced={demoForced}
        trialDaysLeft={trialDays}
        isAnonymousPreview={isAnonymousPreview}
        notifications={notifications}
        founderSales={founderSales}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {demoOn ? (
          <DemoBanner forced={demoForced} demoNicheId={getDemoNicheId()} />
        ) : null}
        <PastDueBanner company={auth.company} />
        <ConversionUrgencyBar demoMode={demoOn} />
        <MonetizationClient
          companyId={auth.company.id}
          plan={auth.company.plan}
          showUpgradeNudge={showUpgradeNudge}
          nudgeReason={upgradeNudgeReason}
        />
        {children}
      </div>
    </div>
  );
}
