"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell } from "lucide-react";
import type { AppNotification } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markAllNotificationsRead, markNotificationRead } from "@/actions/notifications";
import { cn } from "@/lib/utils";

export function NotificationBell({
  initial,
}: {
  initial: AppNotification[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const unread = initial.filter((n) => !n.read_at).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
          aria-label="Meldingen"
        >
          <Bell className="size-5" />
          {unread > 0 ? (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Meldingen</span>
          {unread > 0 ? (
            <button
              type="button"
              className="text-xs font-normal text-primary hover:underline"
              disabled={pending}
              onClick={() => {
                start(async () => {
                  await markAllNotificationsRead();
                  router.refresh();
                });
              }}
            >
              Alles als gelezen
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {initial.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Je bent helemaal bij.
          </p>
        ) : (
          initial.slice(0, 12).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-0.5 py-2",
                !n.read_at && "bg-primary/5",
              )}
              onClick={() => {
                start(async () => {
                  if (!n.read_at) await markNotificationRead(n.id);
                  router.refresh();
                });
              }}
            >
              <span className="text-xs font-semibold">{n.title}</span>
              {n.body ? (
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {n.body}
                </span>
              ) : null}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
