import type { ReactNode } from "react";
import { TopBar } from "@/components/layout/top-bar";

export function PageFrame({
  title,
  subtitle,
  children,
  dismissHref,
  dismissLabel,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  dismissHref?: string;
  dismissLabel?: string;
}) {
  return (
    <>
      <TopBar
        title={title}
        subtitle={subtitle}
        dismissHref={dismissHref}
        dismissLabel={dismissLabel}
      />
      <div className="relative mx-auto w-full max-w-[1200px] flex-1 px-safe py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-40 w-[min(100%,40rem)] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl dark:bg-primary/[0.12]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-[min(100%,30rem)] -translate-x-1/2 translate-y-1/3 rounded-full bg-primary/[0.05] blur-3xl dark:bg-indigo-500/[0.1]"
          aria-hidden
        />
        <div className="relative space-y-6 sm:space-y-8 lg:space-y-9">{children}</div>
      </div>
    </>
  );
}
