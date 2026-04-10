import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const shimmer = className?.includes("cf-shimmer");
  return (
    <div
      className={cn(
        "rounded-md",
        shimmer ? "cf-shimmer min-h-[1em]" : "animate-pulse bg-muted/50",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
