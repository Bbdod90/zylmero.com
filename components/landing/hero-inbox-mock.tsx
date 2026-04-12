import { cn } from "@/lib/utils";
import { DEMO_UNIVERSAL_BRAND, demoUniversalMonogram } from "@/lib/demo/demo-brand";

const THREADS = [
  {
    name: "Sophie · salon",
    preview: "Balayage + knippen — donderdag of zaterdag?",
    value: "€185",
    hot: true,
  },
  {
    name: "Daan · praktijk",
    preview: "Pijn linksonder — dit weekend iemand vrij?",
    value: "€95",
    hot: true,
  },
  {
    name: "Yasmine · banden",
    preview: "Winterbanden + uitlijnen — kenteken bekend",
    value: "€420",
    hot: false,
  },
];

export function HeroInboxMock() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="overflow-hidden rounded-[1.35rem] border border-border/50 bg-gradient-to-b from-card/98 to-zinc-950/92 shadow-[0_20px_56px_-28px_rgba(0,0,0,0.55)] ring-1 ring-black/[0.04] backdrop-blur-xl dark:border-white/[0.08] dark:from-zinc-900/96 dark:to-zinc-950/98 dark:ring-white/[0.05]"
        style={{ minHeight: 432 }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 text-xs font-bold tracking-tight text-primary-foreground">
              {demoUniversalMonogram()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {DEMO_UNIVERSAL_BRAND.shortName}
              </p>
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                {DEMO_UNIVERSAL_BRAND.legalName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-full border border-primary/25 bg-primary/12 px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-primary shadow-[0_0_20px_-6px_hsl(var(--primary)/0.55)]">
              €1.940 mogelijk vandaag
            </span>
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
              Openstaand rond €11,2k
            </span>
          </div>
        </div>

        <div className="space-y-2 border-b border-white/[0.05] p-3">
          <p className="px-1 text-2xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Wat nu telt
          </p>
          {THREADS.map((t, i) => (
            <div
              key={t.name}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2.5 transition-colors",
                i === 0
                  ? "border-primary/25 bg-primary/[0.07]"
                  : "border-white/[0.06] bg-white/[0.02]",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{t.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{t.preview}</p>
              </div>
              <div className="ml-2 flex shrink-0 flex-col items-end gap-0.5">
                <span className="text-xs font-bold tabular-nums text-primary">{t.value}</span>
                {t.hot ? (
                  <span className="text-[9px] font-semibold uppercase text-amber-400/95">
                    spoed
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-2xl rounded-tl-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
            <p className="text-[10px] font-medium text-muted-foreground">Klant</p>
            <p className="text-sm leading-relaxed text-foreground">
              Hi — ik heb pijn aan een kies en het lukt niet om online te boeken. Kunnen jullie
              vandaag nog tussen 14:00–16:00?
            </p>
          </div>

          <div className="rounded-2xl rounded-tr-md border border-primary/20 bg-primary/[0.08] px-3 py-2.5">
            <p className="text-[10px] font-medium text-primary">Jij (automatisch)</p>
            <p className="text-sm leading-relaxed text-foreground">
              Hi — dank je voor je bericht. Mag ik je geboortedatum en of je bij ons patiënt bent?
              Dan zoek ik direct een plek tussen 14:00–16:00 of bel ik je zo terug.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
