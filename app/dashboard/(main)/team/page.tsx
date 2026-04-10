import { getAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageFrame } from "@/components/layout/page-frame";
import { TeamWorkspace } from "@/components/team/team-workspace";
import { canManageTeam } from "@/lib/permissions";
import type { CompanyMemberRow } from "@/lib/types";

type MemberRow = CompanyMemberRow & { email: string | null };

export default async function TeamPage() {
  const auth = await getAuth();
  if (!auth.user || !auth.company || auth.companyRole == null) return null;

  const admin = createAdminClient();
  const { data: members } = await admin
    .from("company_members")
    .select("*")
    .eq("company_id", auth.company.id);

  const { data: invites } = await admin
    .from("company_invitations")
    .select("*")
    .eq("company_id", auth.company.id)
    .is("accepted_at", null);

  const ownerRes = await admin.auth.admin.getUserById(auth.company.owner_user_id);
  const ownerEmail = ownerRes.data.user?.email ?? null;

  const memberRows: MemberRow[] = await Promise.all(
    (members || []).map(async (m) => {
      const row = m as CompanyMemberRow;
      const u = await admin.auth.admin.getUserById(row.user_id);
      return {
        ...row,
        email: u.data.user?.email ?? null,
      };
    }),
  );

  return (
    <PageFrame
      title="Team"
      subtitle="Beheer rollen, uitnodigingen en activiteit — admins kunnen leden beheren."
    >
      <TeamWorkspace
        canManage={canManageTeam(auth.companyRole)}
        ownerEmail={ownerEmail}
        ownerId={auth.company.owner_user_id}
        currentUserId={auth.user.id}
        members={memberRows}
        invites={
          (invites || []) as {
            id: string;
            email: string;
            role: string;
            expires_at: string;
            token: string;
          }[]
        }
      />
    </PageFrame>
  );
}
