"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { nl } from "date-fns/locale";
import { motion, useReducedMotion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Sparkles,
} from "lucide-react";
import { appointmentStatusNl } from "@/lib/i18n/nl-labels";
import type { AgendaAppointment } from "@/components/appointments/agenda-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppointmentStatusSelect } from "@/components/appointments/appointment-status-select";
import { AppointmentDetailDialog } from "@/components/appointments/appointment-detail-dialog";

type CalendarView = "week" | "month" | "quarter";

const FILTER_STORAGE_KEY = "cf-appointment-agenda-filters";

type AgendaViewFilters = {
  hideCancelled: boolean;
  hideCompleted: boolean;
};

const defaultAgendaFilters: AgendaViewFilters = {
  hideCancelled: true,
  hideCompleted: false,
};

function normalizeStatus(raw: string): string {
  return raw.trim().toLowerCase();
}

function appointmentPassesViewFilters(
  a: AgendaAppointment,
  f: AgendaViewFilters,
): boolean {
  const s = normalizeStatus(a.status);
  if (
    f.hideCancelled &&
    (s === "cancelled" || s === "canceled" || s === "geannuleerd")
  ) {
    return false;
  }
  if (
    f.hideCompleted &&
    (s === "completed" || s === "done" || s === "afgerond")
  ) {
    return false;
  }
  return true;
}

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

function appointmentsForDay(items: AgendaAppointment[], day: Date): AgendaAppointment[] {
  const key = format(day, "yyyy-MM-dd");
  return items
    .filter((a) => format(new Date(a.starts_at), "yyyy-MM-dd") === key)
    .sort(
      (x, y) =>
        new Date(x.starts_at).getTime() - new Date(y.starts_at).getTime(),
    );
}

function AppointmentHoverSummary({ a }: { a: AgendaAppointment }) {
  const start = new Date(a.starts_at);
  return (
    <div className="space-y-1.5 text-left">
      <p className="font-semibold leading-tight text-foreground">
        {a.lead_name || "Afspraak"}
      </p>
      <p className="text-[0.7rem] tabular-nums text-muted-foreground">
        {format(start, "EEE d MMM · HH:mm", { locale: nl })}
      </p>
      <p className="text-[0.7rem] text-muted-foreground">
        {appointmentStatusNl(a.status)}
      </p>
      {a.notes ? (
        <p className="line-clamp-5 border-t border-border/40 pt-1.5 text-[0.7rem] leading-snug text-muted-foreground dark:border-white/[0.08]">
          {a.notes}
        </p>
      ) : (
        <p className="border-t border-border/40 pt-1.5 text-[0.65rem] italic text-muted-foreground dark:border-white/[0.08]">
          Geen notitie
        </p>
      )}
      <p className="text-[0.6rem] text-primary/90">Klik voor details en bewerken</p>
    </div>
  );
}

export function AppointmentsCalendar({
  items,
  demoMode,
  onDemoAppointmentUpdated,
  onDemoAppointmentDeleted,
}: {
  items: AgendaAppointment[];
  demoMode: boolean;
  onDemoAppointmentUpdated?: (next: AgendaAppointment) => void;
  onDemoAppointmentDeleted?: (appointmentId: string) => void;
}) {
  const [view, setView] = useState<CalendarView>("week");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<AgendaAppointment | null>(null);

  const openDetail = (a: AgendaAppointment) => {
    setDetailAppointment(a);
    setDetailOpen(true);
  };
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const reduceMotion = useReducedMotion();

  const [agendaFilters, setAgendaFilters] = useState<AgendaViewFilters>(
    defaultAgendaFilters,
  );
  const filtersHydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        setAgendaFilters((prev) => ({
          hideCancelled:
            typeof parsed.hideCancelled === "boolean"
              ? parsed.hideCancelled
              : prev.hideCancelled,
          hideCompleted:
            typeof parsed.hideCompleted === "boolean"
              ? parsed.hideCompleted
              : prev.hideCompleted,
        }));
      }
    } catch {
      /* ignore */
    }
    filtersHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!filtersHydrated.current) return;
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(agendaFilters));
    } catch {
      /* ignore */
    }
  }, [agendaFilters]);

  const displayItems = useMemo(
    () => items.filter((a) => appointmentPassesViewFilters(a, agendaFilters)),
    [items, agendaFilters],
  );

  const weekRange = useMemo(() => {
    const anchor = addWeeks(new Date(), weekOffset);
    const ws = startOfWeek(anchor, { weekStartsOn: 1 });
    const we = endOfWeek(anchor, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: ws, end: we });
    const label = `${format(ws, "d MMM", { locale: nl })} – ${format(we, "d MMMM yyyy", { locale: nl })}`;
    return { weekStart: ws, weekEnd: we, days, label };
  }, [weekOffset]);

  const monthAnchor = useMemo(
    () => startOfMonth(addMonths(new Date(), monthOffset)),
    [monthOffset],
  );

  const monthGridDays = useMemo(() => {
    const mStart = monthAnchor;
    const mEnd = endOfMonth(mStart);
    const gridStart = startOfWeek(mStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(mEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [monthAnchor]);

  const quarterMonths = useMemo(
    () => [0, 1, 2].map((i) => addMonths(monthAnchor, i)),
    [monthAnchor],
  );

  const visibleForWeek = useMemo(() => {
    const from = startOfDay(weekRange.weekStart).getTime();
    const to = endOfDay(weekRange.weekEnd).getTime();
    return displayItems.filter((a) => {
      const t = new Date(a.starts_at).getTime();
      return t >= from && t <= to;
    });
  }, [displayItems, weekRange.weekStart, weekRange.weekEnd]);

  const byDayWeek = useMemo(() => {
    const map = new Map<string, AgendaAppointment[]>();
    for (const d of weekRange.days) {
      map.set(format(d, "yyyy-MM-dd"), []);
    }
    for (const a of visibleForWeek) {
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
  }, [visibleForWeek, weekRange.days]);

  const toolbarTitle = () => {
    if (view === "week") return weekRange.label;
    if (view === "month") {
      return format(monthAnchor, "MMMM yyyy", { locale: nl });
    }
    return `${format(quarterMonths[0], "MMM yyyy", { locale: nl })} – ${format(
      quarterMonths[2],
      "MMM yyyy",
      { locale: nl },
    )}`;
  };

  const goPrev = () => {
    if (view === "week") setWeekOffset((w) => w - 1);
    else setMonthOffset((m) => m - 1);
  };

  const goNext = () => {
    if (view === "week") setWeekOffset((w) => w + 1);
    else setMonthOffset((m) => m + 1);
  };

  const goToday = () => {
    setWeekOffset(0);
    setMonthOffset(0);
  };

  const dayMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <TooltipProvider delayDuration={1100} skipDelayDuration={200}>
    <Tabs
      value={view}
      onValueChange={(v) => setView(v as CalendarView)}
      className="space-y-6"
    >
      <motion.div
        key={`${view}-${weekOffset}-${monthOffset}`}
        initial={reduceMotion ? false : { opacity: 0.92, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-4 rounded-2xl border border-border/45 bg-gradient-to-br from-card/85 via-card/60 to-muted/20 p-3 shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:from-white/[0.04] dark:via-transparent dark:to-transparent sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-lg border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.04]"
            onClick={goPrev}
            aria-label={view === "week" ? "Vorige week" : "Vorige maand"}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-lg border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.04]"
            onClick={goNext}
            aria-label={view === "week" ? "Volgende week" : "Volgende maand"}
          >
            <ChevronRight className="size-4" />
          </Button>
          <div className="ml-0 flex min-w-0 items-center gap-2.5 border-l border-border/50 pl-3 dark:border-white/[0.08] sm:ml-1 sm:gap-3 sm:pl-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Calendar className="size-[1.15rem]" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Agenda
              </p>
              <p className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[0.95rem]">
                {toolbarTitle()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 gap-2 rounded-lg border-border/60 px-3 text-xs font-semibold dark:border-white/[0.1]"
              >
                <Filter className="size-3.5" aria-hidden />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs font-semibold">
                Overzicht
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={agendaFilters.hideCancelled}
                onCheckedChange={(c) =>
                  setAgendaFilters((prev) => ({
                    ...prev,
                    hideCancelled: Boolean(c),
                  }))
                }
              >
                Verberg geannuleerd
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={agendaFilters.hideCompleted}
                onCheckedChange={(c) =>
                  setAgendaFilters((prev) => ({
                    ...prev,
                    hideCompleted: Boolean(c),
                  }))
                }
              >
                Verberg afgerond
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TabsList className="grid h-9 w-full min-w-0 grid-cols-3 rounded-xl bg-muted/40 p-1 dark:bg-white/[0.06] sm:w-auto sm:min-w-[260px]">
            <TabsTrigger
              value="week"
              className="min-w-0 flex-1 rounded-lg px-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-[0.8rem]"
            >
              Week
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="min-w-0 flex-1 rounded-lg px-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-[0.8rem]"
            >
              Maand
            </TabsTrigger>
            <TabsTrigger
              value="quarter"
              className="min-w-0 flex-1 rounded-lg px-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-[0.8rem]"
            >
              3 maanden
            </TabsTrigger>
          </TabsList>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-9 shrink-0 rounded-lg px-4 text-xs font-semibold"
            onClick={goToday}
          >
            Vandaag
          </Button>
        </div>
      </motion.div>

      <TabsContent value="week" className="mt-0 outline-none">
        <div className="cf-dashboard-inline-scroll -mx-1 flex cursor-grab gap-4 overflow-x-auto px-1 pb-1 pt-0.5 [-webkit-overflow-scrolling:touch] active:cursor-grabbing">
          {weekRange.days.map((day, index) => {
            const key = format(day, "yyyy-MM-dd");
            const list = byDayWeek.get(key) || [];
            const isTodayDay = isToday(day);
            const weekend = [0, 6].includes(day.getDay());
            return (
              <motion.div
                key={key}
                {...dayMotion}
                transition={{
                  delay: reduceMotion ? 0 : index * 0.03,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "group flex min-h-[340px] w-[min(90vw,300px)] min-w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-card/95 shadow-sm transition-colors duration-200 dark:bg-[hsl(228_22%_10%/0.94)] dark:shadow-[0_10px_36px_-26px_rgb(0_0_0/0.55)]",
                  "border-border/60 dark:border-white/[0.09]",
                  weekend && "opacity-[0.9]",
                  isTodayDay &&
                    "border-primary/22 bg-primary/[0.03] shadow-[0_1px_0_0_hsl(var(--primary)/0.1)] dark:border-primary/26 dark:bg-primary/[0.045]",
                )}
              >
                <div
                  className={cn(
                    "relative border-b px-4 py-3.5 dark:border-white/[0.08]",
                    isTodayDay
                      ? "bg-muted/35 dark:bg-white/[0.05]"
                      : "bg-gradient-to-br from-muted/35 via-muted/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.02]",
                  )}
                >
                  <div className="relative flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {format(day, "EEEE", { locale: nl })}
                      </p>
                      <p className="mt-1 text-lg font-bold tabular-nums tracking-tight text-foreground">
                        {format(day, "d MMM", { locale: nl })}
                      </p>
                    </div>
                    {isTodayDay ? (
                      <span className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                        Vandaag
                      </span>
                    ) : null}
                  </div>
                  {isTodayDay ? (
                    <div
                      className="mt-3 h-0.5 w-full rounded-full bg-primary/35"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div
                  className={cn(
                    "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden p-4",
                    isTodayDay && "bg-primary/[0.02] dark:bg-primary/[0.03]",
                  )}
                >
                  {list.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/35 bg-muted/5 px-3 py-12 text-center dark:border-white/[0.07] dark:bg-white/[0.02]">
                      <Sparkles className="size-5 text-muted-foreground/35" aria-hidden />
                      <p className="text-xs font-medium text-muted-foreground">
                        Geen afspraken
                      </p>
                    </div>
                  ) : (
                    list.map((a) => (
                      <WeekAppointmentCard
                        key={a.id}
                        a={a}
                        demoMode={demoMode}
                        onOpenDetail={openDetail}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="month" className="mt-0 outline-none">
        <MonthGrid
          days={monthGridDays}
          monthAnchor={monthAnchor}
          items={displayItems}
          onOpenDetail={openDetail}
        />
      </TabsContent>

      <TabsContent value="quarter" className="mt-0 outline-none">
        <div className="grid gap-6 lg:grid-cols-3">
          {quarterMonths.map((mStart) => (
            <MiniMonthBlock
              key={mStart.toISOString()}
              monthStart={mStart}
              items={displayItems}
              onOpenDetail={openDetail}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>

    <AppointmentDetailDialog
      appointment={detailAppointment}
      open={detailOpen}
      onOpenChange={(o) => {
        setDetailOpen(o);
        if (!o) setDetailAppointment(null);
      }}
      demoMode={demoMode}
      onDemoUpdated={(next) => {
        onDemoAppointmentUpdated?.(next);
      }}
      onDemoDeleted={(id) => {
        onDemoAppointmentDeleted?.(id);
      }}
    />
    </TooltipProvider>
  );
}

function WeekAppointmentCard({
  a,
  demoMode,
  onOpenDetail,
}: {
  a: AgendaAppointment;
  demoMode: boolean;
  onOpenDetail: (a: AgendaAppointment) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          aria-label={`Afspraak ${format(new Date(a.starts_at), "HH:mm")}, ${a.lead_name || "zonder klant"}. Tik voor details.`}
          onClick={() => onOpenDetail(a)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenDetail(a);
            }
          }}
          className={cn(
            "relative cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-background/95 p-3.5 pl-[1.05rem] text-left shadow-sm outline-none transition-all duration-200",
            "hover:border-primary/28 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/[0.08] dark:bg-[hsl(228_24%_9%/0.96)]",
          )}
        >
          <div
            className={cn(
              "absolute left-0 top-3 h-[calc(100%-1.5rem)] w-[3px] rounded-full bg-gradient-to-b",
              appointmentCardAccent(a.status),
            )}
            aria-hidden
          />
          <div className="relative flex min-w-0 flex-col gap-2.5 pl-2">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-lg border border-border/45 bg-muted/35 px-2.5 py-1.5 font-mono text-xs font-bold tabular-nums text-foreground dark:border-white/[0.08] dark:bg-white/[0.06]">
                <Clock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                {format(new Date(a.starts_at), "HH:mm")}
              </span>
              <div
                className="min-w-0 w-full"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <AppointmentStatusSelect
                  appointmentId={a.id}
                  current={a.status}
                  demoMode={demoMode}
                />
              </div>
            </div>
            {a.lead_id && a.lead_name ? (
              <p className="break-words text-sm font-bold leading-snug tracking-tight text-foreground">
                {a.lead_name}
              </p>
            ) : (
              <p className="text-sm font-medium leading-snug text-muted-foreground">
                Geen klant
              </p>
            )}
            {a.notes ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {a.notes}
              </p>
            ) : null}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] p-3 text-xs">
        <AppointmentHoverSummary a={a} />
      </TooltipContent>
    </Tooltip>
  );
}

function MonthGrid({
  days,
  monthAnchor,
  items,
  onOpenDetail,
}: {
  days: Date[];
  monthAnchor: Date;
  items: AgendaAppointment[];
  onOpenDetail: (a: AgendaAppointment) => void;
}) {
  const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  return (
    <div className="overflow-hidden rounded-2xl border border-border/45 bg-card/40 shadow-sm dark:border-white/[0.08] dark:bg-[hsl(228_22%_9%/0.5)]">
      <div className="grid grid-cols-7 border-b border-border/40 bg-muted/25 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground dark:border-white/[0.07] dark:bg-white/[0.04]">
        {weekDays.map((d) => (
          <div key={d} className="px-1 py-2 text-center sm:px-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border/30 p-px dark:bg-white/[0.06]">
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthAnchor);
          const dayItems = appointmentsForDay(items, day);
          const isTodayDay = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[100px] bg-background/90 p-1.5 sm:min-h-[120px] sm:p-2 dark:bg-[hsl(228_24%_8%/0.85)]",
                !inMonth && "opacity-40",
                isTodayDay && "ring-1 ring-inset ring-primary/35",
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-1">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg text-xs font-semibold tabular-nums",
                    isTodayDay
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {dayItems.slice(0, 3).map((a) => (
                  <Tooltip key={a.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onOpenDetail(a)}
                        className={cn(
                          "w-full truncate rounded-md border border-border/40 bg-primary/10 px-1.5 py-0.5 text-left text-[0.65rem] font-semibold leading-tight text-primary transition-colors hover:bg-primary/18 sm:text-[0.7rem]",
                        )}
                      >
                        {format(new Date(a.starts_at), "HH:mm")}{" "}
                        <span className="font-medium text-foreground/90">
                          {a.lead_name || "Afspraak"}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[260px] p-3">
                      <AppointmentHoverSummary a={a} />
                    </TooltipContent>
                  </Tooltip>
                ))}
                {dayItems.length > 3 ? (
                  <p className="text-[0.6rem] font-medium text-muted-foreground sm:text-[0.65rem]">
                    +{dayItems.length - 3} meer
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniMonthBlock({
  monthStart,
  items,
  onOpenDetail,
}: {
  monthStart: Date;
  items: AgendaAppointment[];
  onOpenDetail: (a: AgendaAppointment) => void;
}) {
  const mEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(mEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

  return (
    <div className="overflow-hidden rounded-2xl border border-border/45 bg-card/50 shadow-sm dark:border-white/[0.08] dark:bg-[hsl(228_22%_9%/0.55)]">
      <div className="border-b border-border/40 bg-muted/20 px-3 py-2.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
        <p className="text-center text-sm font-bold capitalize tracking-tight text-foreground">
          {format(monthStart, "MMMM yyyy", { locale: nl })}
        </p>
      </div>
      <div className="grid grid-cols-7 border-b border-border/35 text-[0.55rem] font-semibold uppercase text-muted-foreground dark:border-white/[0.06]">
        {weekDays.map((d) => (
          <div key={d} className="py-1.5 text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border/25 p-px dark:bg-white/[0.05]">
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const dayItems = appointmentsForDay(items, day);
          const isTodayDay = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square min-h-[2.35rem] bg-background/90 p-0.5 sm:min-h-[2.75rem] dark:bg-[hsl(228_24%_8%/0.88)]",
                !inMonth && "opacity-35",
                isTodayDay && "ring-1 ring-inset ring-primary/40",
              )}
            >
              <div
                className={cn(
                  "mb-0.5 flex size-6 items-center justify-center rounded-md text-[0.65rem] font-semibold",
                  isTodayDay ? "bg-primary text-primary-foreground" : "text-foreground",
                )}
              >
                {format(day, "d")}
              </div>
              <div className="flex flex-col gap-px">
                {dayItems.slice(0, 2).map((a) => (
                  <Tooltip key={a.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onOpenDetail(a)}
                        className="w-full truncate rounded bg-primary/15 px-0.5 text-left text-[0.55rem] font-medium leading-tight text-primary sm:text-[0.6rem]"
                      >
                        {format(new Date(a.starts_at), "HH:mm")}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px] p-2.5 text-[0.65rem]">
                      <AppointmentHoverSummary a={a} />
                    </TooltipContent>
                  </Tooltip>
                ))}
                {dayItems.length > 2 ? (
                  <span className="text-[0.5rem] text-muted-foreground">
                    +{dayItems.length - 2}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
