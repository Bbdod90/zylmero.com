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
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppointmentStatusSelect } from "@/components/appointments/appointment-status-select";

export type AgendaAppointment = Appointment & {
  lead_name: string | null;
};

function normalizeStatus(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Linker accent op afspraakkaart */
function appointmentCardAccent(status: string): string {
  const s = normalizeStatus(status);
  if (s === "confirmed" || s === "bevestigd") {
    return "from-primary via-primary/70 to-primary/30";
  }
  if (s === "completed" || s === "afgerond") {
    return "from-emerald-500 via-teal-400 to-emerald-500/30";
  }
  if (s === "cancelled" || s === "geannuleerd") {
    return "from-destructive/80 via-destructive/50 to-destructive/20";
  }
  return "from-violet-500 via-violet-400/80 to-violet-500/25";
}

export function AppointmentsWeekAgenda({
  items,
  demoMode,
}: {
  items: AgendaAppointment[];
  demoMode: boolean;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const reduceMotion = useReducedMotion();

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

  const dayMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <div className="space-y-8">
      <motion.div
        key={weekOffset}
        initial={reduceMotion ? false : { opacity: 0.85, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/50 bg-gradient-to-br from-card/90 via-card/70 to-muted/25 p-1.5 shadow-[0_8px_40px_-24px_rgb(0_0_0/0.35)] backdrop-blur-xl dark:border-white/[0.1] dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent dark:shadow-[0_12px_48px_-28px_rgb(0_0_0/0.55)]"
      >
        <div className="flex flex-wrap items-center gap-2 px-2 py-1 sm:px-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 rounded-xl border-border/60 bg-background/80 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/[0.06] dark:border-white/[0.1] dark:bg-white/[0.04]"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Vorige week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 rounded-xl border-border/60 bg-background/80 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/[0.06] dark:border-white/[0.1] dark:bg-white/[0.04]"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Volgende week"
          >
            <ChevronRight className="size-4" />
          </Button>
          <div className="ml-1 flex min-w-0 items-center gap-3 border-l border-border/50 pl-4 dark:border-white/[0.08]">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-inner-soft">
              <Calendar className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Weekoverzicht
              </p>
              <p className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
                {labelRange}
              </p>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mr-2 rounded-xl font-semibold shadow-sm"
          onClick={() => setWeekOffset(0)}
        >
          Deze week
        </Button>
      </motion.div>

      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-3 pt-1">
        {days.map((day, index) => {
          const key = format(day, "yyyy-MM-dd");
          const list = byDay.get(key) || [];
          const today = isToday(day);
          const weekend = [0, 6].includes(day.getDay());
          return (
            <motion.div
              key={key}
              {...dayMotion}
              transition={{
                delay: reduceMotion ? 0 : index * 0.045,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "group flex min-h-[300px] w-[min(78vw,232px)] min-w-[196px] shrink-0 flex-col overflow-hidden rounded-3xl border bg-card/95 shadow-[0_6px_32px_-18px_rgb(0_0_0/0.28)] transition-all duration-300 dark:bg-[hsl(228_22%_10%/0.92)] dark:shadow-[0_14px_44px_-24px_rgb(0_0_0/0.65)]",
                "border-border/55 dark:border-white/[0.1]",
                weekend && "opacity-[0.92]",
                today &&
                  "border-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.25),0_16px_48px_-20px_hsl(var(--primary)/0.35)] ring-1 ring-primary/15 dark:border-primary/35",
              )}
            >
              <div
                className={cn(
                  "relative overflow-hidden border-b px-4 py-3.5 dark:border-white/[0.08]",
                  today
                    ? "bg-gradient-to-br from-primary/20 via-primary/[0.08] to-transparent"
                    : "bg-gradient-to-br from-muted/45 via-muted/15 to-transparent dark:from-white/[0.06] dark:via-white/[0.02]",
                )}
              >
                {today ? (
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/20 blur-2xl"
                    aria-hidden
                  />
                ) : null}
                <div className="relative flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {format(day, "EEEE", { locale: nl })}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-xl font-bold tabular-nums tracking-tight",
                        today ? "text-primary" : "text-foreground",
                      )}
                    >
                      {format(day, "d MMM", { locale: nl })}
                    </p>
                  </div>
                  {today ? (
                    <span className="shrink-0 rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                      Vandaag
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overflow-x-hidden p-3">
                {list.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/50 bg-muted/10 px-3 py-10 text-center dark:border-white/[0.08] dark:bg-white/[0.02]">
                    <Sparkles className="size-5 text-muted-foreground/40" aria-hidden />
                    <p className="text-2xs font-medium text-muted-foreground">Geen afspraken</p>
                  </div>
                ) : (
                  list.map((a) => (
                    <div
                      key={a.id}
                      className={cn(
                        "relative overflow-hidden rounded-2xl border border-border/45 bg-background/95 p-3 pl-3.5 shadow-sm transition-all duration-300",
                        "hover:border-primary/25 hover:shadow-[0_8px_28px_-16px_hsl(var(--primary)/0.2)] dark:border-white/[0.08] dark:bg-[hsl(228_24%_8%/0.95)]",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute left-0 top-2 h-[calc(100%-1rem)] w-[3px] rounded-full bg-gradient-to-b",
                          appointmentCardAccent(a.status),
                        )}
                        aria-hidden
                      />
                      <div className="relative flex flex-col gap-2.5 pl-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/30 px-2 py-1 font-mono text-[0.7rem] font-bold tabular-nums text-foreground dark:border-white/[0.08] dark:bg-white/[0.05]">
                            <Clock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
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
                            className="block truncate text-sm font-bold tracking-tight text-foreground transition-colors hover:text-primary"
                            title={a.lead_name}
                          >
                            {a.lead_name}
                          </Link>
                        ) : (
                          <p className="truncate text-sm font-medium text-muted-foreground">Geen lead</p>
                        )}
                        {a.notes ? (
                          <p className="line-clamp-2 text-2xs leading-relaxed text-muted-foreground">
                            {a.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
