"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  removeAiKnowledgePageSubmitAction,
  updateAiKnowledgeAction,
} from "@/actions/settings";
import type { SettingsFormState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AiKnowledgePage } from "@/lib/types";
import { normalizeKnowledgeWebsiteUrl } from "@/lib/url/public-site-url";
import { cn } from "@/lib/utils";
import { AI_KNOWLEDGE_MAX_PAGES } from "@/lib/ai/knowledge-crawl-config";
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Globe,
  Link2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

const initial: SettingsFormState = {};

function SubmitButton({
  disabled,
  trainStyle,
}: {
  disabled?: boolean;
  /** Botpress-achtige primaire CTA op de chatbot-setuppagina */
  trainStyle?: boolean;
}) {
  const { pending } = useFormStatus();
  if (trainStyle) {
    return (
      <Button
        type="submit"
        disabled={pending || disabled}
        size="lg"
        className="h-12 min-w-[11.5rem] rounded-xl px-8 text-base font-semibold shadow-md"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
            Even geduld…
          </>
        ) : (
          "Site laten leren"
        )}
      </Button>
    );
  }
  return (
    <Button type="submit" disabled={pending || disabled} className="rounded-xl px-6 font-semibold">
      {pending ? "Opslaan…" : "Opslaan"}
    </Button>
  );
}

export function AiKnowledgeForm({
  demoMode,
  initialWebsite,
  initialDocument,
  scannedPages,
  lastScannedAt,
  crawlCapped,
  compactHero,
}: {
  demoMode: boolean;
  initialWebsite: string;
  initialDocument: string;
  scannedPages: AiKnowledgePage[];
  lastScannedAt: string | null;
  crawlCapped: boolean;
  /** Kleinere kop op de gecombineerde chatbot+kennis-pagina. */
  compactHero?: boolean;
}) {
  const [state, action] = useFormState(updateAiKnowledgeAction, initial);
  const fileRef = useRef<HTMLInputElement>(null);
  const [docLength, setDocLength] = useState(initialDocument.length);
  const hasExtraText = initialDocument.trim().length > 0;
  const extraDetailsRef = useRef<HTMLDetailsElement>(null);
  useLayoutEffect(() => {
    const el = extraDetailsRef.current;
    if (el && hasExtraText) el.open = true;
  }, [hasExtraText]);

  const openExtraPanel = () => {
    const el = extraDetailsRef.current;
    if (!el) return;
    el.open = true;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const websiteInput = (
    <Input
      id="ai_knowledge_website"
      name="ai_knowledge_website"
      type="text"
      inputMode="url"
      autoCapitalize="none"
      spellCheck={false}
      placeholder="jouwbedrijf.nl"
      defaultValue={initialWebsite}
      disabled={demoMode}
      className={cn(
        "rounded-xl border-border/60 bg-background/90 text-foreground shadow-inner-soft dark:border-white/[0.12] dark:bg-[hsl(228_24%_8%)]",
        compactHero
          ? "h-14 border-2 px-4 text-base ring-offset-background focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
          : "h-11 text-base shadow-sm dark:border-white/[0.1]",
      )}
      autoComplete="url"
      onBlur={(e) => {
        const el = e.currentTarget;
        const next = normalizeKnowledgeWebsiteUrl(el.value);
        if (next && next !== el.value) el.value = next;
      }}
    />
  );

  const extraTextPanel = (
    <details
      ref={extraDetailsRef}
      className={cn(
        "group border border-border/50 bg-muted/20 dark:border-white/[0.08] dark:bg-white/[0.02]",
        compactHero ? "rounded-2xl p-4" : "rounded-2xl bg-gradient-to-br from-muted/25 to-transparent p-5 sm:p-6",
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl outline-none marker:content-none [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/80 text-primary shadow-sm ring-1 ring-border/50 dark:bg-white/[0.04] dark:ring-white/[0.08]">
            <FileText className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-foreground">Extra tekst of bestand</p>
            <p className="text-2xs text-muted-foreground">Optioneel — prijzen, FAQ, .txt / .md</p>
          </div>
        </div>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-4 space-y-4 border-t border-border/40 pt-4 dark:border-white/[0.08]">
        <div className="flex flex-wrap items-start justify-end gap-3">
          {!demoMode ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const ta = document.getElementById("ai_knowledge_document") as HTMLTextAreaElement | null;
                    if (ta && typeof reader.result === "string") {
                      ta.value = reader.result.slice(0, 48_000);
                      setDocLength(ta.value.length);
                    }
                  };
                  reader.readAsText(f, "UTF-8");
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl border-border/60 text-xs font-medium dark:border-white/[0.1]"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-3.5 opacity-80" aria-hidden />
                .txt / .md
              </Button>
            </div>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai_knowledge_document" className="text-2xs font-medium text-muted-foreground">
            Kennisbank (tekst)
          </Label>
          <Textarea
            id="ai_knowledge_document"
            name="ai_knowledge_document"
            rows={compactHero ? 8 : 14}
            placeholder="Plak hier prijslijsten, openingstijden, FAQ…"
            defaultValue={initialDocument}
            disabled={demoMode}
            onChange={(e) => setDocLength(e.target.value.length)}
            className={cn(
              "max-h-[min(70vh,28rem)] resize-y rounded-xl border-border/60 bg-background/80 p-4 text-sm leading-relaxed shadow-inner-soft",
              "min-h-[160px] placeholder:text-muted-foreground/70 dark:border-white/[0.1] dark:bg-[hsl(228_24%_8%)]",
              !compactHero && "min-h-[220px]",
            )}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-2xs text-muted-foreground dark:border-white/[0.06]">
          <span>Max. 48.000 tekens · geen gevoelige klantdata</span>
          <span className={cn("font-medium", docLength > 43000 && "text-amber-600 dark:text-amber-300")}>
            {docLength.toLocaleString("nl-NL")} / 48.000
          </span>
        </div>
      </div>
    </details>
  );

  const scannedPagesBlock = (
    <section
      className={cn(
        "space-y-3 rounded-2xl border border-border/50 bg-gradient-to-br from-muted/25 to-transparent p-5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-6",
        compactHero && "border-dashed border-border/60 bg-muted/15 p-4 dark:border-white/[0.1]",
      )}
    >
      {scannedPages.length === 0 ? (
        <>
          {!compactHero ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-background/80 text-primary shadow-sm ring-1 ring-border/50 dark:bg-white/[0.04] dark:ring-white/[0.08]">
                    <Link2 className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Pagina&apos;s van je site</p>
                    <p className="text-2xs text-muted-foreground">
                      {lastScannedAt
                        ? `Laatst bijgewerkt: ${new Date(lastScannedAt).toLocaleString("nl-NL")}`
                        : "Nog geen scan"}
                    </p>
                  </div>
                </div>
              </div>
              <p className="rounded-xl border border-dashed border-border/60 bg-background/65 px-4 py-3 text-xs text-muted-foreground dark:border-white/[0.1] dark:bg-white/[0.02]">
                Nog geen pagina&apos;s. Vul hierboven je site in en klik op Opslaan.
              </p>
            </>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Na <span className="font-medium text-foreground">Site laten leren</span> vullen we automatisch pagina&apos;s
              van je domein (max. {AI_KNOWLEDGE_MAX_PAGES}).
            </p>
          )}
        </>
      ) : (
        <details className="group rounded-xl border border-border/55 bg-background/50 dark:border-white/[0.1] dark:bg-white/[0.03]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/80 text-primary shadow-sm ring-1 ring-border/50 dark:bg-white/[0.04] dark:ring-white/[0.08]">
                <Link2 className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Pagina&apos;s van je site</p>
                <p className="text-2xs text-muted-foreground">
                  {lastScannedAt ? `Laatst: ${new Date(lastScannedAt).toLocaleString("nl-NL")} · ` : ""}
                  {scannedPages.length} URL{scannedPages.length === 1 ? "" : "s"} — klik om te tonen
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-2xs font-medium text-muted-foreground dark:border-white/[0.12]">
                {scannedPages.length}
              </span>
              <ChevronDown
                className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </div>
          </summary>
          {crawlCapped ? (
            <p className="border-t border-amber-500/20 bg-amber-500/[0.06] px-4 py-2.5 text-xs text-amber-950 dark:border-amber-500/25 dark:text-amber-100/95">
              Er staan nog meer pagina&apos;s op je site: we stoppen bij {AI_KNOWLEDGE_MAX_PAGES} URL&apos;s per scan.
              Dit zijn de eerste {scannedPages.length}; opnieuw opslaan na verwijderen kan andere pagina&apos;s opleveren.
            </p>
          ) : (
            <p className="border-t border-border/40 px-4 py-2 text-2xs text-muted-foreground dark:border-white/[0.08]">
              {scannedPages.length} pagina&apos;s opgeslagen voor dit domein (max. {AI_KNOWLEDGE_MAX_PAGES} per scan).
            </p>
          )}
          <ul className="max-h-[min(70vh,28rem)] space-y-2 overflow-y-auto border-t border-border/40 px-3 py-3 dark:border-white/[0.08]">
            {scannedPages.map((page) => (
              <li
                key={page.url}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border/55 bg-background/70 px-3.5 py-3 dark:border-white/[0.1] dark:bg-white/[0.02]"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{page.title || page.url}</p>
                  <p className="truncate text-2xs text-muted-foreground">{page.url}</p>
                </div>
                {!demoMode ? (
                  <form action={removeAiKnowledgePageSubmitAction}>
                    <input type="hidden" name="url" value={page.url} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg border-border/60 px-2.5 text-2xs dark:border-white/[0.12]"
                    >
                      <Trash2 className="mr-1 size-3.5" aria-hidden />
                      Verwijderen
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );

  if (compactHero) {
    return (
      <form action={action} className="mx-auto max-w-lg">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-[0_24px_80px_-48px_hsl(222_47%_11%/0.45)] dark:border-white/[0.09] dark:bg-[hsl(228_28%_6%)] dark:shadow-[0_28px_90px_-40px_rgba(0,0,0,0.65)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.2]"
            style={{
              backgroundImage: "radial-gradient(circle at center, hsl(var(--muted-foreground) / 0.22) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
            aria-hidden
          />
          <div className="relative space-y-6 px-6 py-9 sm:px-10 sm:py-11">
            {state?.error ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {state.error}
              </p>
            ) : null}
            {state?.ok ? (
              <p className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-950 dark:border-emerald-500/25 dark:text-emerald-100/95">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <span>
                  <span className="font-semibold">Klaar.</span> Je bot gebruikt nu deze bronnen — test gerust in
                  Berichten zodra je kanalen staan.
                </span>
              </p>
            ) : null}

            <div className="flex justify-center gap-2" aria-hidden>
              <span className="size-2 rounded-full bg-primary shadow-sm shadow-primary/40" />
              <span className="size-2 rounded-full bg-muted-foreground/20 dark:bg-white/15" />
              <span className="size-2 rounded-full bg-muted-foreground/20 dark:bg-white/15" />
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
                Heb je een website?
              </h2>
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                We lezen je publieke pagina&apos;s (tot {AI_KNOWLEDGE_MAX_PAGES} op hetzelfde domein) zodat je chatbot
                antwoordt op basis van jouw echte inhoud — één site als bron, zonder ingewikkelde stappen.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai_knowledge_website" className="sr-only">
                Website-URL
              </Label>
              {websiteInput}
              <p className="text-center text-xs text-muted-foreground">
                <code className="rounded bg-muted/80 px-1 font-mono text-[0.65rem]">https://</code> mag weggelaten;
                sitemap wordt automatisch meegenomen.
              </p>
            </div>

            {scannedPages.length > 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/35 bg-emerald-500/[0.07] px-4 py-3.5 dark:border-emerald-500/25 dark:bg-emerald-500/[0.08]">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
                  <Globe className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Website</p>
                  <p className="text-xs text-muted-foreground">
                    {scannedPages.length}{" "}
                    {scannedPages.length === 1 ? "pagina" : "pagina’s"} in je kennis
                    {lastScannedAt ? ` · ${new Date(lastScannedAt).toLocaleDateString("nl-NL")}` : ""}
                  </p>
                </div>
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
              </div>
            ) : null}

            {scannedPagesBlock}

            {extraTextPanel}

            <div className="flex flex-col-reverse gap-4 border-t border-border/50 pt-6 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="h-auto justify-center px-2 py-2 text-sm font-normal text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 hover:bg-transparent hover:text-foreground sm:justify-start"
                onClick={openExtraPanel}
              >
                Geen website — werk met tekst
              </Button>
              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                <SubmitButton disabled={demoMode} trainStyle />
                {demoMode ? (
                  <span className="text-center text-xs font-medium text-amber-700 dark:text-amber-300/95 sm:text-right">
                    Demo — alleen lezen
                  </span>
                ) : null}
              </div>
            </div>

            <p className="flex items-start justify-center gap-2 text-center text-2xs text-muted-foreground sm:text-xs">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary opacity-80" aria-hidden />
              <span className="max-w-md">
                Eén URL, één actie — daarna koppel je kanalen en test je je bot in Berichten.
              </span>
            </p>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form action={action} className="mx-auto max-w-5xl space-y-6">
      <div className="cf-dashboard-panel overflow-hidden border-border/60">
        <div className="relative border-b border-border/40 bg-gradient-to-br from-primary/[0.1] via-transparent to-accent/[0.05] px-6 py-7 dark:border-white/[0.06] dark:from-primary/[0.16] sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20 dark:bg-primary/20 dark:ring-primary/30">
              <Sparkles className="size-7" strokeWidth={1.5} aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <h2 className="text-balance text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Train je AI op jouw site
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Bij opslaan lezen we je site (incl. sitemap waar beschikbaar) en slaan we tot {AI_KNOWLEDGE_MAX_PAGES}{" "}
                pagina&apos;s op hetzelfde domein op. De lijst met URL’s staat standaard dicht; klik om alles te bekijken
                of te verwijderen.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          {state?.error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          {state?.ok ? (
            <p className="rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm text-primary">
              Opgeslagen.
            </p>
          ) : null}

          <section className="space-y-4 rounded-2xl border border-border/50 bg-gradient-to-br from-muted/25 to-transparent p-5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-background/80 text-primary shadow-sm ring-1 ring-border/50 dark:bg-white/[0.04] dark:ring-white/[0.08]">
                <Globe className="size-4" aria-hidden />
              </span>
              <div>
                <Label htmlFor="ai_knowledge_website" className="text-sm font-semibold text-foreground">
                  Je website
                </Label>
                <p className="text-2xs text-muted-foreground">Domein van je bedrijfs- of shop-site</p>
              </div>
            </div>
            {websiteInput}
            <p className="text-xs leading-relaxed text-muted-foreground">
              Zonder <code className="rounded bg-muted px-1 font-mono text-[0.65rem]">https://</code> mag ook — wordt
              bij opslaan aangevuld. Alleen pagina&apos;s op dit domein.
            </p>
          </section>

          {scannedPagesBlock}

          {extraTextPanel}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/55 bg-background/70 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>Na opslaan gebruikt je bot meteen deze bronnen.</span>
            </div>
            <SubmitButton disabled={demoMode} />
            {demoMode ? (
              <span className="rounded-full border border-amber-500/25 bg-amber-500/[0.08] px-3 py-1 text-xs font-medium text-amber-950 dark:text-amber-100/95">
                Demo — alleen lezen
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
