import { requireCompany } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchSocialConnections } from "@/lib/queries/social-connections";
import { metaAppConfigured } from "@/lib/oauth/meta";
import { googleCalendarConfigured } from "@/lib/oauth/google-calendar";
import { SocialHub } from "@/components/social/social-hub";

export default async function SocialsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { company, companyRole } = await requireCompany();
  const supabase = await createClient();
  const connections = await fetchSocialConnections(supabase, company.id);
  const metaConfigured = metaAppConfigured();
  const googleCalendarReady = googleCalendarConfigured();
  const isOwner = companyRole === "owner";

  const err = searchParams.error;
  const meta = searchParams.meta;
  const gcal = searchParams.gcal;
  const flashError = typeof err === "string" ? err : null;
  const flashOk = meta === "connected" || gcal === "connected";

  return (
    <main className="relative z-[1] mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <SocialHub
        connections={connections}
        metaConfigured={metaConfigured}
        googleCalendarConfigured={googleCalendarReady}
        flashError={flashError}
        flashOk={flashOk}
        isOwner={isOwner}
      />
    </main>
  );
}
