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
    <div className={cn("mx-auto w-full max-w-[1200px] space-y-8", className)}>
      {children}
    </div>
  );
}
