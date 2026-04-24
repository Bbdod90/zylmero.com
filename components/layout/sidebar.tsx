"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LogOut, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppNotification } from "@/lib/types";
import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/actions/auth";
import { DemoModeToggle } from "@/components/sales/demo-mode-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { DASHBOARD_NAV_GROUPS } from "@/lib/navigation/dashboard-nav";

type NavItem = { href: string; label: string; icon: LucideIcon };

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const active = isNavActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={() => onNavigate?.()}
      className={cn(
        "group relative flex min-h-11 touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8125rem] font-medium transition-all duration-200 active:scale-[0.99]",
        active
          ? "bg-primary/[0.09] text-foreground shadow-sm ring-1 ring-primary/15 before:absolute before:left-0 before:top-1/2 before:h-8 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary dark:bg-white/[0.08] dark:ring-white/[0.12] dark:before:bg-primary"
          : "text-muted-foreground hover:bg-muted/55 hover:text-foreground dark:text-white/72 dark:hover:bg-white/[0.07] dark:hover:text-white",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
          active
            ? "border-primary/20 bg-background/80 text-primary dark:border-white/[0.1] dark:bg-black/20 dark:text-primary"
            : "border-transparent bg-muted/25 text-muted-foreground group-hover:border-border/60 group-hover:bg-background/60 group-hover:text-foreground dark:bg-white/[0.06] dark:text-white/70 dark:group-hover:text-white",
        )}
      >
        <Icon className="size-[1.0625rem]" strokeWidth={2} />
      </span>
      <span className="min-w-0 truncate">{item.label}</span>
    </Link>
  );
}

export type AppSidebarProps = {
  companyName: string;
  demoActive: boolean;
  demoForced: boolean;
  trialDaysLeft?: number | null;
  isAnonymousPreview?: boolean;
  notifications?: AppNotification[];
  /** Root <aside> (bijv. `hidden md:flex` — smalle schermen: zie `DashboardNavRail`) */
  className?: string;
  /** Sluit mobiel menu na navigatie */
  onNavLinkClick?: () => void;
  /** Verberg bel in zijbalk (bijv. mobiele header toont al meldingen) */
  hideNotificationBell?: boolean;
};

export function AppSidebar({
  companyName,
  demoActive,
  demoForced,
  trialDaysLeft,
  isAnonymousPreview,
  notifications = [],
  className,
  onNavLinkClick,
  hideNotificationBell = false,
}: AppSidebarProps) {
  const pathname = usePathname();

  const showAccountUpgrade = trialDaysLeft == null || trialDaysLeft <= 0;

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-dvh max-h-dvh w-full min-w-0 shrink-0 flex-col",
        "border-r border-border/70 bg-gradient-to-b from-card via-background/98 to-muted/[0.28]",
        "shadow-[inset_-1px_0_0_hsl(220_14%_76%/0.45)] backdrop-blur-xl",
        "dark:border-white/[0.14] dark:bg-[hsl(222_26%_11%)] dark:from-[hsl(222_26%_11%)] dark:via-[hsl(222_26%_10%)] dark:to-[hsl(222_28%_9%)] dark:shadow-[inset_-1px_0_0_hsl(220_16%_22%/0.55)]",
        "md:w-[17rem]",
        className,
      )}
    >
      <div className="flex min-h-[3.75rem] items-center gap-3 border-b border-border/55 px-3 py-3.5 sm:min-h-[4rem] sm:px-4 dark:border-white/[0.06]">
        <Link
          href="/dashboard"
          onClick={() => onNavLinkClick?.()}
          className="group flex min-w-0 flex-1 items-center gap-3"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-[11px] font-bold text-primary-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
              {companyName}
            </p>
            <p className="text-2xs text-muted-foreground">{BRAND_NAME}</p>
            {trialDaysLeft != null && trialDaysLeft > 0 ? (
              <p className="mt-1.5 text-2xs font-medium leading-snug text-amber-900 dark:text-amber-200">
                Proefperiode · nog {trialDaysLeft}{" "}
                {trialDaysLeft === 1 ? "dag" : "dagen"}
              </p>
            ) : null}
          </div>
        </Link>
        {!isAnonymousPreview && !hideNotificationBell ? (
          <NotificationBell initial={notifications} />
        ) : null}
      </div>
      {trialDaysLeft != null && trialDaysLeft > 0 ? (
        <div className="border-b border-border/50 px-3 pb-3.5 pt-2 sm:px-4 dark:border-white/[0.05]">
          <Link
            href="/dashboard/upgrade"
            onClick={() => onNavLinkClick?.()}
            className="flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.08] px-3 py-2.5 text-xs font-semibold text-primary shadow-sm transition-all hover:border-primary/35 hover:bg-primary/[0.12] active:scale-[0.99] dark:border-primary/30 dark:bg-primary/[0.14] dark:text-foreground dark:hover:bg-primary/[0.2]"
          >
            <CreditCard className="size-3.5 shrink-0 opacity-90" />
            Abonnement & betaling
          </Link>
        </div>
      ) : null}
      <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-2.5 py-4 sm:px-3">
        {DASHBOARD_NAV_GROUPS.map((group) => (
          <div key={group.id} className="flex flex-col gap-1">
            <p className="px-3 pb-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground/85">
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onNavLinkClick}
              />
            ))}
          </div>
        ))}
        {showAccountUpgrade ? (
          <div className="mt-auto border-t border-border/45 pt-4 dark:border-white/[0.06]">
            <p className="mb-2 px-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground/90">
              Account
            </p>
            <Link
              href="/dashboard/upgrade"
              onClick={() => onNavLinkClick?.()}
              className={cn(
                "group relative flex min-h-11 touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8125rem] font-medium transition-all duration-200 active:scale-[0.99]",
                pathname === "/dashboard/upgrade"
                  ? "bg-primary/[0.09] text-foreground shadow-sm ring-1 ring-primary/15 before:absolute before:left-0 before:top-1/2 before:h-8 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary dark:bg-white/[0.07]"
                  : "text-muted-foreground hover:bg-muted/55 hover:text-foreground dark:hover:bg-white/[0.045]",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                  pathname === "/dashboard/upgrade"
                    ? "border-primary/20 bg-background/80 text-primary dark:border-white/[0.1]"
                    : "border-transparent bg-muted/25 text-muted-foreground group-hover:border-border/60 group-hover:bg-background/60 group-hover:text-foreground dark:bg-white/[0.04]",
                )}
              >
                <CreditCard className="size-[1.0625rem]" strokeWidth={2} />
              </span>
              <span className="min-w-0 truncate">Upgrade</span>
            </Link>
          </div>
        ) : null}
      </nav>
      <div className="border-t border-border/50 bg-muted/[0.15] px-2 py-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
        <Link
          href="/dashboard/settings"
          onClick={() => onNavLinkClick?.()}
          className={cn(
            "mb-1.5 flex min-h-8 items-center gap-1.5 rounded-md px-2 py-1.5 text-2xs font-medium text-muted-foreground/80 transition-colors hover:bg-muted/40 hover:text-muted-foreground dark:text-white/45 dark:hover:bg-white/[0.04] dark:hover:text-white/70",
            isNavActive(pathname, "/dashboard/settings") &&
              "text-foreground/90 dark:text-white/80",
          )}
        >
          <Settings2 className="size-3 shrink-0 opacity-70" aria-hidden />
          Instellingen
        </Link>
        {!isAnonymousPreview ? (
          <DemoModeToggle active={demoActive} forced={demoForced} />
        ) : null}
      </div>
      <form
        action={signOutAction}
        className="border-t border-border/60 bg-background/60 p-3 dark:border-white/[0.06] dark:bg-card/30 sm:p-4"
      >
        <button
          type="submit"
          className="flex min-h-11 w-full touch-manipulation items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-border/60 hover:bg-muted/50 hover:text-foreground active:scale-[0.99] dark:hover:bg-white/[0.05]"
        >
          <LogOut className="size-4 shrink-0 opacity-80" />
          {isAnonymousPreview ? "Demo verlaten" : "Uitloggen"}
        </button>
      </form>
    </aside>
  );
}
