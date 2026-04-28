import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Max-width shell for dashboard “werk”-pagina’s — zelfde ritme als dashboard/instellingen. */
export function DashboardWorkSurface({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  /** Ruimer canvas (o.a. chatbot met preview naast formulier). */
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-9 sm:space-y-10",
        wide ? "max-w-[1536px]" : "max-w-[1200px]",
        "rounded-[1.5rem] border border-border/50 bg-gradient-to-b from-card/90 via-background/40 to-background/20 p-3 shadow-[0_1px_0_0_hsl(0_0%_100%/0.65)_inset,0_24px_64px_-48px_hsl(222_47%_11%/0.18)] sm:p-4 lg:p-5",
        "dark:border-white/[0.08] dark:from-[hsl(222_28%_12%/0.5)] dark:via-transparent dark:shadow-[0_1px_0_0_hsl(220_16%_22%/0.4)_inset,0_24px_64px_-40px_rgb(0_0_0/0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
