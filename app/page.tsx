import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { ANONYMOUS_DEMO_USER_ID } from "@/lib/auth/constants";
import { isDemoCompanyId } from "@/lib/billing/trial";
import { hasEffectiveProductAccess } from "@/lib/platform/host-access";
import { LandingPage } from "@/components/landing/landing-page";

export default async function Home() {
  const auth = await getAuth();

  /**
   * Alleen echte Supabase-sessies naar dashboard sturen.
   * Anonieme demo (cookie na “Bekijk demo”) is géén login: homepage blijft zichtbaar op `/`.
   */
  const isRealUser = auth.user && auth.user.id !== ANONYMOUS_DEMO_USER_ID;

  if (isRealUser) {
    if (!auth.company) {
      redirect("/dashboard/onboarding");
    }
    if (!auth.company.onboarding_completed) {
      redirect("/dashboard/onboarding");
    }
    if (
      !isDemoCompanyId(auth.company.id) &&
      !hasEffectiveProductAccess(auth.company, auth.user.id)
    ) {
      redirect("/dashboard/upgrade");
    }
    redirect("/dashboard");
  }

  return <LandingPage />;
}
