import { PageFrame } from "@/components/layout/page-frame";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <PageFrame title="Dashboard" subtitle="Gegevens laden…">
      <div className="space-y-8">
        <Skeleton className="cf-shimmer h-48 w-full rounded-3xl" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="cf-shimmer h-36 rounded-3xl" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="cf-shimmer h-32 rounded-3xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="cf-shimmer h-72 rounded-2xl lg:col-span-2" />
          <Skeleton className="cf-shimmer h-72 rounded-2xl" />
        </div>
      </div>
    </PageFrame>
  );
}
