"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSidebar, type AppSidebarProps } from "@/components/layout/sidebar";
import { DashboardNavRail } from "@/components/layout/dashboard-nav-rail";
import { CommandPalette } from "@/components/layout/command-palette";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  sidebarProps,
}: {
  children: ReactNode;
  sidebarProps: AppSidebarProps;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  /** Volledig menu sluiten bij navigatie (o.a. links in de icoon-rail naast dit paneel). */
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh w-full max-w-[100vw] bg-background">
      <CommandPalette />
      <DashboardNavRail className="md:hidden" />
      <AppSidebar
        {...sidebarProps}
        className="sticky top-0 z-20 hidden h-dvh max-h-dvh md:flex"
      />
      <div className="relative zm-landing-atmosphere flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 zm-landing-spotlight opacity-[0.6] dark:opacity-[0.8]" />
          <div className="absolute inset-0 zm-landing-edge-glow opacity-50 dark:opacity-[0.7]" />
          <div className="absolute inset-0 zm-landing-radial-fade opacity-55 dark:opacity-[0.65]" />
          <div className="absolute inset-0 zm-landing-dots opacity-[0.35] dark:opacity-[0.28]" />
          <div className="cf-landing-grain absolute inset-0" aria-hidden />
        </div>
        <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "sticky top-0 z-30 flex items-center gap-2 border-b border-border/55 bg-background/92 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/78 dark:border-white/[0.08] md:hidden",
            "pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(0.5rem,env(safe-area-inset-top))]",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 touch-manipulation rounded-xl"
            aria-label="Menu openen"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">
              {sidebarProps.companyName}
            </p>
            <p className="truncate text-2xs text-muted-foreground">{BRAND_NAME}</p>
          </div>
          {!sidebarProps.isAnonymousPreview ? (
            <NotificationBell initial={sidebarProps.notifications ?? []} />
          ) : null}
          <ThemeToggle className="shrink-0" />
        </header>
        {children}
        </div>
      </div>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent
          aria-describedby={undefined}
          hideCloseButton
          className={cn(
            "fixed left-0 top-0 z-[101] flex h-dvh max-h-dvh w-[min(19.5rem,calc(100vw-0.75rem))] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border border-border/60 border-l-0 bg-background p-0 shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:w-[17.25rem]",
            "rounded-none pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)]",
          )}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border/55 bg-muted/30 px-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
            <DialogTitle className="text-sm font-semibold leading-none">
              Menu
            </DialogTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 rounded-lg"
              onClick={() => setMobileNavOpen(false)}
            >
              Sluiten
            </Button>
          </div>
          <AppSidebar
            {...sidebarProps}
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-y-auto border-0 bg-transparent shadow-none backdrop-blur-none dark:bg-transparent",
              "!h-auto max-h-full min-h-0",
            )}
            hideNotificationBell
            onNavLinkClick={() => setMobileNavOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
