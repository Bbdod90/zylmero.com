import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceHome } from "@/components/dashboard/workspace-home";
import { fetchWorkspaceHomeSnapshot } from "@/lib/queries/workspace-home-snapshot";

export default async function DashboardPage() {
  const auth = await getAuth();
  if (!auth.company) return null;

  const supabase = await createClient();
  const snapshot = await fetchWorkspaceHomeSnapshot(supabase, auth.company.id);

  return (
    <WorkspaceHome companyName={auth.company.name} snapshot={snapshot} />
  );
}
