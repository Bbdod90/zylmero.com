"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_FLAT } from "@/lib/navigation/dashboard-nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Op smalle schermen (o.a. ingebouwde IDE-browser) blijft het hoofdmenu zichtbaar
 * als smalle icoon-kolom; het volledige zijpaneel opent via het hamburger-menu.
 */
export function DashboardNavRail({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hoofdmenu"
      className={cn(
        "flex h-dvh w-[3.35rem] shrink-0 flex-col gap-1 border-r py-2",
        "border-border/70 bg-card/95 backdrop-blur-md",
        "dark:border-white/[0.14] dark:bg-[hsl(222_26%_11%)]",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-0 py-1">
        {DASHBOARD_NAV_FLAT.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "mx-auto flex size-11 shrink-0 items-center justify-center rounded-xl border text-sm transition-colors",
                active
                  ? "border-primary/35 bg-primary/[0.18] text-primary shadow-sm dark:border-primary/40 dark:bg-primary/[0.22] dark:text-primary"
                  : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/60 hover:text-foreground dark:text-white/65 dark:hover:border-white/[0.12] dark:hover:bg-white/[0.08] dark:hover:text-white",
              )}
            >
              <Icon className="size-[1.15rem]" strokeWidth={2} aria-hidden />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
