"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateAiSettingsAction, type SettingsFormState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Languages, MessageCircleHeart, Sparkles } from "lucide-react";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-gradient-to-r from-primary to-primary/85 px-6 font-semibold shadow-sm"
    >
      {pending ? "Opslaan…" : "AI-instellingen opslaan"}
    </Button>
  );
}

const initial: SettingsFormState = {};

export function AiPanel({
  tone,
  reply_style,
  language,
  automationNote,
}: {
  tone: string | null;
  reply_style: string | null;
  language: string;
  automationNote: string;
}) {
  const [state, action] = useFormState(updateAiSettingsAction, initial);

  return (
    <form
      action={action}
      className="cf-dashboard-panel mx-auto max-w-3xl space-y-5 overflow-hidden border-border/60 p-5 sm:p-6"
    >
      <header className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.14] via-background to-background p-5 dark:border-primary/30 dark:from-primary/[0.2]">
        <div className="pointer-events-none absolute -right-20 -top-16 size-52 rounded-full bg-primary/[0.14] blur-3xl dark:bg-primary/[0.24]" />
        <div className="relative flex items-start gap-3.5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25 dark:bg-primary/20">
            <Sparkles className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              AI-assistent
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              In 3 stappen goed ingesteld
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Kies hoe je AI klinkt, hoe antwoorden zijn opgebouwd en welke interne
              context gebruikt mag worden. Kort, duidelijk en direct toepasbaar.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-border/55 bg-background/50 p-5 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-4 flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
            <MessageCircleHeart className="size-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">1 · Zo klinkt je AI</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Beschrijf je gewenste toon in 1-2 regels.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tone" className="text-sm font-medium">
            Toon van je merk
          </Label>
          <Textarea
            id="tone"
            name="tone"
            defaultValue={tone || ""}
            className="min-h-[84px] resize-y rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
            placeholder="Bijv. professioneel, vriendelijk en zonder moeilijke woorden."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border/55 bg-background/50 p-5 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-4 flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
            <Languages className="size-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">2 · Hoe antwoorden eruitzien</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Houd het kort en actiegericht.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reply_style" className="text-sm font-medium">
            Antwoordstijl
          </Label>
          <Textarea
            id="reply_style"
            name="reply_style"
            defaultValue={reply_style || ""}
            className="min-h-[96px] resize-y rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
            placeholder="Bijv. korte zinnen, max. 1 vraag per bericht, eindig met een duidelijke vervolgstap."
          />
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="language" className="text-sm font-medium">
            Taal
          </Label>
          <Input
            id="language"
            name="language"
            defaultValue={language}
            className="max-w-[220px] rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
            placeholder="nl"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border/55 bg-background/50 p-5 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-4">
          <h3 className="text-base font-semibold tracking-tight text-foreground">3 · Interne notitie (optioneel)</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Alleen voor interne AI-richtlijn. Niet zichtbaar voor klanten.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="automation_preferences" className="text-sm font-medium">
            Notitie voor opvolging
          </Label>
          <Textarea
            id="automation_preferences"
            name="automation_preferences"
            defaultValue={automationNote}
            className="min-h-[110px] resize-y rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
            placeholder="Bijv. na 24 uur 1 vriendelijke follow-up, daarna pas na 3 dagen opnieuw."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border/55 bg-muted/20 p-4 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Kwaliteitscheck</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            "Consistente tone-of-voice op alle kanalen",
            "Elke reply eindigt met een duidelijke vervolgstap",
            "Geen overbodig jargon of lange zinnen",
            "Automations blijven menselijk en direct",
          ].map((item) => (
            <p key={item} className="flex items-start gap-2 text-sm text-foreground/90">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{item}</span>
            </p>
          ))}
        </div>
      </section>

      {state.error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-xl border border-primary/25 bg-primary/[0.08] px-4 py-3 text-sm text-primary">
          Opgeslagen. Je AI gebruikt direct deze instellingen.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-2 dark:border-white/[0.06]">
        <p className="text-xs text-muted-foreground">Tip: test direct in de inbox met een voorbeeldgesprek.</p>
        <Submit />
      </div>
    </form>
  );
}
