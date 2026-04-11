import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { isDemoCompanyId } from "@/lib/billing/trial";
import { createClient } from "@/lib/supabase/server";
import { AiSetupClient } from "@/components/onboarding/ai-setup-client";
import { BRAND_NAME } from "@/lib/brand";

export default async function AiSetupPage() {
  const auth = await getAuth();
  if (!auth.user) redirect("/login");
  if (!auth.company) redirect("/dashboard/onboarding");
  if (isDemoCompanyId(auth.company.id)) redirect("/dashboard");

  const supabase = await createClient();
  const { data: st } = await supabase
    .from("company_settings")
    .select("ai_setup_completed_at")
    .eq("company_id", auth.company.id)
    .maybeSingle();

  const done = Boolean(st?.ai_setup_completed_at);
  if (done) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background via-secondary/10 to-background">
      <div className="border-b border-border/60 bg-card/30 px-6 py-4">
        <p className="text-sm font-semibold">{BRAND_NAME}</p>
        <p className="text-xs text-muted-foreground">AI-setup</p>
      </div>
      <AiSetupClient companyName={auth.company.name} />
    </div>
  );
}
