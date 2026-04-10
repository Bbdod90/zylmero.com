import { cn } from "@/lib/utils";

export function HighValueBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-primary/30 bg-primary/[0.1] px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide text-primary",
        className,
      )}
    >
      Hoge waarde
    </span>
  );
}
