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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {labelRange}
          </p>
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const list = byDay.get(key) || [];
          const today = isToday(day);
          return (
            <div
              key={key}
              className={cn(
                "flex min-h-[220px] flex-col rounded-2xl border bg-card/50 p-3 shadow-sm",
                "border-border/70 dark:border-white/[0.1]",
                today && "ring-1 ring-primary/35",
              )}
            >
              <div className="mb-3 border-b border-border/60 pb-2 dark:border-white/[0.08]">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {format(day, "EEEE", { locale: nl })}
                </p>
                <p
                  className={cn(
                    "text-xl font-semibold tabular-nums tracking-tight",
                    today ? "text-primary" : "text-foreground",
                  )}
                >
                  {format(day, "d MMM", { locale: nl })}
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {list.length === 0 ? (
                  <p className="text-2xs text-muted-foreground">—</p>
                ) : (
                  list.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-border/60 bg-background/80 p-2.5 dark:border-white/[0.08]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[0.65rem] font-medium text-muted-foreground">
                          {format(new Date(a.starts_at), "HH:mm")}
                        </span>
                        <AppointmentStatusSelect
                          appointmentId={a.id}
                          current={a.status}
                          demoMode={demoMode}
                        />
                      </div>
                      {a.lead_id && a.lead_name ? (
                        <Link
                          href={`/dashboard/leads/${a.lead_id}`}
                          className="mt-1 block text-sm font-medium leading-snug text-foreground hover:text-primary hover:underline"
                        >
                          {a.lead_name}
                        </Link>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Geen lead
                        </p>
                      )}
                      {a.notes ? (
                        <p className="mt-1 line-clamp-3 text-2xs leading-relaxed text-muted-foreground">
                          {a.notes}
                        </p>
                      ) : null}
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
