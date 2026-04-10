import {
  Activity,
  Calendar,
  MessageSquare,
  Quote,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const EVENTS = [
  {
    icon: MessageSquare,
    text: "Nieuwe aanvraag binnen via WhatsApp — remmen + APK",
    meta: "Zojuist",
    tone: "text-zinc-100",
  },
  {
    icon: Zap,
    text: "AI-antwoord klaar in 4 seconden — klant ziet direct opties",
    meta: "4s",
    tone: "text-primary/95",
  },
  {
    icon: Quote,
    text: "Offerte verstuurd — 4 zomerbanden incl. montage",
    meta: "Orderpotentie €579",
    tone: "text-sky-200/95",
  },
  {
    icon: Calendar,
    text: "Afspraak bevestigd — airco-service do 10:30",
    meta: "Bevestigd",
    tone: "text-amber-200/95",
  },
  {
    icon: TrendingUp,
    text: "Hete lead gedetecteerd — vlootonderhoud 2 bussen",
    meta: "Waarde €4.200+",
    tone: "text-violet-200/90",
  },
  {
    icon: Sparkles,
    text: "Follow-up na 24u — klant reageerde op herinnering",
    meta: "Omzetkans",
    tone: "text-primary/90",
  },
] as const;

export function LiveActivitySection() {
  return (
    <section className="border-b border-white/5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/90">
              <Activity className="size-3.5" />
              Live activiteit
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              Omzet beweegt — terwijl jij op de klus zit
            </h2>
            <p className="mt-2 max-w-lg text-sm font-medium leading-relaxed text-zinc-400">
              Elke minuut telt. Wie eerst duidelijkheid en een prijs geeft, wint de
              klant — en de € op de planning.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-[1.25rem] border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-4 md:p-7">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EVENTS.map((ev) => {
              const Icon = ev.icon;
              return (
                <div
                  key={ev.text}
                  className="flex min-h-[5.75rem] items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-white/10 hover:bg-white/[0.03]"
                >
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                    <Icon className="size-4 text-primary/90" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium leading-snug ${ev.tone}`}>
                      {ev.text}
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      {ev.meta}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-center text-xs leading-relaxed text-zinc-500">
            Voorbeeldfeed — jouw workspace toont hetzelfde patroon met echte cijfers
            en echte klanten.
          </p>
        </div>
      </div>
    </section>
  );
}
