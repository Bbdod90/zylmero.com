import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 dark:border-white/[0.06] dark:bg-background/[0.82]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <div className="mx-auto flex min-h-[3.75rem] max-w-[1580px] items-center justify-between gap-3 px-safe py-2.5 sm:min-h-[4rem] sm:gap-4 sm:px-7 lg:px-12">
        <div className="min-w-0 space-y-2">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground sm:max-w-2xl">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant="muted"
            className="hidden rounded-full border-primary/18 bg-primary/[0.06] px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-[0.16em] text-primary dark:border-primary/22 dark:bg-primary/[0.08] dark:text-primary sm:inline-flex"
          >
            Live
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
