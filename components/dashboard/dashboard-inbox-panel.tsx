import Link from "next/link";
import { ProDashboardCard } from "@/components/dashboard/pro-dashboard-card";
import { RecentMessagesFeed } from "@/components/dashboard/recent-messages-feed";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function DashboardInboxPanel({
  messages,
}: {
  messages: {
    id: string;
    content: string;
    lead_name: string | null;
    created_at: string;
  }[];
}) {
  return (
    <ProDashboardCard
      eyebrow="Berichten"
      title="Laatste berichten"
      action={
        <Button variant="ghost" size="sm" className="h-8 rounded-full px-2 text-2xs" asChild>
          <Link href="/dashboard/inbox">
            Alles bekijken
            <ArrowRight className="ml-1 size-3.5" aria-hidden />
          </Link>
        </Button>
      }
    >
      <RecentMessagesFeed messages={messages} />
    </ProDashboardCard>
  );
}
