"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSidebar, type AppSidebarProps } from "@/components/layout/sidebar";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-dvh w-full max-w-[100vw] bg-background">
      <AppSidebar
        {...sidebarProps}
        className="sticky top-0 z-20 hidden h-dvh max-h-dvh lg:flex"
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "sticky top-0 z-30 flex items-center gap-2 border-b border-border/55 bg-background/90 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 dark:border-white/[0.06] lg:hidden",
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

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent
          aria-describedby={undefined}
          className={cn(
            "fixed left-0 top-0 z-50 flex h-dvh max-h-dvh w-[min(19.5rem,calc(100vw-0.75rem))] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border border-border/60 border-l-0 bg-background p-0 shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:w-[17.25rem]",
            "rounded-none pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)]",
          )}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>
          <AppSidebar
            {...sidebarProps}
            className="flex h-full max-h-dvh w-full border-0 bg-transparent shadow-none backdrop-blur-none dark:bg-transparent"
            hideNotificationBell
            onNavLinkClick={() => setMobileNavOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
