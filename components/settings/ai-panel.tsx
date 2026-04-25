"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useCallback, useState } from "react";
import { updateAiSettingsAction, type SettingsFormState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_FOLLOWUP_PRESETS,
  AI_LANGUAGE_OPTIONS,
  AI_REPLY_STYLE_PRESETS,
  AI_TONE_PRESETS,
  matchPresetId,
} from "@/lib/ai/assistant-presets";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  Languages,
  MessageCircleHeart,
  Sparkles,
  StickyNote,
} from "lucide-react";

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

type ChoiceCardProps = {
  selected: boolean;
  onSelect: () => void;
  label: string;
  hint: string;
};

function ChoiceCard({ selected, onSelect, label, hint }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group text-left transition-all duration-200",
        "rounded-2xl border p-4 sm:p-5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-primary/45 bg-gradient-to-br from-primary/[0.12] via-primary/[0.06] to-transparent shadow-[0_12px_40px_-24px_hsl(var(--primary)/0.55)] ring-1 ring-primary/25 dark:from-primary/[0.18] dark:via-primary/[0.08] dark:ring-primary/35"
          : "border-border/60 bg-background/40 hover:border-primary/35 hover:bg-muted/25 dark:border-white/[0.1] dark:bg-white/[0.02] dark:hover:border-primary/30 dark:hover:bg-white/[0.04]",
      )}
    >
      <p className="text-sm font-semibold tracking-tight text-foreground">{label}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </button>
  );
}

export function AiPanel({
  tone: initialTone,
  reply_style: initialReplyStyle,
  language: initialLanguage,
  automationNote: initialNote,
}: {
  tone: string | null;
  reply_style: string | null;
  language: string;
  automationNote: string;
}) {
  const [state, action] = useFormState(updateAiSettingsAction, initial);

  const [tone, setTone] = useState(() => (initialTone ?? "").trim());
  const [tonePresetId, setTonePresetId] = useState<string | null>(() =>
    matchPresetId(initialTone ?? "", AI_TONE_PRESETS),
  );

  const [replyStyle, setReplyStyle] = useState(() => (initialReplyStyle ?? "").trim());
  const [replyPresetId, setReplyPresetId] = useState<string | null>(() =>
    matchPresetId(initialReplyStyle ?? "", AI_REPLY_STYLE_PRESETS),
  );

  const [language, setLanguage] = useState(() => {
    const c = (initialLanguage || "nl").trim().toLowerCase();
    const known = AI_LANGUAGE_OPTIONS.some((o) => o.code === c);
    return known ? c : "nl";
  });

  const [followNote, setFollowNote] = useState(() => (initialNote ?? "").trim());
  const [followPresetId, setFollowPresetId] = useState<string | null>(() =>
    matchPresetId(initialNote ?? "", AI_FOLLOWUP_PRESETS),
  );

  const onToneChange = useCallback((v: string) => {
    setTone(v);
    setTonePresetId(matchPresetId(v, AI_TONE_PRESETS));
  }, []);

  const onReplyChange = useCallback((v: string) => {
    setReplyStyle(v);
    setReplyPresetId(matchPresetId(v, AI_REPLY_STYLE_PRESETS));
  }, []);

  const onFollowChange = useCallback((v: string) => {
    setFollowNote(v);
    setFollowPresetId(matchPresetId(v, AI_FOLLOWUP_PRESETS));
  }, []);

  const langLabel =
    AI_LANGUAGE_OPTIONS.find((o) => o.code === language)?.label ?? language;

  return (
    <form
      action={action}
      className="cf-dashboard-panel mx-auto max-w-3xl space-y-6 overflow-hidden border-border/60 p-5 sm:p-6"
    >
      <input type="hidden" name="tone" value={tone} />
      <input type="hidden" name="reply_style" value={replyStyle} />
      <input type="hidden" name="language" value={language} />
      <input type="hidden" name="automation_preferences" value={followNote} />

      <header className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.14] via-background to-background p-5 sm:p-6 dark:border-primary/30 dark:from-primary/[0.2]">
        <div className="pointer-events-none absolute -right-24 -top-20 size-56 rounded-full bg-primary/[0.12] blur-3xl dark:bg-primary/[0.22]" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 size-40 rounded-full bg-primary/[0.08] blur-2xl" />
        <div className="relative flex items-start gap-4">
          <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner ring-1 ring-primary/25 dark:bg-primary/22 dark:ring-primary/35">
            <Sparkles className="size-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              AI-assistent
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Kies voorbeelden — pas aan wat je wilt
            </h2>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
              Je hoeft niets zelf te verzinnen: tik op een optie en de tekst wordt ingevuld. Alles blijft
              bewerkbaar. Opslaan en klaar.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-border/55 bg-background/50 p-5 sm:p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-5 flex items-start gap-3.5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
            <MessageCircleHeart className="size-[1.125rem]" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Stap 1 — Hoe klinkt je merk?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Eén keuze is genoeg. Daarna kun je de tekst nog finetunen.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {AI_TONE_PRESETS.map((p) => (
            <ChoiceCard
              key={p.id}
              selected={tonePresetId === p.id}
              onSelect={() => {
                setTone(p.value);
                setTonePresetId(p.id);
              }}
              label={p.label}
              hint={p.hint}
            />
          ))}
        </div>

        <div className="mt-5 space-y-2 border-t border-border/40 pt-5 dark:border-white/[0.06]">
          <Label htmlFor="tone-edit" className="text-sm font-medium text-foreground">
            Jouw toon (tekst die de AI gebruikt)
          </Label>
          <Textarea
            id="tone-edit"
            value={tone}
            onChange={(e) => onToneChange(e.target.value)}
            rows={4}
            className="resize-y rounded-2xl border-border/60 bg-background/90 text-sm leading-relaxed dark:border-white/[0.1] dark:bg-white/[0.03]"
            placeholder="Of schrijf hier je eigen toon in één tot drie zinnen."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border/55 bg-background/50 p-5 sm:p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-5 flex items-start gap-3.5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
            <Languages className="size-[1.125rem]" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Stap 2 — Hoe zien antwoorden eruit?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Structuur en lengte. Taal kies je eronder in één menu.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {AI_REPLY_STYLE_PRESETS.map((p) => (
            <ChoiceCard
              key={p.id}
              selected={replyPresetId === p.id}
              onSelect={() => {
                setReplyStyle(p.value);
                setReplyPresetId(p.id);
              }}
              label={p.label}
              hint={p.hint}
            />
          ))}
        </div>

        <div className="mt-5 space-y-2 border-t border-border/40 pt-5 dark:border-white/[0.06]">
          <Label htmlFor="reply-edit" className="text-sm font-medium text-foreground">
            Jouw antwoordstijl (tekst voor de AI)
          </Label>
          <Textarea
            id="reply-edit"
            value={replyStyle}
            onChange={(e) => onReplyChange(e.target.value)}
            rows={4}
            className="resize-y rounded-2xl border-border/60 bg-background/90 text-sm leading-relaxed dark:border-white/[0.1] dark:bg-white/[0.03]"
            placeholder="Of beschrijf zelf hoe lang antwoorden mogen zijn en hoe ze moeten eindigen."
          />
        </div>

        <div className="mt-6 space-y-2">
          <Label htmlFor="ai-language" className="text-sm font-medium text-foreground">
            Taal van antwoorden
          </Label>
          <p className="text-xs text-muted-foreground">
            Kies de taal waarin de AI naar klanten schrijft (los van de taal van het binnenkomende bericht).
          </p>
          <div className="relative max-w-md">
            <select
              id="ai-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={cn(
                "h-12 w-full cursor-pointer appearance-none rounded-2xl border border-border/60 bg-background/95 py-2 pl-4 pr-11",
                "text-sm font-medium text-foreground shadow-sm transition-colors",
                "hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "dark:border-white/[0.12] dark:bg-white/[0.04] dark:hover:border-primary/35",
              )}
            >
              {AI_LANGUAGE_OPTIONS.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </div>
          <p className="text-2xs text-muted-foreground/90">
            Geselecteerd: <span className="font-medium text-foreground/80">{langLabel}</span> (
            <span className="font-mono text-[0.65rem]">{language}</span>)
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border/55 bg-background/50 p-5 sm:p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-5 flex items-start gap-3.5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
            <StickyNote className="size-[1.125rem]" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Stap 3 — Extra voor jouw team (optioneel)
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Alleen intern: klanten zien dit nooit. Mag leeg blijven.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {AI_FOLLOWUP_PRESETS.map((p) => (
            <ChoiceCard
              key={p.id}
              selected={followPresetId === p.id}
              onSelect={() => {
                setFollowNote(p.value);
                setFollowPresetId(p.id);
              }}
              label={p.label}
              hint={p.hint}
            />
          ))}
        </div>

        <div className="mt-5 space-y-2 border-t border-border/40 pt-5 dark:border-white/[0.06]">
          <Label htmlFor="follow-edit" className="text-sm font-medium text-foreground">
            Eigen interne instructie
          </Label>
          <Textarea
            id="follow-edit"
            value={followNote}
            onChange={(e) => onFollowChange(e.target.value)}
            rows={3}
            className="resize-y rounded-2xl border-border/60 bg-background/90 text-sm leading-relaxed dark:border-white/[0.1] dark:bg-white/[0.03]"
            placeholder="Bijv. nooit prijzen noemen zonder eerst te bellen — alleen als jij dat zo wilt."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border/55 bg-muted/20 p-4 sm:p-5 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Zo houd je het scherp
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            "Zelfde toon op chat, mail en offerte waar het kan",
            "Elk antwoord sluit af met iets concreets om op door te gaan",
            "Korte zinnen; geen onnodig vakjargon",
            "Menselijk blijven — geen robotachtige standaardzinnen",
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3 dark:border-white/[0.06]">
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
          Tip: open <span className="font-medium text-foreground/85">Chat</span> en stuur jezelf een testbericht om
          het resultaat te zien.
        </p>
        <Submit />
      </div>
    </form>
  );
}
