import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

export function TopBar({
  title,
  subtitle,
  dismissHref,
  dismissLabel = "Terug naar dashboard",
}: {
  title: string;
  subtitle?: string;
  /** Sluit deze pagina (bijv. Groei) en ga terug naar het dashboard */
  dismissHref?: string;
  dismissLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/68 dark:border-white/[0.08] dark:bg-[hsl(228_32%_4%/0.82)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/35 to-transparent dark:via-white/[0.06]" />
      <div className="mx-auto flex min-h-[3.5rem] max-w-[1200px] items-center justify-between gap-3 px-safe py-2 sm:min-h-[3.65rem] sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          {dismissHref ? (
            <Link
              href={dismissHref}
              className={cn(
                "group mt-0.5 flex shrink-0 items-center gap-2 rounded-xl border border-border/55 bg-muted/25 px-2.5 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-all",
                "hover:border-primary/28 hover:bg-primary/[0.07] hover:text-foreground hover:shadow-md",
                "dark:border-white/[0.09] dark:bg-white/[0.04] dark:hover:bg-white/[0.07]",
              )}
              aria-label={dismissLabel}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-background/90 ring-1 ring-border/55 dark:bg-card/90 dark:ring-white/[0.08]">
                <ChevronLeft className="size-[1.05rem] opacity-80 transition-transform group-hover:-translate-x-0.5 group-hover:opacity-100" />
              </span>
              <span className="max-w-[14rem] truncate leading-tight">
                {dismissLabel}
              </span>
            </Link>
          ) : null}
          <div className="min-w-0 flex-1 space-y-1.5">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-2xl sm:font-medium sm:tracking-[-0.02em]">
              {title}
            </h1>
            {subtitle ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:max-w-2xl">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant="outline"
            className="hidden rounded-full border-border/60 bg-muted/40 px-2.5 py-0.5 text-2xs font-medium uppercase tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white/55 sm:inline-flex"
          >
            Workspace
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
