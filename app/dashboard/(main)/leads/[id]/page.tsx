import { notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchLeadDetail } from "@/lib/queries/lead-detail";
import { PageFrame } from "@/components/layout/page-frame";
import { LeadWorkspace } from "@/components/leads/lead-workspace";
import { getDemoLeadDetail, getDemoSla } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { analyzeSla } from "@/lib/queries/sla";

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const detail = demo
    ? getDemoLeadDetail(params.id)
    : await fetchLeadDetail(supabase, auth.company.id, params.id);
  if (!detail) notFound();

  const sla = demo ? getDemoSla() : await analyzeSla(supabase, auth.company.id);
  const staleReply = sla.staleReplyLeadIds.has(params.id);

  return (
    <PageFrame
      title={detail.lead.full_name}
      subtitle="Sneller sluiten — één scherm voor inzicht, opvolging en vervolgstappen."
    >
      <LeadWorkspace
        initial={detail}
        staleReply={staleReply}
        demoMode={demo}
      />
    </PageFrame>
  );
}
