"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateAiKnowledgeAction } from "@/actions/settings";
import type { SettingsFormState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initial: SettingsFormState = {};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="rounded-xl">
      {pending ? "Opslaan…" : "Opslaan"}
    </Button>
  );
}

export function AiKnowledgeForm({
  demoMode,
  initialWebsite,
  initialDocument,
}: {
  demoMode: boolean;
  initialWebsite: string;
  initialDocument: string;
}) {
  const [state, action] = useFormState(updateAiKnowledgeAction, initial);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="cf-dashboard-panel max-w-3xl space-y-8 p-6 sm:p-8">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Train je AI op jouw site</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Voeg je publieke website toe en vul hieronder praktische info: openingstijden, tarieven,
          product- of materiaalkeuzes, levertijden en verzendkosten — wat bij jouw branche past. Dat
          voedt antwoorden en vervolgvragen richting klanten, naast playbooks en inbox.
        </p>
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="ai_knowledge_website">Website-URL</Label>
        <Input
          id="ai_knowledge_website"
          name="ai_knowledge_website"
          type="url"
          placeholder="https://jouwbedrijf.nl"
          defaultValue={initialWebsite}
          disabled={demoMode}
          className="rounded-xl"
          autoComplete="off"
        />
        <p className="text-2xs text-muted-foreground">
          Publieke URL van je shop of bedrijfsite — als vaste referentie bij antwoorden (geen
          volledige live crawl; vul aan met tekst hieronder waar nodig).
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Label htmlFor="ai_knowledge_document">Tekst / document</Label>
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
                className="rounded-lg text-2xs"
                onClick={() => fileRef.current?.click()}
              >
                .txt / .md uploaden
              </Button>
            </div>
          ) : null}
        </div>
        <Textarea
          id="ai_knowledge_document"
          name="ai_knowledge_document"
          rows={12}
          placeholder="Plak hier prijslijsten, openingstijden, USP’s, garantievoorwaarden…"
          defaultValue={initialDocument}
          disabled={demoMode}
          className={cn("min-h-[200px] rounded-xl font-mono text-sm")}
        />
        <p className="text-2xs text-muted-foreground">
          Maximaal 48.000 tekens. Geen gevoelige klantdata plakken.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton disabled={demoMode} />
        {demoMode ? (
          <span className="text-sm text-muted-foreground">
            Demo: alleen lezen.
          </span>
        ) : null}
      </div>
    </form>
  );
}
