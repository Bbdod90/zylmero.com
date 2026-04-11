import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { hasSubscriptionAccess, isDemoCompanyId } from "@/lib/billing/trial";
import { LandingPage } from "@/components/landing/landing-page";

export default async function Home() {
  const auth = await getAuth();

  if (auth.user && !auth.company) {
    redirect("/dashboard/onboarding");
  }

  if (auth.user && auth.company) {
    if (!auth.company.onboarding_completed) {
      redirect("/dashboard/onboarding");
    }
    if (
      !isDemoCompanyId(auth.company.id) &&
      !hasSubscriptionAccess(auth.company)
    ) {
      redirect("/dashboard/upgrade");
    }
    redirect("/dashboard");
  }

  return <LandingPage />;
}
