"use client";

import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Hero preview: echte chat-flow (WhatsApp‑achtig), geen dashboard-tabel. */
export function LandingHeroConversation({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[400px] lg:mx-0 lg:max-w-none", className)}>
      <div
        className="pointer-events-none absolute -inset-x-4 -bottom-8 top-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.22),transparent_68%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.28),transparent_65%)]"
        aria-hidden
      />

      {/* Telefoonframe */}
      <div
        className={cn(
          "relative mx-auto rounded-[2rem] border-[3px] border-border/40 bg-[hsl(222_42%_6%)] p-2 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.85),inset_0_1px_0_0_rgb(255_255_255/0.06)] ring-1 ring-black/25",
          "dark:border-white/[0.14] dark:bg-[hsl(224_44%_5%)] dark:ring-black/40",
        )}
      >
        {/* notch */}
        <div className="mx-auto mb-2 flex h-6 max-w-[120px] items-center justify-center rounded-full bg-black/60">
          <span className="h-1 w-14 rounded-full bg-black/80" aria-hidden />
        </div>

        <div className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.06] bg-[hsl(222_35%_9%)] shadow-inner">
          <div className="cf-landing-grain pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
          {/* Chat header */}
          <div className="relative z-[1] flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#25D366]/22 text-[11px] font-bold text-[#dcf8c6] ring-1 ring-[#25D366]/30">
              WA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold tracking-tight text-foreground">{BRAND_NAME}</p>
              <p className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-400/90">
                Antwoordt automatisch · business
              </p>
            </div>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
              Live
            </span>
          </div>

          <div className="relative z-[1] bg-gradient-to-b from-transparent to-black/25 px-3 py-4">
            <p className="mb-4 text-center font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Vandaag 14:02
            </p>

            {/* Klant */}
            <div className="flex justify-end">
              <div className="max-w-[92%] rounded-2xl rounded-br-md bg-[hsl(var(--primary))] px-3.5 py-2.5 text-[13px] leading-snug text-primary-foreground shadow-md">
                Kan ik morgen rond 14:00 langskomen voor een offerte?
              </div>
            </div>
            <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">Verzonden · gelezen</p>

            {/* AI — merk */}
            <div className="mt-4 flex gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-white/[0.08] bg-card/95 px-3.5 py-2.5 text-[13px] leading-snug text-foreground shadow-sm">
                Ja — ik check de agenda. Kleine klus of grotere verbouwing? Dan plan ik het juiste slot.
              </div>
            </div>

            {/* Klant kort */}
            <div className="mt-3 flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[hsl(var(--primary))] px-3.5 py-2 text-[13px] leading-snug text-primary-foreground">
                Kleine klus
              </div>
            </div>

            {/* Resultaat chip */}
            <div className="mt-4 rounded-xl border border-primary/35 bg-primary/10 px-3 py-2.5">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">Afspraak</p>
              <p className="mt-1 text-[13px] font-semibold text-foreground">Wo 14:00 vastgezet · bevestiging verstuurd</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Lead staat in je inbox · serieuze follow-up</p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground lg:text-left">
        Zo ziet een echte aanvraag eruit — geen gimmick
      </p>
    </div>
  );
}
