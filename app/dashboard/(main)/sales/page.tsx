import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isFounderUser } from "@/lib/founder/access";
import { fetchFounderSalesBundle } from "@/lib/queries/founder-sales";
import { PageFrame } from "@/components/layout/page-frame";
import { FounderSalesDashboard } from "@/components/founder-sales/founder-sales-dashboard";

export default async function FounderSalesPage() {
  const auth = await getAuth();
  if (!auth.user) redirect("/login");
  const supabase = await createClient();
  const founder = await isFounderUser(supabase, auth.user.id);
  if (!founder) redirect("/dashboard");

  const bundle = await fetchFounderSalesBundle(supabase);

  return (
    <PageFrame
      title="Founder-verkoop"
      subtitle="Interne outreach — volgen, opvolgen, sluiten."
    >
      <FounderSalesDashboard initial={bundle} />
    </PageFrame>
  );
}
