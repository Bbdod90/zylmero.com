"use client";

import { useRef, useState } from "react";
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
import { FileText, Globe, Link2, ShieldCheck, Sparkles, Trash2, Upload } from "lucide-react";

const initial: SettingsFormState = {};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
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
}: {
  demoMode: boolean;
  initialWebsite: string;
  initialDocument: string;
  scannedPages: AiKnowledgePage[];
  lastScannedAt: string | null;
}) {
  const [state, action] = useFormState(updateAiKnowledgeAction, initial);
  const fileRef = useRef<HTMLInputElement>(null);
  const [docLength, setDocLength] = useState(initialDocument.length);

  return (
    <form action={action} className="mx-auto max-w-5xl space-y-6">
      <div className="cf-dashboard-panel overflow-hidden border-border/60">
        <div className="relative border-b border-border/40 bg-gradient-to-br from-primary/[0.1] via-transparent to-accent/[0.05] px-6 py-7 sm:px-8 sm:py-8 dark:border-white/[0.06] dark:from-primary/[0.16]">
          <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20 dark:bg-primary/20 dark:ring-primary/30">
              <Sparkles className="size-7" strokeWidth={1.5} aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                AI-training
              </p>
              <h2 className="text-balance text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Train je AI op jouw site
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Vul je website in: bij opslaan scannen we automatisch alle pagina&apos;s op je eigen domein.
                Je ziet hieronder precies welke URL&apos;s zijn opgeslagen en kunt ze per stuk verwijderen.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:w-[15.5rem]">
              <div className="rounded-xl border border-border/50 bg-background/70 px-3 py-2.5 text-center dark:border-white/[0.08] dark:bg-white/[0.03]">
                <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">URL</p>
                <p className="mt-1 text-xs font-semibold text-foreground">Broncontext</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/70 px-3 py-2.5 text-center dark:border-white/[0.08] dark:bg-white/[0.03]">
                <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tekst</p>
                <p className="mt-1 text-xs font-semibold text-foreground">Kennisbank</p>
              </div>
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
                  Website-URL
                </Label>
                <p className="text-2xs text-muted-foreground">Publieke bedrijfs- of shoplink</p>
              </div>
            </div>
            <Input
              id="ai_knowledge_website"
              name="ai_knowledge_website"
              type="text"
              inputMode="url"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="https://jouwbedrijf.nl of jouwbedrijf.nl"
              defaultValue={initialWebsite}
              disabled={demoMode}
              className="h-11 rounded-xl border-border/60 bg-background/80 text-base shadow-sm dark:border-white/[0.1] dark:bg-[hsl(228_24%_8%)]"
              autoComplete="url"
              onBlur={(e) => {
                const el = e.currentTarget;
                const next = normalizeKnowledgeWebsiteUrl(el.value);
                if (next && next !== el.value) el.value = next;
              }}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Je mag een domein zonder <code className="rounded bg-muted px-1 font-mono text-[0.65rem]">https://</code>{" "}
              — dat wordt automatisch aangevuld bij opslaan. We nemen alleen pagina&apos;s mee van ditzelfde domein.
            </p>
          </section>

          <section className="space-y-4 rounded-2xl border border-border/50 bg-gradient-to-br from-muted/25 to-transparent p-5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-background/80 text-primary shadow-sm ring-1 ring-border/50 dark:bg-white/[0.04] dark:ring-white/[0.08]">
                  <Link2 className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Opgeslagen website URLs</p>
                  <p className="text-2xs text-muted-foreground">
                    {lastScannedAt
                      ? `Laatste scan: ${new Date(lastScannedAt).toLocaleString("nl-NL")}`
                      : "Nog geen scan uitgevoerd"}
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-2xs font-medium text-muted-foreground dark:border-white/[0.1] dark:bg-white/[0.03]">
                {scannedPages.length} URL{scannedPages.length === 1 ? "" : "s"}
              </span>
            </div>
            {scannedPages.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/60 bg-background/65 px-4 py-3 text-xs text-muted-foreground dark:border-white/[0.1] dark:bg-white/[0.02]">
                Nog geen URL&apos;s opgeslagen. Vul je website in en klik op opslaan.
              </p>
            ) : (
              <ul className="space-y-2">
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
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-border/50 bg-gradient-to-br from-muted/25 to-transparent p-5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-background/80 text-primary shadow-sm ring-1 ring-border/50 dark:bg-white/[0.04] dark:ring-white/[0.08]">
                  <FileText className="size-4" aria-hidden />
                </span>
                <div>
                  <Label htmlFor="ai_knowledge_document" className="text-sm font-semibold text-foreground">
                    Kennisbank (tekst)
                  </Label>
                  <p className="text-2xs text-muted-foreground">Prijslijsten, voorwaarden, FAQ</p>
                </div>
              </div>
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
                        const ta = document.getElementById(
                          "ai_knowledge_document",
                        ) as HTMLTextAreaElement | null;
                        if (ta && typeof reader.result === "string") {
                          ta.value = reader.result.slice(0, 48_000);
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
            <Textarea
              id="ai_knowledge_document"
              name="ai_knowledge_document"
              rows={14}
              placeholder="Plak hier prijslijsten, openingstijden, USP’s, garantievoorwaarden, veelgestelde vragen…"
              defaultValue={initialDocument}
              disabled={demoMode}
              onChange={(e) => setDocLength(e.target.value.length)}
              className={cn(
                "min-h-[220px] max-h-[min(70vh,28rem)] resize-y rounded-xl border-border/60 bg-background/80 p-4 text-sm leading-relaxed shadow-inner-soft",
                "placeholder:text-muted-foreground/70 dark:border-white/[0.1] dark:bg-[hsl(228_24%_8%)]",
              )}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-2xs text-muted-foreground dark:border-white/[0.06]">
              <span>Max. 48.000 tekens · geen gevoelige klantdata</span>
              <span className={cn("font-medium", docLength > 43000 && "text-amber-600 dark:text-amber-300")}>
                {docLength.toLocaleString("nl-NL")} / 48.000
              </span>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/55 bg-background/70 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>Opslaan maakt deze kennis direct actief voor AI-antwoordsuggesties.</span>
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
