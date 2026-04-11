"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateAiSettingsAction, type SettingsFormState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-xl">
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
      className="cf-dashboard-panel max-w-2xl space-y-6 p-6 sm:p-8"
    >
      <header className="space-y-1 border-b border-border/40 pb-5 dark:border-white/[0.06]">
        <p className="cf-eyebrow text-[0.625rem]">AI-closer</p>
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">
          Hoe je AI praat met klanten
        </h2>
        <p className="text-sm text-muted-foreground">
          Deze teksten sturen toon en stijl van suggesties en automatische antwoorden.
        </p>
      </header>
      <div className="space-y-2">
        <Label htmlFor="tone">Toon</Label>
        <Textarea
          id="tone"
          name="tone"
          defaultValue={tone || ""}
          className="min-h-[90px] resize-none rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reply_style">Antwoordstijl</Label>
        <Textarea
          id="reply_style"
          name="reply_style"
          defaultValue={reply_style || ""}
          className="min-h-[90px] rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="language">Taal</Label>
        <Input
          id="language"
          name="language"
          defaultValue={language}
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="automation_preferences">Notities automatisering</Label>
        <Textarea
          id="automation_preferences"
          name="automation_preferences"
          defaultValue={automationNote}
          className="min-h-[140px] resize-none rounded-xl"
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
