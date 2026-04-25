"use client";

import { useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import type { AutomationRule } from "@/lib/types";
import {
  createAutomationRule,
  deleteAutomationRule,
  toggleAutomationRule,
} from "@/actions/automation-rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function CreateForm({
  canUse,
  disabled,
}: {
  canUse: boolean;
  disabled: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await createAutomationRule({}, fd);
          if (r.error) toast.error(r.error);
          else toast.success("Regel opgeslagen");
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="rule-name">Naam</Label>
          <Input
            id="rule-name"
            name="name"
            required
            disabled={!canUse || disabled}
            placeholder="Bijv. Hete lead opvolging"
            className="rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="if_type">Wanneer gebeurt dit?</Label>
          <select
            id="if_type"
            name="if_type"
            required
            disabled={!canUse || disabled}
            className={cn(
              "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "dark:border-white/[0.1] dark:bg-white/[0.03]",
            )}
          >
            <option value="lead_is_hot">Lead is heet</option>
            <option value="no_reply_hours">Geen reactie (uren)</option>
            <option value="status_is_new">Status is nieuw</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hours">Hoeveel uur wachten? (alleen bij “geen reactie”)</Label>
          <Input
            id="hours"
            name="hours"
            type="number"
            min={1}
            max={168}
            defaultValue={24}
            disabled={!canUse || disabled}
            className="rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="then_type">Wat moet er dan gebeuren?</Label>
          <select
            id="then_type"
            name="then_type"
            required
            disabled={!canUse || disabled}
            className={cn(
              "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "dark:border-white/[0.1] dark:bg-white/[0.03]",
            )}
          >
            <option value="notify_in_app">Melding in app</option>
            <option value="send_followup_message">Stuur follow-upbericht</option>
            <option value="send_ai_reply">Stuur AI-antwoord</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notify_body">Meldingstekst (optioneel)</Label>
          <Textarea
            id="notify_body"
            name="notify_body"
            rows={2}
            disabled={!canUse || disabled}
            placeholder="Alleen bij actie ‘Melding in app’"
            className="rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="followup_message">Bericht aan klant</Label>
          <Textarea
            id="followup_message"
            name="followup_message"
            rows={3}
            disabled={!canUse || disabled}
            placeholder="Gebruik {{name}} voor de voornaam / naam."
            className="rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={!canUse || disabled || pending}
        className="rounded-xl shadow-sm"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Regel opslaan
      </Button>
    </form>
  );
}

export function AutomationRulesPanel({
  items,
  canUseAutomations,
  schemaError,
}: {
  items: AutomationRule[];
  canUseAutomations: boolean;
  schemaError: string | null;
}) {
  const [pending, start] = useTransition();

  if (schemaError) {
    return (
      <div className="cf-dashboard-panel border-amber-500/30 bg-amber-500/[0.06] p-6 sm:p-7 dark:bg-amber-500/[0.05]">
        <p className="font-semibold text-foreground">Slimme regels zijn nog niet beschikbaar</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          De server mist nog de tabel{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">automation_rules</code> of de schema-cache
          is nog niet ververst.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Oplossing:</span> draai de migratie{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            20260415120000_enterprise_team_pipeline.sql
          </code>{" "}
          op je Supabase-project. Daarna in de SQL Editor:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            {`NOTIFY pgrst, 'reload schema';`}
          </code>
        </p>
        <p className="mt-3 text-2xs text-muted-foreground/90">Technisch: {schemaError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="cf-dashboard-panel overflow-hidden border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Nieuwe slimme regel</CardTitle>
          <p className="text-sm text-muted-foreground">
            Laat de app automatisch reageren op situaties zoals “geen reactie” of “hete lead”.
          </p>
        </CardHeader>
        <CardContent>
          <CreateForm canUse={canUseAutomations} disabled={false} />
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border/55 bg-background/70 p-3 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Regel-tip
        </p>
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" aria-hidden />
          Start met 1 regel tegelijk, test in inbox en breid daarna uit.
        </p>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen regels — voeg hieronder je eerste regel toe.
          </p>
        ) : null}
        {items.map((r) => (
          <div
            key={r.id}
            className="cf-dashboard-panel flex flex-col gap-3 border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium leading-tight">{r.name}</p>
              <p className="text-2xs text-muted-foreground">
                Trigger: {r.if_type} · Actie: {r.then_type}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={r.enabled}
                  disabled={pending || (!canUseAutomations && !r.enabled)}
                  onCheckedChange={(v) => {
                    start(async () => {
                      const res = await toggleAutomationRule(r.id, v);
                      if (res.error) toast.error(res.error);
                      else toast.success(v ? "Regel aan" : "Regel uit");
                    });
                  }}
                />
                <span className="text-2xs text-muted-foreground">Actief</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl text-destructive hover:text-destructive"
                disabled={pending}
                onClick={() => {
                  start(async () => {
                    const res = await deleteAutomationRule(r.id);
                    if (res.error) toast.error(res.error);
                    else toast.success("Regel verwijderd");
                  });
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            {r.enabled ? (
              <p className="inline-flex items-center gap-1.5 text-2xs text-primary">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Regel staat aan
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
