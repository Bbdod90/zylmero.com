"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateAiSettingsAction, type SettingsFormState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-lg px-6 font-semibold shadow-sm">
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
      className="cf-dashboard-panel mx-auto max-w-3xl space-y-6 overflow-hidden p-6 sm:p-8"
    >
      <header className="relative space-y-1 border-b border-border/40 pb-5 dark:border-white/[0.06]">
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
        <div className="relative flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="cf-eyebrow text-[0.625rem]">AI-closer</p>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
          Hoe je AI praat met klanten
            </h2>
            <p className="text-sm text-muted-foreground">
              Deze teksten sturen toon en stijl van suggesties en automatische antwoorden.
            </p>
          </div>
        </div>
      </header>
      <div className="space-y-2">
        <Label htmlFor="tone" className="text-sm font-medium">
          Toon
        </Label>
        <Textarea
          id="tone"
          name="tone"
          defaultValue={tone || ""}
          className="min-h-[90px] resize-y rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
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
          className="min-h-[90px] resize-y rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
        />
      </div>
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
          placeholder="Beschrijf hoe assertief opvolging moet zijn…"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.ok ? <p className="text-sm text-primary">Opgeslagen.</p> : null}
      <Submit />
    </form>
  );
}
