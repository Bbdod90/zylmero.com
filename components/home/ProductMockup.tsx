"use client";

import { useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  MessageSquare,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DemoThreadId = "offerte" | "lekkage";

type DemoMessage = { role: "user" | "assistant"; text: string };

const DEMO_THREADS: Record<
  DemoThreadId,
  {
    listTitle: string;
    listChannel: string;
    badge: string;
    headerTitle: string;
    time: string;
    messages: DemoMessage[];
    footer: { title: string; detail: string };
  }
> = {
  offerte: {
    listTitle: "Offerte aanvraag",
    listChannel: "Website · zojuist",
    badge: "Nieuw",
    headerTitle: "Website · offerte aanvraag",
    time: "Vandaag · 14:05",
    messages: [
      { role: "user", text: "Hoi — kunnen jullie langskomen voor een offerte op maat? Ik werk overdag." },
      {
        role: "assistant",
        text: "Dank je — ik check de agenda. Woensdag 14:30 of vrijdag 09:00 zijn beschikbaar. Welke tijd past het best?",
      },
      { role: "user", text: "Woensdag 14:30 graag." },
      {
        role: "assistant",
        text: "Staat genoteerd. Ik reserveer woensdag 14:30 en stuur zo een bevestiging met tijdvak en monteur.",
      },
    ],
    footer: {
      title: "Afspraak ingepland",
      detail: "Woensdag 14:30 · bevestiging met route & monteur verstuurd",
    },
  },
  lekkage: {
    listTitle: "Lekkage spoed",
    listChannel: "WhatsApp · 11:42",
    badge: "Warm",
    headerTitle: "WhatsApp · lekkage spoed",
    time: "Vandaag · 11:43",
    messages: [
      {
        role: "user",
        text: "Er lekt water uit de buis bij de meterkast. Kunnen jullie vandaag nog iemand langs sturen?",
      },
      {
        role: "assistant",
        text: "Ik pak dit meteen op — spoed heeft prioriteit. Om 16:45 kan een monteur langs. Zal ik dat voor je vastzetten?",
      },
      { role: "user", text: "Ja graag. Adres en postcode staan bij jullie uit eerdere werkzaamheden." },
      {
        role: "assistant",
        text: "Top. Je ontvangt zo een SMS met ETA en monteur. Tot zo.",
      },
    ],
    footer: {
      title: "Spoedbezoek ingepland",
      detail: "Vandaag 16:45 · monteur onderweg · klant geïnformeerd per SMS",
    },
  },
};

type ProductMockupProps = {
  /** Extra gloed achter het vlak (hero); geen bewegende animatie. */
  floating?: boolean;
  /** Modal toont hetzelfde gesprek + een extra “overzicht”-laag (niet identiek aan hero). */
  variant?: "default" | "modal";
  className?: string;
};

function ModalOverviewStrip({
  shell,
  monoMuted,
}: {
  shell: string;
  monoMuted: string;
}) {
  const rowSoft = cn(
    "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[12px] leading-tight text-black dark:text-white",
    "bg-slate-50/90",
    "dark:bg-black/25",
  );

  return (
    <div className="mt-4 space-y-3 text-black dark:text-white">
      <p className="text-center font-mono text-[10px] font-medium uppercase tracking-[0.2em]">
        In jouw overzicht
      </p>
      <div className={cn(shell, "rounded-xl shadow-lg")}>
        <div
          className={cn(
            "flex items-center justify-between border-b px-3.5 py-2.5",
            "border-slate-200/80 bg-slate-50/90",
            "dark:border-white/[0.08] dark:bg-black/25",
          )}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard className="size-4 text-black dark:text-white" strokeWidth={2} aria-hidden />
            <span className="text-[13px] font-semibold">Dashboard</span>
          </div>
          <span className={monoMuted}>Live</span>
        </div>

        <div className="space-y-3 px-3.5 py-3.5">
          <div>
            <p className={cn(monoMuted, "mb-2 px-0.5")}>Agenda · komende dagen</p>
            <div className="space-y-2">
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3",
                  "border-slate-200/90 bg-white",
                  "dark:border-white/[0.08] dark:bg-white/[0.05]",
                )}
              >
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-black dark:text-white" strokeWidth={2} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-snug">
                    Woensdag 14:30 · Langskomen offerte · thuis
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    Zelfde tijdslot als in het chatgesprek — adres en monteur bij de bevestiging.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black dark:text-white dark:bg-emerald-500/20">
                  Geboekt
                </span>
              </div>

              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3",
                  "border-slate-200/70 bg-slate-50/80",
                  "dark:border-white/[0.06] dark:bg-white/[0.03]",
                )}
              >
                <Clock className="mt-0.5 size-4 shrink-0 text-black dark:text-white" strokeWidth={2} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-snug">
                    Donderdag 10:30 · Belafspraak offerte
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    Herinnering 1 uur van tevoren · nog niet bevestigd door klant
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black dark:text-white dark:bg-blue-400/25">
                  Gepland
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200/90 dark:bg-white/[0.08]" />

          <div>
            <p className={cn(monoMuted, "mb-2 px-0.5")}>Inbox · nog open</p>
            <div className="space-y-1.5">
              <div className={rowSoft}>
                <span className="flex min-w-0 items-center gap-2">
                  <MessageSquare className="size-3.5 shrink-0 text-black dark:text-white" aria-hidden />
                  <span className="truncate">Website · “spoed reparatie”</span>
                </span>
                <span className="shrink-0 rounded-full bg-blue-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase text-black dark:text-white dark:bg-blue-400/20">
                  Nieuw
                </span>
              </div>
              <div className={rowSoft}>
                <span className="flex min-w-0 items-center gap-2">
                  <MessageSquare className="size-3.5 shrink-0 text-black dark:text-white" aria-hidden />
                  <span className="truncate">WhatsApp · offerte dakinspectie</span>
                </span>
                <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-black dark:text-white dark:bg-amber-400/20">
                  Warm
                </span>
              </div>
              <div className={rowSoft}>
                <span className="flex min-w-0 items-center gap-2">
                  <MessageSquare className="size-3.5 shrink-0 text-black dark:text-white" aria-hidden />
                  <span className="truncate">Mail · terugbelverzoek</span>
                </span>
                <span className="shrink-0 rounded-full bg-slate-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-black dark:text-white dark:bg-white/20">
                  Later
                </span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-lg border px-3 py-2.5",
              "border-slate-200/80 bg-white",
              "dark:border-white/[0.08] dark:bg-black/20",
            )}
          >
            <div className="flex items-center justify-between gap-2 text-[12px]">
              <span className="font-medium">Pipeline deze week</span>
              <span className="shrink-0 font-semibold tabular-nums">1 geboekt · 3 open</span>
            </div>
            <div className="mt-2 flex h-2 gap-1 overflow-hidden rounded-full bg-slate-200/90 dark:bg-white/10">
              <div className="w-[28%] rounded-l-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]" />
              <div className="w-[38%] bg-amber-400/75" />
              <div className="flex-1 rounded-r-full bg-slate-300/90 dark:bg-white/15" />
            </div>
            <p className="mt-2 text-[10px] leading-snug">
              Gemiddelde eerste reactie vandaag: <span className="font-semibold">4 min</span>
              {" · "}
              SLA groen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductMockup({
  floating = false,
  variant = "default",
  className,
}: ProductMockupProps) {
  const [thread, setThread] = useState<DemoThreadId>("offerte");
  const demo = DEMO_THREADS[thread];

  const shell = cn(
    "relative overflow-hidden rounded-[1.35rem] border backdrop-blur-2xl text-black dark:text-white",
    "border-slate-200/65 bg-white/[0.93]",
    "shadow-[0_1px_0_rgba(255,255,255,0.92)_inset,0_22px_56px_-30px_rgba(15,23,42,0.2)] ring-1 ring-slate-900/[0.035]",
    "dark:border-white/[0.085] dark:bg-[linear-gradient(168deg,hsla(222,26%,14%,0.97)_0%,hsla(224,30%,10%,0.96)_48%,hsla(226,34%,7.5%,0.98)_100%)]",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.055)_inset,0_36px_96px_-32px_rgba(0,0,0,0.78)] dark:ring-white/[0.055]",
  );

  const chrome = cn(
    "relative flex items-center justify-between border-b px-4 py-3",
    "border-slate-200/55 bg-gradient-to-b from-white/90 to-slate-50/90",
    "dark:border-white/[0.06] dark:from-white/[0.04] dark:to-transparent",
  );

  const monoMuted = "font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-black dark:text-white";

  const labelMini = "text-[9px] font-semibold uppercase tracking-[0.22em] text-black dark:text-white";

  /** Licht: zwarte tekst op neutrale pill; dark: wit op blauwe gradient. */
  const bubbleUser = cn(
    "max-w-[94%] rounded-[1.15rem] rounded-br-[0.35rem] px-[1.05rem] py-2.5 text-[13px] font-normal leading-snug antialiased",
    "border border-slate-300/85 bg-gradient-to-br from-neutral-100 to-neutral-200 text-black shadow-[0_1px_0_rgba(255,255,255,0.95)_inset]",
    "dark:border-transparent dark:bg-gradient-to-br dark:from-blue-500 dark:via-blue-600 dark:to-indigo-800 dark:text-white",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_10px_34px_-8px_rgba(37,99,235,0.55)]",
  );

  const bubbleAssistant = cn(
    "max-w-[94%] rounded-[1.15rem] rounded-bl-[0.35rem] px-[1.05rem] py-2.5 text-[13px] font-normal leading-relaxed antialiased text-black dark:text-white",
    "border border-slate-200/85 bg-white shadow-[0_1px_0_rgba(255,255,255,0.95)_inset]",
    "dark:border-white/[0.11] dark:bg-white/[0.065]",
    "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] dark:backdrop-blur-sm",
  );

  const threadCardBase =
    "flex w-full flex-col items-start rounded-2xl border px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0c1018]";

  const inner = (
    <div className={shell}>
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent dark:via-white/18" aria-hidden />
      <div className={chrome}>
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/[0.04]",
              "bg-gradient-to-br from-blue-500/18 via-blue-600/12 to-indigo-700/14 text-black",
              "dark:from-blue-400/22 dark:via-blue-600/14 dark:to-indigo-900/25 dark:text-white dark:ring-white/10",
            )}
          >
            <MessageSquare className="size-[18px]" strokeWidth={1.85} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-tight">Alle kanalen</p>
            <p className="truncate text-[11px] leading-snug">2 open gesprekken</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/[0.13] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-black ring-1 ring-emerald-600/15 dark:bg-emerald-400/12 dark:text-white dark:ring-emerald-400/25">
          Live
        </span>
      </div>

      <div className="relative flex flex-col min-[400px]:flex-row">
        <div
          className={cn(
            "relative shrink-0 border-b min-[400px]:w-[min(38%,11.75rem)] min-[400px]:border-b-0 min-[400px]:border-r",
            "border-slate-200/55 bg-gradient-to-b from-slate-50/95 to-slate-50/40",
            "dark:border-white/[0.055] dark:from-black/25 dark:to-black/12",
          )}
        >
          <p className={cn(monoMuted, "px-3.5 pb-2 pt-3.5")}>Open</p>
          <div className="space-y-2 px-2.5 pb-3.5">
            <button
              type="button"
              aria-pressed={thread === "offerte"}
              onClick={() => setThread("offerte")}
              className={cn(
                threadCardBase,
                thread === "offerte"
                  ? "border-blue-500/25 bg-gradient-to-b from-blue-500/[0.1] to-blue-600/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] dark:border-blue-400/28 dark:from-blue-500/[0.14] dark:to-blue-900/15 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : "border-transparent hover:border-slate-200/70 hover:bg-white/70 dark:hover:border-white/[0.06] dark:hover:bg-white/[0.03]",
              )}
            >
              <span className="text-[13px] font-semibold tracking-tight">{DEMO_THREADS.offerte.listTitle}</span>
              <span className={cn("mt-1", monoMuted)}>{DEMO_THREADS.offerte.listChannel}</span>
              <span className="mt-2.5 inline-flex rounded-full bg-blue-600/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-black ring-1 ring-blue-600/18 dark:bg-blue-400/18 dark:text-white dark:ring-blue-400/22">
                {DEMO_THREADS.offerte.badge}
              </span>
            </button>
            <button
              type="button"
              aria-pressed={thread === "lekkage"}
              onClick={() => setThread("lekkage")}
              className={cn(
                threadCardBase,
                thread === "lekkage"
                  ? "border-amber-500/30 bg-gradient-to-b from-amber-500/[0.11] to-amber-900/12 shadow-[0_1px_0_rgba(255,255,255,0.55)_inset] dark:border-amber-400/35 dark:from-amber-500/[0.16] dark:to-amber-950/22 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "border-transparent hover:border-slate-200/70 hover:bg-white/70 dark:hover:border-white/[0.06] dark:hover:bg-white/[0.03]",
              )}
            >
              <span className="text-[13px] font-semibold tracking-tight">{DEMO_THREADS.lekkage.listTitle}</span>
              <span className={cn("mt-1", monoMuted)}>{DEMO_THREADS.lekkage.listChannel}</span>
              <span className="mt-2.5 inline-flex rounded-full bg-amber-500/14 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-black ring-1 ring-amber-600/18 dark:bg-amber-400/12 dark:text-white dark:ring-amber-300/22">
                {DEMO_THREADS.lekkage.badge}
              </span>
            </button>
          </div>
        </div>

        <div
          className={cn(
            "relative min-h-0 min-w-0 flex-1",
            "bg-[radial-gradient(ellipse_85%_80%_at_50%_-20%,rgba(59,130,246,0.06),transparent_52%)]",
            "dark:bg-[radial-gradient(ellipse_90%_85%_at_50%_-25%,rgba(59,130,246,0.11),transparent_55%),linear-gradient(180deg,rgba(0,0,0,0.12)_0%,transparent_38%)]",
          )}
        >
          <div className="border-b border-slate-200/55 px-3.5 py-2.5 dark:border-white/[0.055]">
            <p className={labelMini}>Geselecteerd gesprek</p>
            <p className="mt-1 text-[12.5px] font-semibold tracking-tight">{demo.headerTitle}</p>
          </div>
          <div key={thread} className="space-y-4 px-3.5 py-3.5">
            <p className="text-center font-mono text-[10px] font-medium uppercase tracking-[0.2em]">{demo.time}</p>

            {demo.messages.map((m, i) => (
              <div key={`${thread}-${i}`} className="space-y-1.5">
                <p className={cn(labelMini, m.role === "user" && "text-right")}>
                  {m.role === "user" ? "Klant" : "Zylmero"}
                </p>
                <div className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={m.role === "user" ? bubbleUser : bubbleAssistant}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cn("relative border-t p-4", "border-slate-200/55 dark:border-white/[0.055]")}>
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border p-4",
            thread === "offerte"
              ? cn(
                  "border-emerald-200/70 bg-gradient-to-br from-emerald-50/95 via-white to-emerald-50/50",
                  "shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]",
                  "dark:border-emerald-500/22 dark:from-emerald-500/[0.12] dark:via-emerald-950/20 dark:to-transparent",
                  "dark:shadow-[inset_0_1px_0_rgba(52,211,153,0.12)]",
                )
              : cn(
                  "border-amber-200/75 bg-gradient-to-br from-amber-50/95 via-white to-amber-50/45",
                  "shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]",
                  "dark:border-amber-500/28 dark:from-amber-500/[0.14] dark:via-amber-950/25 dark:to-transparent",
                  "dark:shadow-[inset_0_1px_0_rgba(251,191,36,0.14)]",
                ),
          )}
        >
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
              thread === "offerte"
                ? "bg-emerald-500/12 ring-emerald-600/15 dark:bg-emerald-400/15 dark:ring-emerald-400/25"
                : "bg-amber-500/12 ring-amber-600/18 dark:bg-amber-400/14 dark:ring-amber-400/28",
            )}
          >
            {thread === "offerte" ? (
              <CalendarCheck className="size-[18px] text-black dark:text-white" strokeWidth={1.65} aria-hidden />
            ) : (
              <Truck className="size-[18px] text-black dark:text-white" strokeWidth={1.65} aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <CheckCircle2 className="size-4 text-black dark:text-white" strokeWidth={2} aria-hidden />
              <p className="text-[13px] font-semibold tracking-tight">{demo.footer.title}</p>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed">{demo.footer.detail}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const extra = variant === "modal" ? <ModalOverviewStrip shell={shell} monoMuted={monoMuted} /> : null;

  if (!floating) {
    return (
      <div className={className}>
        {inner}
        {extra}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.18),transparent_65%)] blur-2xl dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.22),transparent_65%)]"
        aria-hidden
      />
      <div className="relative">{inner}</div>
    </div>
  );
}
