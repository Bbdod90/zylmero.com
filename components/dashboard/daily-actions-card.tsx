"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DailyActionsCard(props: {
  countNew: number;
  draftQuotes: number;
  upcomingAppts: number;
}) {
  const tasks = [
    {
      id: "leads",
      done: props.countNew === 0,
      label: "Reageer op open leads",
      hint:
        props.countNew === 0
          ? "Geen nieuwe leads wachtend"
          : `${props.countNew} lead(s) in wachtrij`,
      href: "/dashboard/inbox",
    },
    {
      id: "quotes",
      done: props.draftQuotes === 0,
      label: "Stuur offerte waar nodig",
      hint:
        props.draftQuotes === 0
          ? "Geen concept-offertes open"
          : `${props.draftQuotes} concept-offerte(s)`,
      href: "/dashboard/quotes",
    },
    {
      id: "appts",
      done: props.upcomingAppts > 0,
      label: "Plan afspraken voor warme kansen",
      hint:
        props.upcomingAppts > 0
          ? `${props.upcomingAppts} afspraak(en) gepland`
          : "Nog geen toekomstige afspraken",
      href: "/dashboard/appointments",
    },
  ];

  const doneCount = tasks.filter((t) => t.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card/80 to-card/60 shadow-[0_1px_0_0_hsl(var(--primary)/0.12)] dark:border-primary/20 dark:from-primary/[0.1] dark:via-card/90 dark:to-card/70">
      <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      <CardHeader className="relative pb-3">
        <CardTitle className="text-base font-bold tracking-tight sm:text-lg">
          Vandaag te doen
        </CardTitle>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/80 ring-1 ring-border/40 dark:bg-white/[0.06] dark:ring-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/75 shadow-[0_0_12px_-2px_hsl(var(--primary)/0.5)] transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          <span className="tabular-nums text-foreground">{doneCount}</span>
          /{tasks.length} afgerond
        </p>
      </CardHeader>
      <CardContent className="relative space-y-2.5 pb-6">
        {tasks.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200",
              t.done
                ? "border-primary/25 bg-primary/[0.06] dark:border-primary/30"
                : "border-border/60 bg-card/50 hover:border-primary/30 hover:bg-primary/[0.04] dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-primary/25",
            )}
          >
            {t.done ? (
              <CheckCircle2 className="mt-0.5 size-[1.125rem] shrink-0 text-primary" />
            ) : (
              <Circle className="mt-0.5 size-[1.125rem] shrink-0 text-muted-foreground/70" />
            )}
            <div>
              <p className="text-sm font-semibold leading-snug text-foreground">
                {t.label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {t.hint}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
