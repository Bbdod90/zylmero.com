"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  isToday,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { nl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppointmentStatusSelect } from "@/components/appointments/appointment-status-select";

export type AgendaAppointment = Appointment & {
  lead_name: string | null;
};

export function AppointmentsWeekAgenda({
  items,
  demoMode,
}: {
  items: AgendaAppointment[];
  demoMode: boolean;
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  const { weekStart, weekEnd, days, labelRange } = useMemo(() => {
    const anchor = addWeeks(new Date(), weekOffset);
    const ws = startOfWeek(anchor, { weekStartsOn: 1 });
    const we = endOfWeek(anchor, { weekStartsOn: 1 });
    const dayList = eachDayOfInterval({ start: ws, end: we });
    const labelRange = `${format(ws, "d MMM", { locale: nl })} – ${format(we, "d MMMM yyyy", { locale: nl })}`;
    return { weekStart: ws, weekEnd: we, days: dayList, labelRange };
  }, [weekOffset]);

  const visible = useMemo(() => {
    const from = startOfDay(weekStart).getTime();
    const to = endOfDay(weekEnd).getTime();
    return items.filter((a) => {
      const t = new Date(a.starts_at).getTime();
      return t >= from && t <= to;
    });
  }, [items, weekStart, weekEnd]);

  const byDay = useMemo(() => {
    const map = new Map<string, AgendaAppointment[]>();
    for (const d of days) {
      map.set(format(d, "yyyy-MM-dd"), []);
    }
    for (const a of visible) {
      const key = format(new Date(a.starts_at), "yyyy-MM-dd");
      if (!map.has(key)) continue;
      map.get(key)!.push(a);
    }
    Array.from(map.values()).forEach((list) => {
      list.sort(
        (x, y) =>
          new Date(x.starts_at).getTime() - new Date(y.starts_at).getTime(),
      );
    });
    return map;
  }, [visible, days]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/50 bg-muted/20 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Vorige week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Volgende week"
          >
            <ChevronRight className="size-4" />
          </Button>
          <p className="text-sm font-semibold tracking-tight text-foreground">{labelRange}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-xl"
          onClick={() => setWeekOffset(0)}
        >
          Deze week
        </Button>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const list = byDay.get(key) || [];
          const today = isToday(day);
          return (
            <div
              key={key}
              className={cn(
                "group flex min-h-[220px] w-[min(76vw,220px)] min-w-[190px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow",
                "border-border/60 dark:border-white/[0.1] dark:bg-[hsl(228_24%_8%/0.85)]",
                today && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background dark:ring-offset-background",
              )}
            >
              <div
                className={cn(
                  "border-b px-3 py-3 dark:border-white/[0.08]",
                  today
                    ? "bg-gradient-to-br from-primary/15 to-primary/[0.04]"
                    : "bg-gradient-to-br from-muted/50 to-transparent dark:from-white/[0.04]",
                )}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {format(day, "EEEE", { locale: nl })}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-lg font-bold tabular-nums tracking-tight",
                    today ? "text-primary" : "text-foreground",
                  )}
                >
                  {format(day, "d MMM", { locale: nl })}
                </p>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2.5">
                {list.length === 0 ? (
                  <p className="py-6 text-center text-2xs text-muted-foreground">Geen afspraken</p>
                ) : (
                  list.map((a) => (
                    <div
                      key={a.id}
                      className="overflow-hidden rounded-xl border border-border/50 bg-background/90 p-2.5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="shrink-0 font-mono text-[0.65rem] font-semibold tabular-nums text-muted-foreground">
                            {format(new Date(a.starts_at), "HH:mm")}
                          </span>
                          <div className="min-w-0 shrink">
                            <AppointmentStatusSelect
                              appointmentId={a.id}
                              current={a.status}
                              demoMode={demoMode}
                            />
                          </div>
                        </div>
                        {a.lead_id && a.lead_name ? (
                          <Link
                            href={`/dashboard/leads/${a.lead_id}`}
                            className="block truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
                            title={a.lead_name}
                          >
                            {a.lead_name}
                          </Link>
                        ) : (
                          <p className="truncate text-sm text-muted-foreground">Geen lead</p>
                        )}
                        {a.notes ? (
                          <p className="line-clamp-2 text-2xs leading-relaxed text-muted-foreground">{a.notes}</p>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
