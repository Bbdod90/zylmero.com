"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Gauge,
  Inbox,
  LayoutGrid,
  LogOut,
  Settings2,
  Sparkles,
  Users,
  FileText,
  Zap,
  CreditCard,
  Rocket,
  Target,
  Kanban,
  UsersRound,
  ClipboardList,
  Brain,
} from "lucide-react";
import type { AppNotification } from "@/lib/types";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/actions/auth";
import { DemoModeToggle } from "@/components/sales/demo-mode-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";

type NavItem = { href: string; label: string; icon: typeof Gauge };

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overzicht",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Gauge },
      { href: "/dashboard/insights", label: "Prestaties", icon: BarChart3 },
    ],
  },
  {
    title: "Pipeline",
    items: [
      { href: "/dashboard/growth", label: "Groei", icon: Rocket },
      { href: "/dashboard/pipeline", label: "Pipeline", icon: Kanban },
      { href: "/dashboard/leads", label: "Leads", icon: Users },
      { href: "/dashboard/inbox", label: "Berichten", icon: Inbox },
      { href: "/dashboard/quotes", label: "Offertes", icon: FileText },
      { href: "/dashboard/appointments", label: "Afspraken", icon: CalendarDays },
    ],
  },
  {
    title: "AI & klanten",
    items: [
      { href: "/dashboard/ai-koppelingen", label: "AI & koppelingen", icon: Brain },
      { href: "/dashboard/playbooks", label: "Playbooks", icon: BookOpen },
    ],
  },
  {
    title: "Automatisering",
    items: [{ href: "/dashboard/automations", label: "Automatiseringen", icon: Zap }],
  },
  {
    title: "Bedrijf",
    items: [
      { href: "/dashboard/team", label: "Team", icon: UsersRound },
      {
        href: "/dashboard/templates",
        label: "Snelle antwoorden",
        icon: ClipboardList,
      },
      { href: "/dashboard/settings", label: "Instellingen", icon: Settings2 },
      { href: "/dashboard/ai", label: "AI-instellingen", icon: Sparkles },
    ],
  },
];

/** Kortere zijbalk voor anonieme demo-rondleiding (minder keuzestress). */
const ANONYMOUS_PREVIEW_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Demo",
    items: [
      { href: "/dashboard", label: "Overzicht", icon: Gauge },
      { href: "/dashboard/inbox", label: "Berichten", icon: Inbox },
      { href: "/dashboard/pipeline", label: "Pipeline", icon: Kanban },
      { href: "/dashboard/leads", label: "Leads", icon: Users },
      { href: "/dashboard/quotes", label: "Offertes", icon: FileText },
      { href: "/dashboard/appointments", label: "Afspraken", icon: CalendarDays },
    ],
  },
  {
    title: "AI voor klanten",
    items: [
      { href: "/dashboard/ai-koppelingen", label: "AI & koppelingen", icon: Brain },
      { href: "/dashboard/ai-knowledge", label: "AI-kennis (detail)", icon: Sparkles },
    ],
  },
];

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
  const active =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));
  return (
    <Link
      href={item.href}
      onClick={() => onNavigate?.()}
      className={cn(
        "group relative flex min-h-11 touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8125rem] font-medium transition-all duration-200 active:scale-[0.99]",
        active
          ? "bg-primary/[0.09] text-foreground shadow-sm ring-1 ring-primary/15 before:absolute before:left-0 before:top-1/2 before:h-8 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary dark:bg-white/[0.07] dark:ring-white/[0.08] dark:before:bg-primary"
          : "text-muted-foreground hover:bg-muted/55 hover:text-foreground dark:hover:bg-white/[0.045]",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
          active
            ? "border-primary/20 bg-background/80 text-primary dark:border-white/[0.1] dark:bg-black/20 dark:text-primary"
            : "border-transparent bg-muted/25 text-muted-foreground group-hover:border-border/60 group-hover:bg-background/60 group-hover:text-foreground dark:bg-white/[0.04]",
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
  founderSales?: boolean;
  /** Root <aside> (bijv. `hidden lg:flex` voor desktop-only) */
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
  founderSales = false,
  className,
  onNavLinkClick,
  hideNotificationBell = false,
}: AppSidebarProps) {
  const pathname = usePathname();

  const baseGroups = isAnonymousPreview ? ANONYMOUS_PREVIEW_GROUPS : GROUPS;

  const groups = baseGroups.map((g) => {
    if (g.title !== "Pipeline" || isAnonymousPreview) return g;
    const items = [...g.items];
    if (founderSales) {
      items.splice(1, 0, {
        href: "/dashboard/sales",
        label: "Verkoop",
        icon: Target,
      });
    }
    return { ...g, items };
  });

  const showAccountUpgrade = trialDaysLeft == null || trialDaysLeft <= 0;

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-dvh max-h-dvh w-full min-w-0 shrink-0 flex-col",
        "border-r border-border/60 bg-gradient-to-b from-card via-background/98 to-muted/[0.28]",
        "shadow-[inset_-1px_0_0_hsl(220_14%_76%/0.45)] backdrop-blur-xl",
        "dark:border-white/[0.07] dark:from-[hsl(222_26%_8%/0.92)] dark:via-background dark:to-muted/5 dark:shadow-[inset_-1px_0_0_hsl(220_16%_18%/0.45)]",
        "lg:w-[17rem]",
        className,
      )}
    >
      <div className="flex min-h-[3.75rem] items-center gap-3 border-b border-border/55 px-3 py-3.5 sm:min-h-[4rem] sm:px-4 dark:border-white/[0.06]">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/12 to-accent/10 shadow-[0_8px_24px_-12px_hsl(222_48%_32%/0.35)] ring-1 ring-border/55 dark:from-primary/30 dark:ring-white/[0.08]">
          <LayoutGrid className="size-[1.125rem] text-primary" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
            {companyName}
          </p>
          <p className="text-2xs text-muted-foreground">{BRAND_NAME}</p>
          {trialDaysLeft != null && trialDaysLeft > 0 ? (
            <p className="mt-1.5 text-2xs font-medium leading-snug text-amber-900 dark:text-amber-200">
              Proefperiode · nog {trialDaysLeft} {trialDaysLeft === 1 ? "dag" : "dagen"}
            </p>
          ) : null}
        </div>
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
      <nav className="flex flex-1 flex-col gap-0 overflow-y-auto overscroll-contain px-2.5 py-3 sm:px-3">
        {groups.map((group, gi) => (
          <div
            key={group.title}
            className={cn(
              gi > 0 && "mt-4 border-t border-border/45 pt-4 dark:border-white/[0.06]",
            )}
          >
            <p className="mb-2 px-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground/90">
              {group.title}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={onNavLinkClick}
                />
              ))}
            </div>
          </div>
        ))}
        {showAccountUpgrade ? (
          <div className="mt-4 border-t border-border/45 pt-4 dark:border-white/[0.06]">
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
      {!isAnonymousPreview ? (
        <div className="border-t border-border/50 bg-muted/[0.15] px-2 py-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <DemoModeToggle active={demoActive} forced={demoForced} />
        </div>
      ) : null}
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
