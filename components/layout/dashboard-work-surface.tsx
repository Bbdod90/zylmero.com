import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Max-width shell for dashboard “werk”-pagina’s — zelfde ritme als dashboard/instellingen. */
export function DashboardWorkSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1200px] space-y-9 sm:space-y-10",
        "rounded-[1.35rem] border border-border/35 bg-gradient-to-b from-background/50 via-background/35 to-transparent p-3 sm:p-4 lg:p-5",
        "dark:border-white/[0.06] dark:from-white/[0.02] dark:via-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}
