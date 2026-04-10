import type { ReactNode } from "react";
import { TopBar } from "@/components/layout/top-bar";

export function PageFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <>
      <TopBar title={title} subtitle={subtitle} />
      <div className="mx-auto w-full max-w-[1580px] flex-1 space-y-8 px-4 py-7 sm:space-y-11 sm:px-7 sm:py-9 lg:px-12 lg:py-11">
        {children}
      </div>
    </>
  );
}
