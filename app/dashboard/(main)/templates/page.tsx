import { getAuth } from "@/lib/auth";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { ReplyTemplatesPanel } from "@/components/templates/reply-templates-panel";
import { listReplyTemplates } from "@/actions/reply-templates";

export default async function TemplatesPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const items = await listReplyTemplates();

  return (
    <PageFrame
      title="Snelle antwoorden"
      subtitle="Templates voor bevestigingen, prijsindicaties en follow-up — invoegen in de inbox."
    >
      <DashboardWorkSurface>
        <ReplyTemplatesPanel items={items} />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
