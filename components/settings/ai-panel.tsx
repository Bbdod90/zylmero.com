"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateAiSettingsAction, type SettingsFormState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Languages, MessageCircleHeart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/55 bg-background/50 p-5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
          <Icon className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

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
      className="cf-dashboard-panel mx-auto max-w-4xl space-y-6 overflow-hidden border-border/60 p-6 sm:p-8"
    >
      <header className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.14] via-background to-background p-5 dark:border-primary/30 dark:from-primary/[0.2] sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-16 size-56 rounded-full bg-primary/[0.14] blur-3xl dark:bg-primary/[0.24]" />
        <div className="relative flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25 dark:bg-primary/20">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              AI-assistant
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Maak je AI tone-of-voice premium
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Deze instellingen sturen hoe je AI praat, opvolgt en samenvat. Stel het eenmaal goed in
              voor een consistente, professionele klantervaring in inbox, automations en suggesties.
            </p>
          </div>
        </div>
      </header>

      <Section
        icon={MessageCircleHeart}
        title="1 · Toon en antwoordstijl"
        subtitle="Zo klinkt je merk in elk AI-antwoord en follow-upbericht."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tone" className="text-sm font-medium">
              Toon
            </Label>
            <Textarea
              id="tone"
              name="tone"
              defaultValue={tone || ""}
              className="min-h-[96px] resize-y rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
              placeholder="Bijv. professioneel, warm, duidelijk en zonder jargon."
            />
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
              placeholder="Bijv. korte alinea's, altijd een concrete volgende stap, afsluiten met duidelijke call-to-action."
            />
          </div>
        </div>
      </Section>

      <Section
        icon={Languages}
        title="2 · Taal en interne notities"
        subtitle="Bepaal outputtaal en context voor automatiseringen."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">
              Taal
            </Label>
            <Input
              id="language"
              name="language"
              defaultValue={language}
              className="rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="automation_preferences" className="text-sm font-medium">
              Notities automatisering
            </Label>
            <Textarea
              id="automation_preferences"
              name="automation_preferences"
              defaultValue={automationNote}
              className="min-h-[140px] resize-y rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
              placeholder="Beschrijf hoe assertief opvolging moet zijn, welke uitzonderingen gelden en welke tone altijd veilig is."
            />
          </div>
        </div>
      </Section>

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
          Opgeslagen. Je AI-assistant gebruikt nu de nieuwe stijl.
        </p>
      ) : null}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-2 dark:border-white/[0.06]",
        )}
      >
        <p className="text-xs text-muted-foreground">Tip: test direct in de inbox met een voorbeeldgesprek.</p>
        <Submit />
      </div>
    </form>
  );
}
