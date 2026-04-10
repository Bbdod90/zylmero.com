"use client";

import { cn } from "@/lib/utils";
import { labelForAiTag } from "@/lib/lead-ai-tags";

const VARIANTS: Record<string, string> = {
  spoed:
    "border-rose-500/35 bg-rose-500/12 text-rose-200 dark:text-rose-100",
  hoge_waarde:
    "border-amber-500/35 bg-amber-500/10 text-amber-100 dark:text-amber-50",
  prijsvraag:
    "border-sky-500/35 bg-sky-500/10 text-sky-100 dark:text-sky-50",
  klacht:
    "border-violet-500/35 bg-violet-500/10 text-violet-100 dark:text-violet-50",
};

export function AiTagBadges({
  tags,
  className,
  size = "sm",
}: {
  tags: string[] | undefined | null;
  className?: string;
  size?: "sm" | "xs";
}) {
  const list = (tags || []).filter(Boolean);
  if (!list.length) return null;
  const text = size === "xs" ? "text-[10px]" : "text-2xs";
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {list.map((slug) => (
        <span
          key={slug}
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 font-semibold uppercase tracking-wide",
            text,
            VARIANTS[slug] ??
              "border-white/[0.12] bg-white/[0.05] text-muted-foreground",
          )}
        >
          {labelForAiTag(slug)}
        </span>
      ))}
    </div>
  );
}
