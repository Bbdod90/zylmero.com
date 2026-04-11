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
      <div className="relative mx-auto w-full max-w-[1580px] flex-1 px-safe py-7 sm:px-7 sm:py-9 lg:px-12 lg:py-11">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-56 w-[min(100%,42rem)] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl dark:bg-primary/[0.09]"
          aria-hidden
        />
        <div className="relative space-y-8 sm:space-y-11">{children}</div>
      </div>
    </>
  );
}
