"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";

export function DashboardCommandBar({
  leadCount,
  revenuePotential,
  conversionPct,
}: {
  leadCount: number;
  revenuePotential: number;
  conversionPct: number;
}) {
  const pathname = usePathname();
  const tab = (href: string, label: string) => {
    const on = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={cn(
          "min-h-[44px] rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
          on ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="cf-dashboard-panel rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Leads</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-foreground">{leadCount}</p>
        </div>
        <div className="cf-dashboard-panel rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Omzetpotentie</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-primary">{formatCurrency(revenuePotential)}</p>
        </div>
        <div className="cf-dashboard-panel rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conversie</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-foreground">{conversionPct}%</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-muted/20 p-2 dark:border-white/[0.08]">
        {tab("/dashboard/inbox", "Inbox")}
        {tab("/dashboard/pipeline", "Pipeline")}
      </div>
    </div>
  );
}
