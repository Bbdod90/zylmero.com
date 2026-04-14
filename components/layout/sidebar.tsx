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
        "group relative flex min-h-11 touch-manipulation items-center gap-3 rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors duration-200 active:bg-muted/50",
        active
          ? "bg-muted/90 text-foreground before:absolute before:left-0 before:top-1/2 before:h-7 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary dark:bg-white/[0.06]"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground dark:hover:bg-white/[0.04]",
      )}
    >
      <Icon
        className={cn(
          "size-[1.125rem] shrink-0 transition-colors",
          active
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      />
      {item.label}
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

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-dvh max-h-dvh w-full min-w-0 shrink-0 flex-col border-r border-border/55 bg-background/80 backdrop-blur-md dark:border-white/[0.06] dark:bg-card/40 lg:w-[16.25rem]",
        className,
      )}
    >
      <div className="flex min-h-[3.75rem] items-center gap-2.5 border-b border-border/55 px-3 py-3 sm:min-h-[4rem] sm:px-4 sm:py-3.5 dark:border-white/[0.06]">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/22 to-accent/12 shadow-inner-soft ring-1 ring-border/50 dark:from-primary/28 dark:ring-white/[0.07]">
          <LayoutGrid className="size-[1.0625rem] text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
            {companyName}
          </p>
          <p className="text-2xs text-muted-foreground">{BRAND_NAME}</p>
          {trialDaysLeft != null && trialDaysLeft > 0 ? (
            <p className="mt-1.5 text-2xs font-medium text-amber-400/95">
              Proefperiode · nog {trialDaysLeft}{" "}
              {trialDaysLeft === 1 ? "dag" : "dagen"}
            </p>
          ) : null}
        </div>
        {!isAnonymousPreview && !hideNotificationBell ? (
          <NotificationBell initial={notifications} />
        ) : null}
      </div>
      {trialDaysLeft != null && trialDaysLeft > 0 ? (
        <div className="border-b border-border/50 px-4 pb-4 pt-2 dark:border-white/[0.05]">
          <Link
            href="/dashboard/upgrade"
            onClick={() => onNavLinkClick?.()}
            className="flex min-h-11 touch-manipulation items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] px-3.5 py-2.5 text-2xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <CreditCard className="size-3.5 shrink-0" />
            Bekijk abonnementen
          </Link>
        </div>
      ) : null}
      <nav className="flex flex-1 flex-col gap-0 overflow-y-auto px-2.5 py-3">
        {groups.map((group, gi) => (
          <div
            key={group.title}
            className={cn(
              gi > 0 && "mt-5 border-t border-border/50 pt-5 dark:border-white/[0.05]",
            )}
          >
            <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
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
        <div className="mt-5 border-t border-border/50 pt-5 dark:border-white/[0.05]">
          <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Account
          </p>
          <Link
            href="/dashboard/upgrade"
            onClick={() => onNavLinkClick?.()}
            className={cn(
              "group flex min-h-11 touch-manipulation items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
              pathname === "/dashboard/upgrade"
                ? "bg-primary/12 text-foreground dark:bg-white/[0.08]"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:hover:bg-white/[0.04]",
            )}
          >
            <CreditCard
              className={cn(
                "size-[1.125rem] shrink-0",
                pathname === "/dashboard/upgrade"
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            Upgrade
          </Link>
        </div>
      </nav>
      {!isAnonymousPreview ? (
        <DemoModeToggle active={demoActive} forced={demoForced} />
      ) : null}
      <form action={signOutAction} className="border-t border-border/60 p-4 dark:border-white/[0.06]">
        <button
          type="submit"
          className="flex min-h-12 w-full touch-manipulation items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground dark:hover:bg-white/[0.04]"
        >
          <LogOut className="size-4" />
          {isAnonymousPreview ? "Demo verlaten" : "Uitloggen"}
        </button>
      </form>
    </aside>
  );
}
