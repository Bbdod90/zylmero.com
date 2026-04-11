import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { BRAND_NAME } from "@/lib/brand";
import { OnboardingWizard } from "@/components/settings/onboarding-wizard";

export default async function OnboardingPage() {
  const auth = await getAuth();
  if (!auth.user) redirect("/login");
  if (auth.company?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background [background-image:radial-gradient(ellipse_100%_80%_at_50%_-30%,hsl(var(--primary)/0.08),transparent_55%)]">
      <div className="border-b border-border/60 bg-card/30 px-6 py-6 backdrop-blur-xl sm:px-10">
        <p className="text-sm font-semibold tracking-tight text-foreground">{BRAND_NAME}</p>
        <p className="text-xs text-muted-foreground">Binnen 5 minuten live — geen kaart nodig</p>
      </div>
      <div className="flex flex-1 items-start justify-center px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <OnboardingWizard />
      </div>
    </div>
  );
}
