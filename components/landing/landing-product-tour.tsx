"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { CalendarClock, Inbox, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

type TourId = "inbox" | "reply" | "appointment";

const TABS: Array<{
  id: TourId;
  label: string;
  title: string;
  sub: string;
  Icon: LucideIcon;
}> = [
  {
    id: "inbox",
    label: "Inbox",
    title: "Alles komt binnen op één plek",
    sub: "Website, WhatsApp en mail. Geen losse threads.",
    Icon: Inbox,
  },
  {
    id: "reply",
    label: "Reactie",
    title: "Binnen seconden een eerste antwoord",
    sub: "Met context en doorvraag. Jij pakt het over als het serieus is.",
    Icon: MessageSquareText,
  },
  {
    id: "appointment",
    label: "Afspraak",
    title: "Afspraken zonder heen‑en‑weer",
    sub: "Voorstel → bevestiging → lead in je overzicht.",
    Icon: CalendarClock,
  },
];

function ScreenShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("cf-landing-pro-card relative p-0", className)}>
      <div className="cf-landing-grain absolute inset-0 rounded-[inherit]" aria-hidden />
      <div className="relative overflow-hidden rounded-[inherit]">{children}</div>
    </div>
  );
}

function MiniTopBar({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border/45 bg-card/60 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
      <div className="flex gap-1.5 opacity-80">
        <span className="size-2.5 rounded-full bg-red-400/85" aria-hidden />
        <span className="size-2.5 rounded-full bg-amber-400/85" aria-hidden />
        <span className="size-2.5 rounded-full bg-emerald-500/80" aria-hidden />
      </div>
      <p className="ml-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
    </div>
  );
}

function InboxScreen() {
  const rows = [
    { name: "Nieuwe aanvraag", hint: "Website · vandaag", value: "Nieuw" },
    { name: "Offerte vraag", hint: "WhatsApp · 11:42", value: "Warm" },
    { name: "Spoed", hint: "Mail · 08:10", value: "Nu" },
  ] as const;
  return (
    <ScreenShell>
      <MiniTopBar title="Inbox" />
      <div className="grid gap-2.5 p-4 md:p-5">
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/70 px-4 py-3.5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">{r.name}</p>
              <p className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {r.hint}
              </p>
            </div>
            <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20 dark:bg-primary/15">
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}

function ReplyScreen() {
  return (
    <ScreenShell>
      <MiniTopBar title="Auto‑reactie" />
      <div className="space-y-2.5 p-4 md:p-5">
        <div className="flex justify-end">
          <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-sm">
            Kan ik morgen rond 14:00?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-border/55 bg-background/80 px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm dark:border-white/[0.09] dark:bg-white/[0.03]">
            Ja. Gaat het om een korte intake of een vervolgafspraak? Dan plan ik meteen een passend slot.
          </div>
        </div>
        <div className="mt-2 rounded-2xl border border-border/50 bg-muted/20 p-4 text-xs text-muted-foreground dark:border-white/[0.08]">
          Overname wanneer jij wilt · Jij ziet alle context.
        </div>
      </div>
    </ScreenShell>
  );
}

function AppointmentScreen() {
  return (
    <ScreenShell>
      <MiniTopBar title="Afspraak" />
      <div className="grid gap-2.5 p-4 md:p-5">
        <div className="rounded-2xl border border-border/55 bg-background/80 p-5 shadow-sm dark:border-white/[0.09] dark:bg-white/[0.03]">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Bevestigd
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">Wo 14:00</p>
          <p className="mt-1 text-sm text-muted-foreground">Intake · 20 min · op locatie</p>
        </div>
        <div className="rounded-2xl border border-border/55 bg-background/80 p-5 shadow-sm dark:border-white/[0.09] dark:bg-white/[0.03]">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Lead
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">Klaar in je overzicht</p>
          <p className="mt-1 text-sm text-muted-foreground">Status: warm · volgende stap: bellen</p>
        </div>
      </div>
    </ScreenShell>
  );
}

export function LandingProductTour({ className }: { className?: string }) {
  const [active, setActive] = useState<TourId>("inbox");
  const tab = useMemo(() => TABS.find((t) => t.id === active)!, [active]);

  return (
    <section className={cn("scroll-mt-24 border-t border-border/45 py-9 md:py-11 dark:border-white/[0.08]", className)} id="demo">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <p className="cf-landing-eyebrow text-center">Product tour</p>
        <h2 className="cf-landing-h2 mx-auto mt-2 max-w-3xl text-center">In de app</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground md:text-[15px]">
          Inbox → reactie → afspraak. Dat is de flow.
        </p>

        <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                "border-border/60 bg-background/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                "dark:border-white/[0.14] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
                active === t.id && "border-primary/40 bg-primary/10 text-foreground ring-1 ring-primary/20",
              )}
            >
              <t.Icon className="size-4 text-primary" strokeWidth={1.75} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-5 grid max-w-[1040px] gap-4 lg:grid-cols-[minmax(0,0.85fr)_1.15fr] lg:items-start lg:gap-5">
          <div>
            <p className="cf-landing-eyebrow">Focus</p>
            <h3 className="mt-2 text-balance text-xl font-semibold tracking-[-0.03em] text-foreground md:text-2xl">
              {tab.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{tab.sub}</p>
          </div>
          <div>
            {active === "inbox" ? <InboxScreen /> : null}
            {active === "reply" ? <ReplyScreen /> : null}
            {active === "appointment" ? <AppointmentScreen /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

