import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { hasSubscriptionAccess, isDemoCompanyId } from "@/lib/billing/trial";
import { createClient } from "@/lib/supabase/server";
import { ValueMomentClient } from "@/components/monetization/value-moment-client";
import { BRAND_NAME } from "@/lib/brand";

export default async function ValueMomentPage() {
  const auth = await getAuth();
  if (!auth.user) redirect("/login");
  if (!auth.company) redirect("/dashboard/onboarding");
  if (isDemoCompanyId(auth.company.id)) redirect("/dashboard");
  if (!hasSubscriptionAccess(auth.company)) redirect("/dashboard/upgrade");

  const supabase = await createClient();
  const { data: st } = await supabase
    .from("company_settings")
    .select("ai_setup_completed_at")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  if (!st?.ai_setup_completed_at) {
    redirect("/dashboard/ai-setup");
  }

  if (auth.company.value_moment_completed_at) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <div className="border-b border-border/60 bg-card/30 px-6 py-4">
        <p className="text-sm font-semibold">{BRAND_NAME}</p>
        <p className="text-xs text-muted-foreground">Je eerste succes</p>
      </div>
      <ValueMomentClient />
    </div>
  );
}
