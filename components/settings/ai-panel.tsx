"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
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
  Bot,
  CheckCircle2,
  Languages,
  MessageCircleHeart,
  PenLine,
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
      {pending ? "Opslaan…" : "Chatbot opslaan"}
    </Button>
  );
}

const initial: SettingsFormState = {};

/** Strakke keuze met bolletje (radiogroup-pattern). */
function PresetRadioRow({
  selected,
  onSelect,
  label,
  hint,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-primary/55 bg-primary/[0.1] shadow-sm dark:border-primary/50 dark:bg-primary/[0.14]"
          : "border-border/50 bg-transparent hover:border-border hover:bg-muted/25 dark:border-white/[0.08] dark:hover:bg-white/[0.04]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-[1.125rem] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected
            ? "border-primary bg-primary shadow-[inset_0_0_0_3px_hsl(var(--background))]"
            : "border-muted-foreground/40 bg-background dark:border-white/35",
        )}
        aria-hidden
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-snug text-foreground">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}

function PresetRadioList({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-col gap-1.5 rounded-xl border border-border/40 bg-muted/[0.15] p-2 dark:border-white/[0.08] dark:bg-white/[0.03]"
      >
        {children}
      </div>
    </div>
  );
}

/** Rechterkolom: wat echt naar de AI gaat — kort, zonder ruis. */
function AiScriptField({
  editorRef,
  inputId,
  title,
  tag,
  hint,
  footnote,
  value,
  onChange,
  rows,
  placeholder,
}: {
  editorRef: RefObject<HTMLTextAreaElement>;
  inputId: string;
  title: string;
  tag?: string;
  hint: string;
  footnote?: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border/55 bg-card/90 p-4 shadow-sm dark:border-white/[0.1] dark:bg-[hsl(222_28%_11%/0.92)]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PenLine className="size-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
          <span className="text-sm font-semibold tracking-tight text-foreground">{title}</span>
        </div>
        {tag ? (
          <span className="rounded-md border border-muted-foreground/20 bg-muted/50 px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
            {tag}
          </span>
        ) : null}
      </div>
      <p className="mb-2 text-xs leading-snug text-muted-foreground">{hint}</p>
      <Label htmlFor={inputId} className="sr-only">
        {title}
      </Label>
      <Textarea
        ref={editorRef}
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          "min-h-[4.75rem] resize-y rounded-lg border border-border/70 bg-background py-2.5 text-sm leading-relaxed",
          "placeholder:text-muted-foreground/70 focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/30",
          "dark:border-white/[0.12] dark:bg-white/[0.04]",
        )}
      />
      {footnote ? (
        <p className="mt-2 text-[0.65rem] leading-relaxed text-muted-foreground">{footnote}</p>
      ) : null}
    </div>
  );
}

export function AiPanel({
  tone: initialTone,
  reply_style: initialReplyStyle,
  language: initialLanguage,
  automationNote: initialNote,
  hideIntroHeader,
}: {
  tone: string | null;
  reply_style: string | null;
  language: string;
  automationNote: string;
  /** Op gecombineerde chatbot+kennis-pagina staat de uitleg al boven de sectie. */
  hideIntroHeader?: boolean;
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

  return (
    <form
      action={action}
      className="cf-dashboard-panel w-full max-w-none space-y-5 overflow-hidden border-border/60 p-4 sm:p-6 lg:p-7"
    >
      <input type="hidden" name="tone" value={tone} />
      <input type="hidden" name="reply_style" value={replyStyle} />
      <input type="hidden" name="language" value={language} />
      <input type="hidden" name="automation_preferences" value={followNote} />

      {hideIntroHeader ? null : (
        <header className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.1] to-transparent px-4 py-4 sm:px-5 dark:border-primary/30 dark:from-primary/[0.14]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <Bot className="size-[1.125rem]" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                AI-chatbot
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Drie stappen
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Dezelfde chatbot op <strong className="font-medium text-foreground">WhatsApp</strong>,{" "}
                <strong className="font-medium text-foreground">je site</strong> en{" "}
                <strong className="font-medium text-foreground">e-mail</strong>.{" "}
                <strong className="font-medium text-foreground">Links</strong> kies je een voorbeeld (mag je overslaan).{" "}
                <strong className="font-medium text-foreground">Rechts</strong> staat wat de chatbot echt gebruikt.
              </p>
            </div>
          </div>
        </header>
      )}

      {/* Stap 1 */}
      <section className="rounded-xl border border-border/55 bg-background/50 p-4 sm:p-5 lg:p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <MessageCircleHeart className="size-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">Stap 1 — Toon</h3>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Hoe moet je chatbot tegenover klanten klinken?
            </p>
          </div>
        </div>

        <div className="mb-3 hidden gap-6 text-xs font-medium text-muted-foreground xl:grid xl:grid-cols-12">
          <div className="xl:col-span-5">Voorbeeld (optioneel)</div>
          <div className="xl:col-span-7">Dit leest de chatbot</div>
        </div>

        <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
          <div className="xl:col-span-5">
            <p className="mb-2 text-xs font-medium text-muted-foreground xl:hidden">Voorbeeld (optioneel)</p>
            <PresetRadioList id="tone-presets" label="Kies wat bij je past">
              {AI_TONE_PRESETS.map((p) => (
                <PresetRadioRow
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
            </PresetRadioList>
          </div>
          <div className="min-w-0 xl:col-span-7">
            <p className="mb-2 text-xs font-medium text-muted-foreground xl:hidden">Dit leest de chatbot</p>
            <AiScriptField
              editorRef={toneRef}
              inputId="tone-edit"
              title="Toon in je eigen woorden"
              hint="Kort of uitgebreid: beschrijf hoe de chatbot moet praten."
              value={tone}
              onChange={onToneChange}
              rows={4}
              placeholder="Bijv. Kort en warm. ‘Je’ ipv ‘u’. Geen prijzen in het eerste bericht."
            />
          </div>
        </div>
      </section>

      {/* Stap 2 */}
      <section className="rounded-xl border border-border/55 bg-background/50 p-4 sm:p-5 lg:p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <Languages className="size-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">Stap 2 — Antwoorden</h3>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Hoe kort of uitgebreid, en in welke taal de chatbot antwoordt.
            </p>
          </div>
        </div>

        <div className="mb-3 hidden gap-6 text-xs font-medium text-muted-foreground xl:grid xl:grid-cols-12">
          <div className="xl:col-span-5">Voorbeeld (optioneel)</div>
          <div className="xl:col-span-7">Dit leest de chatbot</div>
        </div>

        <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
          <div className="xl:col-span-5">
            <p className="mb-2 text-xs font-medium text-muted-foreground xl:hidden">Voorbeeld (optioneel)</p>
            <PresetRadioList id="reply-presets" label="Kies wat bij je past">
              {AI_REPLY_STYLE_PRESETS.map((p) => (
                <PresetRadioRow
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
            </PresetRadioList>
          </div>
          <div className="min-w-0 xl:col-span-7">
            <p className="mb-2 text-xs font-medium text-muted-foreground xl:hidden">Dit leest de chatbot</p>
            <AiScriptField
              editorRef={replyRef}
              inputId="reply-edit"
              title="Lengte en afsluiting"
              hint="Hoe lang mogen antwoorden ongeveer zijn, en hoe moet een bericht eindigen (bijv. met een vraag of een volgende stap)?"
              value={replyStyle}
              onChange={onReplyChange}
              rows={4}
              placeholder="Bijv. Max. vier zinnen. Altijd één concrete vervolgstap."
            />
          </div>
        </div>

        <div className="mt-5 border-t border-border/40 pt-4 dark:border-white/[0.06]">
          <Label className="text-sm font-medium text-foreground">Taal</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Standaardtaal voor antwoorden van de chatbot.
          </p>
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Taal van antwoorden"
          >
            {AI_LANGUAGE_OPTIONS.map((o) => {
              const sel = language === o.code;
              return (
                <button
                  key={o.code}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setLanguage(o.code)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                    sel
                      ? "border-primary/50 bg-primary text-primary-foreground shadow-sm"
                      : "border-border/60 bg-background/80 text-foreground hover:bg-muted/40 dark:border-white/[0.1]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded-full border-2",
                      sel ? "border-primary-foreground/80 bg-primary-foreground/20" : "border-muted-foreground/40",
                    )}
                    aria-hidden
                  >
                    {sel ? <span className="size-1.5 rounded-full bg-primary-foreground" /> : null}
                  </span>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stap 3 */}
      <section className="rounded-xl border border-border/55 bg-background/50 p-4 sm:p-5 lg:p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <StickyNote className="size-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">Stap 3 — Alleen voor jullie team</h3>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Dit komt niet in de chat bij klanten. Handig voor interne afspraken (bijv. spoed, bellen, offertes).
              Hele stap overslaan mag.
            </p>
          </div>
        </div>

        <div className="mb-3 hidden gap-6 text-xs font-medium text-muted-foreground xl:grid xl:grid-cols-12">
          <div className="xl:col-span-5">Voorbeeld (optioneel)</div>
          <div className="xl:col-span-7">Dit leest de chatbot (niet zichtbaar voor klanten)</div>
        </div>

        <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
          <div className="xl:col-span-5">
            <p className="mb-2 text-xs font-medium text-muted-foreground xl:hidden">Voorbeeld (optioneel)</p>
            <PresetRadioList id="follow-presets" label="Kies wat bij je past">
              {AI_FOLLOWUP_PRESETS.map((p) => (
                <PresetRadioRow
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
            </PresetRadioList>
          </div>
          <div className="min-w-0 xl:col-span-7">
            <p className="mb-2 text-xs font-medium text-muted-foreground xl:hidden">
              Dit leest de chatbot (niet zichtbaar voor klanten)
            </p>
            <AiScriptField
              editorRef={followRef}
              inputId="follow-edit"
              title="Extra teamregels"
              tag="Alleen intern"
              hint="Alleen voor collega’s en de chatbot — klanten zien dit niet."
              value={followNote}
              onChange={onFollowChange}
              rows={3}
              placeholder="Bijv. Spoed = ‘bel binnen 2 uur’ vermelden."
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/55 bg-muted/15 p-4 dark:border-white/[0.08]">
        <p className="text-xs font-semibold text-muted-foreground">Ter herinnering (geen verplichte velden)</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Zelfde toon op chat, mail en offerte waar het kan",
            "Einde van antwoord: concrete vervolgstap",
            "Korte zinnen, geen onnodig jargon",
            "Menselijk — geen standaardrobotzinnen",
          ].map((item) => (
            <p key={item} className="flex items-start gap-2 text-xs text-foreground/90 sm:text-sm">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary sm:size-4" aria-hidden />
              <span>{item}</span>
            </p>
          ))}
        </div>
      </section>

      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-lg border border-primary/25 bg-primary/[0.08] px-3 py-2 text-sm text-primary">
          Opgeslagen. Je chatbot gebruikt dit meteen.
        </p>
      ) : null}
      <div className="flex flex-col gap-3 border-t border-border/40 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.06]">
        <p className="text-xs text-muted-foreground sm:text-sm">
          Test in <span className="font-medium text-foreground">Chat</span> met een bericht naar jezelf.
        </p>
        <Submit />
      </div>
    </form>
  );
}
