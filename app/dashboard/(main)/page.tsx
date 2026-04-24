import { getAuth } from "@/lib/auth";
import { WorkspaceHome } from "@/components/dashboard/workspace-home";

export default async function DashboardPage() {
  const auth = await getAuth();
  if (!auth.company) return null;

  return <WorkspaceHome companyName={auth.company.name} />;
}
