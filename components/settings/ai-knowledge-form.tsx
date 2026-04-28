"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import {
  previewChatbotVisitorMessageAction,
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
import { CopyButton } from "@/components/growth/copy-button";
import {
  CheckCircle2,
  ChevronDown,
  Code,
  FileText,
  Globe,
  Inbox,
  Link2,
  Loader2,
  Mail,
  MessageCircle,
  SendHorizontal,
  Share2,
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
          "Opslaan"
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
  digestNl,
  siteOrigin,
  embedToken,
}: {
  demoMode: boolean;
  initialWebsite: string;
  initialDocument: string;
  scannedPages: AiKnowledgePage[];
  lastScannedAt: string | null;
  crawlCapped: boolean;
  /** Kleinere kop op de gecombineerde chatbot+kennis-pagina. */
  compactHero?: boolean;
  /** Auto-samenvatting (NL) na opslaan, voor op de pagina. */
  digestNl?: string | null;
  siteOrigin?: string;
  embedToken?: string | null;
}) {
  const router = useRouter();
  const [state, action] = useFormState(updateAiKnowledgeAction, initial);
  const fileRef = useRef<HTMLInputElement>(null);
  const [localDigest, setLocalDigest] = useState<string | null>(() => digestNl ?? null);
  const [localPageCount, setLocalPageCount] = useState<number | null>(null);
  const [docLength, setDocLength] = useState(initialDocument.length);
  const [previewInput, setPreviewInput] = useState("");
  const [previewLog, setPreviewLog] = useState<{ role: "user" | "assistant"; content: string }[]>(
    [],
  );
  const [previewPending, startPreviewTransition] = useTransition();
  const hasExtraText = initialDocument.trim().length > 0;
  const extraDetailsRef = useRef<HTMLDetailsElement>(null);
  const idBase = useId().replace(/:/g, "");
  const removeFormIdFor = (i: number) => `${idBase}-rm${i}`;

  useLayoutEffect(() => {
    const el = extraDetailsRef.current;
    if (el && hasExtraText) el.open = true;
  }, [hasExtraText]);

  useEffect(() => {
    setLocalDigest(digestNl ?? null);
    setLocalPageCount(null);
  }, [digestNl]);

  useEffect(() => {
    if (!state?.ok) return;
    if (state.digest_nl !== undefined) setLocalDigest(state.digest_nl);
    if (typeof state.scanned_pages_count === "number") {
      setLocalPageCount(state.scanned_pages_count);
    }
    router.refresh();
  }, [state?.ok, state?.digest_nl, state?.scanned_pages_count, router]);

  const runPreviewQuestion = (raw: string) => {
    const text = raw.trim();
    if (!text || demoMode) return;
    setPreviewLog((prev) => [...prev, { role: "user", content: text }]);
    startPreviewTransition(async () => {
      const res = await previewChatbotVisitorMessageAction(text);
      if (res.ok) {
        setPreviewLog((prev) => [...prev, { role: "assistant", content: res.reply }]);
      } else {
        setPreviewLog((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Dat lukte even niet: ${res.error}`,
          },
        ]);
      }
    });
  };

  const sendPreview = () => {
    const text = previewInput.trim();
    if (!text) return;
    setPreviewInput("");
    runPreviewQuestion(text);
  };

  const embedSnippet =
    siteOrigin && embedToken
      ? `<script src="${siteOrigin.replace(/\/$/, "")}/api/embed/widget?token=${encodeURIComponent(embedToken)}" async></script>`
      : null;

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

  /** Losse formulieren + `form=""` op knoppen: voorkomt geneste &lt;form&gt; die de hoofd-submit breekt. */
  const removeFormSlots =
    !demoMode && scannedPages.length > 0 ? (
      scannedPages.map((page, i) => (
        <form
          key={page.url}
          id={removeFormIdFor(i)}
          action={removeAiKnowledgePageSubmitAction}
          className="sr-only"
          aria-hidden
        >
          <input type="hidden" name="url" value={page.url} />
        </form>
      ))
    ) : null;

  const buildScannedPagesBlock = (getRemoveFormId: (i: number) => string) => (
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
            {scannedPages.map((page, i) => (
              <li
                key={page.url}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border/55 bg-background/70 px-3.5 py-3 dark:border-white/[0.1] dark:bg-white/[0.02]"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{page.title || page.url}</p>
                  <p className="truncate text-2xs text-muted-foreground">{page.url}</p>
                </div>
                {!demoMode ? (
                  <Button
                    type="submit"
                    form={getRemoveFormId(i)}
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg border-border/60 px-2.5 text-2xs dark:border-white/[0.12]"
                  >
                    <Trash2 className="mr-1 size-3.5" aria-hidden />
                    Verwijderen
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );

  if (compactHero) {
    const resolvedPageCount = localPageCount ?? scannedPages.length;
    const suggestionChips = [
      "Wat doen jullie?",
      "Wat zijn jullie openingstijden?",
      "Hoe kan ik contact opnemen?",
    ];
    return (
      <div className="mx-auto w-full max-w-7xl space-y-8 pb-28 sm:pb-10">
        {removeFormSlots}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <form id="zyl-kennis-form" action={action} className="block min-w-0">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-[0_24px_80px_-48px_hsl(222_47%_11%/0.45)] dark:border-white/[0.09] dark:bg-[hsl(228_28%_6%)] dark:shadow-[0_28px_90px_-40px_rgba(0,0,0,0.65)]">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.2]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at center, hsl(var(--muted-foreground) / 0.22) 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
                aria-hidden
              />
              <div className="relative space-y-6 px-6 py-8 sm:px-10 sm:py-10">
                {state?.error ? (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {state.error}
                  </p>
                ) : null}
                {state?.ok ? (
                  <p className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-950 dark:border-emerald-500/25 dark:text-emerald-100/95">
                    <CheckCircle2
                      className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden
                    />
                    <span>
                      <span className="font-semibold">Opgeslagen.</span> Je bot is bijgewerkt — de samenvatting en
                      preview rechts horen bij je laatste opslag.
                    </span>
                  </p>
                ) : null}

                <div className="space-y-2">
                  <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
                    Jouw website
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Vul je adres in en druk op <span className="font-medium text-foreground">Opslaan</span>. Wij lezen
                    automatisch je openbare pagina&apos;s (tot {AI_KNOWLEDGE_MAX_PAGES}) en koppelen ze aan je chatbot —
                    zonder ingewikkelde stappen.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai_knowledge_website" className="text-sm font-medium text-foreground">
                    Website-adres
                  </Label>
                  {websiteInput}
                  <p className="text-xs text-muted-foreground">
                    <code className="rounded bg-muted/80 px-1 font-mono text-[0.65rem]">https://</code> mag weggelaten.
                    Sitemap wordt automatisch meegenomen.
                  </p>
                </div>

                {resolvedPageCount > 0 ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/35 bg-emerald-500/[0.07] px-4 py-3.5 dark:border-emerald-500/25 dark:bg-emerald-500/[0.08]">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
                      <Globe className="size-5" strokeWidth={1.75} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">Gekoppelde pagina&apos;s</p>
                      <p className="text-xs text-muted-foreground">
                        {resolvedPageCount}{" "}
                        {resolvedPageCount === 1 ? "pagina" : "pagina’s"} opgeslagen
                        {lastScannedAt && scannedPages.length > 0
                          ? ` · ${new Date(lastScannedAt).toLocaleDateString("nl-NL")}`
                          : ""}
                      </p>
                    </div>
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  </div>
                ) : null}

                {resolvedPageCount > 0 && scannedPages.length === 0 ? (
                  <p className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground dark:border-white/[0.08]">
                    De lijst met pagina&apos;s wordt zo bijgewerkt in je scherm.
                  </p>
                ) : null}

                {buildScannedPagesBlock(removeFormIdFor)}

                {extraTextPanel}

                <div className="flex flex-col-reverse gap-4 border-t border-border/50 pt-6 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto justify-start px-2 py-2 text-sm font-normal text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 hover:bg-transparent hover:text-foreground"
                    onClick={openExtraPanel}
                  >
                    Geen website — alleen tekst plakken
                  </Button>
                  <div className="hidden flex-col items-stretch gap-2 sm:flex sm:items-end">
                    <SubmitButton disabled={demoMode} trainStyle />
                    {demoMode ? (
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300/95">
                        Demo — alleen lezen
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="flex items-start gap-2 text-xs text-muted-foreground sm:text-sm">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary opacity-80" aria-hidden />
                  <span>
                    Na opslaan gebruikt je bot meteen deze bronnen. WhatsApp, mail en je eigen site stel je hieronder
                    in — dat zijn losse schakels, geen extra &apos;stappen&apos; op deze pagina.
                  </span>
                </p>
              </div>
            </div>

            <div
              className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-background/95 p-3 shadow-[0_-10px_40px_-8px_rgba(0,0,0,0.12)] backdrop-blur-md dark:border-white/[0.1] dark:bg-[hsl(228_32%_6%/0.94)] sm:hidden"
              aria-label="Opslaan"
            >
              <div className="mx-auto w-full max-w-7xl px-1">
                <SubmitButton disabled={demoMode} trainStyle />
                {demoMode ? (
                  <p className="mt-2 text-center text-xs text-amber-700">Demo — alleen lezen</p>
                ) : null}
              </div>
            </div>
          </form>

          <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6">
            <div className="rounded-[1.5rem] border border-border/60 bg-card p-5 shadow-sm dark:border-white/[0.1] sm:p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" aria-hidden />
                <h3 className="text-lg font-bold tracking-tight text-foreground">Wat je bot onthoudt</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Dit is automatisch gemaakt op basis van je site en eventuele extra tekst. Je hoeft dit niet handmatig in
                te vullen.
              </p>
              <div className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-4 text-sm leading-relaxed text-foreground dark:border-white/[0.08]">
                {localDigest?.trim() ? (
                  <p className="whitespace-pre-wrap">{localDigest}</p>
                ) : resolvedPageCount > 0 ? (
                  <p className="text-muted-foreground">
                    We hebben {resolvedPageCount} pagina&apos;s gelezen voor je bot. De korte puntsgewijze samenvatting
                    kon niet worden gemaakt; je antwoorden gebruiken wel gewoon alle opgeslagen tekst.
                  </p>
                ) : initialDocument.trim().length > 0 ? (
                  <p className="text-muted-foreground">
                    Je extra tekst staat klaar voor de bot. Voeg desgewenst nog een website toe voor meer context.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Nog leeg — vul je website in en druk op <span className="font-medium text-foreground">Opslaan</span>.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col rounded-[1.5rem] border border-border/60 bg-card shadow-sm dark:border-white/[0.1]">
              <div className="border-b border-border/50 px-5 py-4 dark:border-white/[0.08] sm:px-6">
                <h3 className="text-lg font-bold tracking-tight text-foreground">Preview</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Stel een vraag zoals een bezoeker van je site. Antwoorden gebruiken dezelfde kennis als je echte bot.
                </p>
              </div>
              <div className="min-h-[200px] flex-1 space-y-3 overflow-y-auto px-5 py-4 sm:px-6">
                {previewLog.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border/60 bg-muted/15 px-3 py-6 text-center text-sm text-muted-foreground">
                    {demoMode
                      ? "Preview werkt niet in demo-modus."
                      : "Typ hieronder een vraag of kies een voorbeeld."}
                  </p>
                ) : (
                  previewLog.map((m, i) => (
                    <div
                      key={`${i}-${m.role}`}
                      className={cn(
                        "max-w-[95%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "mr-auto border border-border/60 bg-muted/30 text-foreground dark:border-white/[0.1]",
                      )}
                    >
                      {m.content}
                    </div>
                  ))
                )}
                {previewPending ? (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    Antwoord wordt gemaakt…
                  </p>
                ) : null}
              </div>
              <div className="space-y-3 border-t border-border/50 px-5 py-4 dark:border-white/[0.08] sm:px-6">
                <div className="flex flex-wrap gap-2">
                  {suggestionChips.map((q) => (
                    <Button
                      key={q}
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 rounded-full text-xs font-medium"
                      disabled={demoMode || previewPending}
                      onClick={() => runPreviewQuestion(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={previewInput}
                    onChange={(e) => setPreviewInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendPreview();
                      }
                    }}
                    placeholder="Typ je vraag…"
                    disabled={demoMode || previewPending}
                    className="rounded-xl"
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="size-10 shrink-0 rounded-xl"
                    disabled={demoMode || previewPending || !previewInput.trim()}
                    onClick={sendPreview}
                    aria-label="Verstuur preview"
                  >
                    <SendHorizontal className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {embedSnippet ? (
              <details className="rounded-[1.5rem] border border-border/60 bg-card dark:border-white/[0.1]">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden sm:px-6">
                  <Code className="size-4 text-primary" aria-hidden />
                  <span className="font-semibold text-foreground">Code voor je website</span>
                </summary>
                <div className="space-y-3 border-t border-border/50 px-5 py-4 dark:border-white/[0.08] sm:px-6">
                  <p className="text-sm text-muted-foreground">
                    Plak deze regel vlak voor <code className="rounded bg-muted px-1">&lt;/body&gt;</code> op je site,
                    of stuur hem naar je webbouwer.
                  </p>
                  <pre className="max-h-36 overflow-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-xs leading-relaxed dark:border-white/[0.1]">
                    {embedSnippet}
                  </pre>
                  <CopyButton text={embedSnippet} label="Code kopiëren" />
                  <Button asChild variant="outline" size="sm" className="rounded-lg">
                    <Link href="/dashboard/settings?tab=widget">Meer over de website-widget</Link>
                  </Button>
                </div>
              </details>
            ) : null}
          </aside>
        </div>

        <section
          className="rounded-[1.5rem] border border-border/60 bg-card px-5 py-6 shadow-sm dark:border-white/[0.1] sm:px-8 sm:py-8"
          aria-label="Kanalen"
        >
          <h3 className="text-lg font-bold tracking-tight text-foreground">Overal dezelfde bot</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Hier kies je waar berichten binnenkomen. Het is dezelfde chatbot: eerst kennis opslaan hierboven, daarna
            koppel je WhatsApp, mail of socials.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
            <Button asChild size="lg" className="h-11 rounded-xl px-5 font-semibold">
              <Link href="/dashboard/settings?tab=whatsapp">
                <MessageCircle className="mr-2 size-4" aria-hidden />
                WhatsApp
              </Link>
            </Button>
            <Button asChild size="lg" className="h-11 rounded-xl px-5 font-semibold">
              <Link href="/dashboard/settings?tab=email">
                <Mail className="mr-2 size-4" aria-hidden />
                E-mail
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="h-11 rounded-xl px-5 font-semibold">
              <Link href="/dashboard/socials">
                <Share2 className="mr-2 size-4" aria-hidden />
                Socials
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="h-11 rounded-xl px-5 font-semibold">
              <Link href="/dashboard/settings?tab=widget">
                <Code className="mr-2 size-4" aria-hidden />
                Website-widget
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-5 font-semibold">
              <Link href="/dashboard/inbox">
                <Inbox className="mr-2 size-4" aria-hidden />
                Berichten
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-11 rounded-xl px-4 font-medium text-muted-foreground">
              <Link href="/dashboard/ai-koppelingen">Alle koppelingen</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      {removeFormSlots}
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

          {buildScannedPagesBlock(removeFormIdFor)}

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
    </>
  );
}
