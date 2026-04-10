import { cn } from "@/lib/utils";
import { DEMO_GARAGE_BRAND, demoGarageMonogram } from "@/lib/demo/demo-brand";

const THREADS = [
  {
    name: "Kevin · remmen voor",
    preview: "Tikkend geluid bij remmen — Golf 8",
    value: "€340",
    hot: true,
  },
  {
    name: "Samira · banden",
    preview: "4 zomerbanden 225/45 R17 deze week",
    value: "€580",
    hot: true,
  },
  {
    name: "Noa · vloot",
    preview: "2 bedrijfsbussen — jaarprijs",
    value: "€4.200",
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
              {demoGarageMonogram()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {DEMO_GARAGE_BRAND.shortName}
              </p>
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                {DEMO_GARAGE_BRAND.legalName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-full border border-primary/25 bg-primary/12 px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-primary shadow-[0_0_20px_-6px_hsl(var(--primary)/0.55)]">
              €2.180 mogelijk vandaag
            </span>
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
              Openstaand rond €12,4k
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
                <p className="truncate text-xs font-medium text-foreground">
                  {t.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {t.preview}
                </p>
              </div>
              <div className="ml-2 flex shrink-0 flex-col items-end gap-0.5">
                <span className="text-xs font-bold tabular-nums text-primary">
                  {t.value}
                </span>
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
              Hi — remmen piepen als het koud is. Kunnen jullie morgenochtend kijken?
              Kenteken K-451-GH.
            </p>
          </div>

          <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
            <span className="inline-flex gap-1" aria-hidden>
              <span className="size-1.5 rounded-full bg-primary/80" />
              <span className="size-1.5 rounded-full bg-primary/80" />
              <span className="size-1.5 rounded-full bg-primary/80" />
            </span>
            Antwoord wordt klaargezet…
          </div>

          <div className="ml-3 rounded-2xl rounded-tr-md border border-primary/20 bg-primary/[0.1] px-3 py-2.5 backdrop-blur-sm">
            <p className="text-[10px] font-medium text-primary">Binnen enkele seconden</p>
            <p className="text-sm leading-relaxed text-foreground">
              Goedemorgen — we kunnen morgen om 08:00 of 10:30. Voor remwerk aan de voorzijde
              zit je meestal rond €240–€380 na inspectie. Zal ik 08:00 voor je reserveren?
            </p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/[0.08] px-3 py-2">
            <p className="text-[11px] font-semibold text-primary">
              Geboekt · inspectie remmen · morgen 08:00
            </p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 size-44 rounded-full bg-primary/18 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-48 rounded-full bg-accent/14 blur-3xl" />
    </div>
  );
}
