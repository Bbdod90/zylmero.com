import Link from "next/link";

export function InboxEmptyConversion() {
  return (
    <div className="grid min-h-[min(720px,92dvh)] gap-0 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[0_40px_100px_-56px_rgb(0_0_0/0.38)] dark:border-white/[0.08] dark:bg-[hsl(222_24%_9%/0.96)] dark:shadow-[0_48px_120px_-56px_rgb(0_0_0/0.55)] md:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
      {/* Chat‑lijst (WhatsApp‑achtig overzicht) */}
      <div className="flex min-h-[320px] flex-col border-b border-border/45 bg-[hsl(215_20%_97%)] dark:border-white/[0.06] dark:bg-[hsl(217_28%_10%)] md:min-h-0 md:border-b-0 md:border-r">
        <header className="flex h-[3.35rem] shrink-0 items-center border-b border-border/35 px-5 dark:border-white/[0.07] dark:bg-[hsl(217_30%_8%)]">
          <div className="min-w-0">
            <h2 className="text-[1.0625rem] font-semibold leading-none tracking-tight text-foreground">
              Chats
            </h2>
            <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground/75">
              Inbox
            </p>
          </div>
        </header>

        <div className="shrink-0 border-b border-border/30 px-4 py-2.5 dark:border-white/[0.06]">
          <div
            className="flex h-9 items-center rounded-xl border border-border/40 bg-background/90 px-3.5 text-sm text-muted-foreground dark:border-white/[0.07] dark:bg-white/[0.04]"
            role="search"
          >
            <span className="select-none opacity-55">Zoeken …</span>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border/25 px-4 py-3 dark:border-white/[0.04]"
              aria-hidden
            >
              <div className="size-12 shrink-0 rounded-full bg-muted/50 dark:bg-white/[0.06]" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-2.5 w-[40%] max-w-[9rem] rounded-full bg-muted/45 dark:bg-white/[0.07]" />
                <div className="h-2 w-[72%] rounded-full bg-muted/30 dark:bg-white/[0.05]" />
              </div>
              <div className="h-2 w-9 shrink-0 rounded-full bg-muted/25 dark:bg-white/[0.05]" />
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-background/25 to-background/80 px-6 pb-8 pt-16 dark:via-[hsl(217_28%_10%/0.25)] dark:to-[hsl(217_28%_10%/0.92)]">
            <p className="pointer-events-auto text-center text-sm font-semibold tracking-tight text-foreground">
              Nog geen gesprekken
            </p>
            <p className="pointer-events-auto mt-2 max-w-[15rem] text-center text-xs leading-relaxed text-muted-foreground">
              Koppel een kanaal — dan verschijnen klanten hier in één strak overzicht.
            </p>
            <Link
              href="/dashboard/ai-koppelingen"
              className="pointer-events-auto mt-6 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Kanalen instellen
            </Link>
          </div>
        </div>
      </div>

      {/* Leeg scherm / geen selectie */}
      <div className="relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden bg-muted/[0.22] px-8 py-16 dark:bg-[hsl(222_22%_7%/0.85)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border) / 0.45) 1px, transparent 0)`,
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        <div className="relative text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Geen gesprek geselecteerd
          </p>
          <p className="mx-auto mt-2 max-w-[18rem] text-xs leading-relaxed text-muted-foreground/80">
            Zodra er berichten binnenkomen, tik je een chat aan om te antwoorden.
          </p>
        </div>
      </div>
    </div>
  );
}
