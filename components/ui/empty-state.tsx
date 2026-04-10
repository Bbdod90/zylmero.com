import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-white/[0.1] bg-muted/10 px-8 py-14 text-center",
        className,
      )}
    >
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner-soft ring-1 ring-primary/15">
        <Icon className="size-8" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
