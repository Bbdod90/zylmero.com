"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useCallback, useRef, useState, type RefObject } from "react";
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
  PenLine,
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

/** Rechterkolom: maakt expliciet dat dit het bewerkbare AI-script is. */
function AiLiveEditorPanel({
  presetAnchorId,
  editorRef,
  inputId,
  headline,
  badge,
  helper,
  value,
  onChange,
  rows,
  placeholder,
}: {
  presetAnchorId: string;
  editorRef: RefObject<HTMLTextAreaElement>;
  inputId: string;
  headline: string;
  badge: string;
  helper: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  placeholder: string;
}) {
  const scrollToPresets = () => {
    document.getElementById(presetAnchorId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col rounded-2xl border-2 border-primary/25 bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-transparent p-[3px] shadow-[0_20px_50px_-28px_hsl(var(--primary)/0.35)]",
        "dark:border-primary/40 dark:from-primary/[0.14] dark:via-primary/[0.06] dark:to-transparent",
      )}
    >
      <div className="flex min-h-[min(100%,22rem)] flex-1 flex-col rounded-[13px] bg-background/98 p-4 sm:p-5 dark:bg-[hsl(222_28%_10%/0.97)]">
        <div className="mb-3 flex flex-col gap-3 border-b border-border/40 pb-3 sm:flex-row sm:items-start sm:justify-between dark:border-white/[0.08]">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <PenLine className="size-4" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight text-foreground">{headline}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{helper}</p>
            </div>
          </div>
          <span className="shrink-0 self-start rounded-full bg-primary px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-sm">
            {badge}
          </span>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-primary/25 text-xs font-semibold hover:bg-primary/[0.06]"
            onClick={scrollToPresets}
          >
            Voorbeelden hierboven
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 rounded-lg bg-primary text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/92"
            onClick={() => editorRef.current?.focus()}
          >
            Ik typ zelf — focus veld
          </Button>
        </div>

        <Label htmlFor={inputId} className="sr-only">
          {headline}
        </Label>
        <Textarea
          ref={editorRef}
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={cn(
            "min-h-[9.5rem] flex-1 resize-y rounded-xl border-2 border-primary/20 bg-background/90 py-3.5 text-sm leading-relaxed transition-shadow",
            "placeholder:text-muted-foreground/75 focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/35",
            "dark:border-primary/30 dark:bg-white/[0.04]",
          )}
        />
        <p className="mt-2.5 text-[0.7rem] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground/90">Dit veld telt.</span> De AI gebruikt{" "}
          <span className="italic">exact</span> wat je hier neerzet — ook als je alles wist en zelf typt.
          Klik eerst een voorbeeld, of begin direct hier.
        </p>
      </div>
    </div>
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

  const toneRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const followRef = useRef<HTMLTextAreaElement>(null);

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
      className="cf-dashboard-panel w-full space-y-6 overflow-hidden border-border/60 p-5 sm:p-6 lg:p-8"
    >
      <input type="hidden" name="tone" value={tone} />
      <input type="hidden" name="reply_style" value={replyStyle} />
      <input type="hidden" name="language" value={language} />
      <input type="hidden" name="automation_preferences" value={followNote} />

      <header className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.14] via-background to-background p-5 sm:p-6 lg:p-8 dark:border-primary/30 dark:from-primary/[0.2]">
        <div className="pointer-events-none absolute -right-24 -top-20 size-56 rounded-full bg-primary/[0.12] blur-3xl dark:bg-primary/[0.22]" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 size-40 rounded-full bg-primary/[0.08] blur-2xl" />
        <div className="relative grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="flex items-start gap-4 lg:col-span-7">
            <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner ring-1 ring-primary/25 dark:bg-primary/22 dark:ring-primary/35">
              <Sparkles className="size-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                AI-assistent
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                Voorbeelden + jouw eigen woorden
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                Links kies je snel een basis; rechts staat het <strong className="font-semibold text-foreground">tekstveld dat de AI echt leest</strong>. Typ daar gerust je volledige eigen tekst — niets is verplicht uit de kaarten.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary/[0.06] px-4 py-3 text-sm leading-relaxed text-foreground/90 dark:border-primary/25 dark:bg-primary/[0.1] lg:col-span-5">
            <p className="font-semibold text-foreground">Zo werkt het</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-muted-foreground">
              <li>Klik een voorbeeld — de tekst verschijnt rechts.</li>
              <li>Pas alles aan in het grote veld, of wis het en typ zelf.</li>
              <li>Opslaan — klaar.</li>
            </ol>
          </div>
        </div>
      </header>

      {/* Stap 1 */}
      <section className="rounded-2xl border border-border/55 bg-background/50 p-5 sm:p-6 lg:p-8 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-6 flex items-start gap-3.5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
            <MessageCircleHeart className="size-[1.125rem]" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Stap 1 — Hoe klinkt je merk?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Twee kolommen op groot scherm: voorbeelden links, <span className="font-medium text-foreground">jouw tekst voor de AI</span> rechts.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12 xl:gap-8">
          <div id="tone-presets" className="space-y-3 xl:col-span-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Voorbeelden — één klik
            </p>
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
          </div>
          <div className="min-h-0 xl:col-span-6">
            <AiLiveEditorPanel
              presetAnchorId="tone-presets"
              editorRef={toneRef}
              inputId="tone-edit"
              headline="Jouw toon — dit leest de AI"
              badge="Live tekst"
              helper="Typ hier je eigen zinnen, of pas een gekozen voorbeeld aan. Je mag ook direct typen zonder eerst een kaart te kiezen."
              value={tone}
              onChange={onToneChange}
              rows={5}
              placeholder="Bijv. Kort en warm. We spreken klanten aan met ‘je’. Geen prijzen in het eerste bericht."
            />
          </div>
        </div>
      </section>

      {/* Stap 2 */}
      <section className="rounded-2xl border border-border/55 bg-background/50 p-5 sm:p-6 lg:p-8 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-6 flex items-start gap-3.5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
            <Languages className="size-[1.125rem]" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Stap 2 — Hoe zien antwoorden eruit?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Zelfde patroon: voorbeelden links, <span className="font-medium text-foreground">jouw instructies</span> rechts. Taal kies je onderaan deze stap.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12 xl:gap-8">
          <div id="reply-presets" className="space-y-3 xl:col-span-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Voorbeelden — één klik
            </p>
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
          </div>
          <div className="min-h-0 xl:col-span-6">
            <AiLiveEditorPanel
              presetAnchorId="reply-presets"
              editorRef={replyRef}
              inputId="reply-edit"
              headline="Jouw antwoordstijl — dit leest de AI"
              badge="Live tekst"
              helper="Beschrijf lengte, structuur en hoe je wilt afsluiten (bijv. met een concrete stap). Volledig eigen tekst is prima."
              value={replyStyle}
              onChange={onReplyChange}
              rows={5}
              placeholder="Bijv. Max. vier zinnen. Sluit altijd af met één duidelijke vraag of actie (bellen, offerte, link)."
            />
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 dark:border-white/[0.06]">
          <Label htmlFor="ai-language" className="text-sm font-medium text-foreground">
            Taal van antwoorden
          </Label>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground sm:text-sm">
            Kies de taal waarin de AI naar klanten schrijft (los van de taal van het binnenkomende bericht).
          </p>
          <div className="relative mt-3 max-w-lg">
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
          <p className="mt-2 text-2xs text-muted-foreground/90">
            Geselecteerd: <span className="font-medium text-foreground/80">{langLabel}</span> (
            <span className="font-mono text-[0.65rem]">{language}</span>)
          </p>
        </div>
      </section>

      {/* Stap 3 */}
      <section className="rounded-2xl border border-border/55 bg-background/50 p-5 sm:p-6 lg:p-8 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-6 flex items-start gap-3.5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
            <StickyNote className="size-[1.125rem]" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Stap 3 — Extra voor jouw team (optioneel)
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Alleen intern. Ook hier: rechts <span className="font-medium text-foreground">eigen regels</span> intypen is mogelijk — klanten zien dit nooit.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12 xl:gap-8">
          <div id="follow-presets" className="space-y-3 xl:col-span-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Voorbeelden — één klik
            </p>
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
          </div>
          <div className="min-h-0 xl:col-span-6">
            <AiLiveEditorPanel
              presetAnchorId="follow-presets"
              editorRef={followRef}
              inputId="follow-edit"
              headline="Eigen interne instructie — alleen voor jullie"
              badge="Team only"
              helper="Typ hier extra afspraken voor je team (niet zichtbaar voor klanten). Leeg laten is oké."
              value={followNote}
              onChange={onFollowChange}
              rows={4}
              placeholder="Bijv. Bij spoed altijd ‘bel binnen 2 uur’ vermelden. Geen kortingscodes in chat tenzij goedgekeurd."
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/55 bg-muted/20 p-4 sm:p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Zo houd je het scherp
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="flex flex-col gap-4 border-t border-border/40 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between dark:border-white/[0.06]">
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Tip: open <span className="font-medium text-foreground/85">Chat</span> en stuur jezelf een testbericht om het resultaat te zien.
        </p>
        <Submit />
      </div>
    </form>
  );
}
