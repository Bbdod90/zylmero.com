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
import { Loader2, Trash2 } from "lucide-react";
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
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="if_type">Als (voorwaarde)</Label>
          <select
            id="if_type"
            name="if_type"
            required
            disabled={!canUse || disabled}
            className={cn(
              "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <option value="lead_is_hot">Lead is heet</option>
            <option value="no_reply_hours">Geen reactie (uren)</option>
            <option value="status_is_new">Status is nieuw</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hours">Uren wachten (bij geen reactie)</Label>
          <Input
            id="hours"
            name="hours"
            type="number"
            min={1}
            max={168}
            defaultValue={24}
            disabled={!canUse || disabled}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="then_type">Dan (actie)</Label>
          <select
            id="then_type"
            name="then_type"
            required
            disabled={!canUse || disabled}
            className={cn(
              "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="followup_message">Follow-upbericht</Label>
          <Textarea
            id="followup_message"
            name="followup_message"
            rows={3}
            disabled={!canUse || disabled}
            placeholder="Gebruik {{name}} voor de voornaam / naam."
            className="rounded-xl"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={!canUse || disabled || pending}
        className="rounded-xl"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Regel toevoegen
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
      <p className="text-sm text-muted-foreground">
        Regels zijn nog niet beschikbaar: {schemaError}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Nieuwe regel</CardTitle>
          <p className="text-sm text-muted-foreground">
            Als-dan automatisering: bijvoorbeeld hete leads of geen reactie binnen
            X uur.
          </p>
        </CardHeader>
        <CardContent>
          <CreateForm canUse={canUseAutomations} disabled={false} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen regels — voeg er een toe of gebruik de standaardset.
          </p>
        ) : null}
        {items.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium leading-tight">{r.name}</p>
              <p className="text-2xs text-muted-foreground">
                Als: {r.if_type} · Dan: {r.then_type}
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
          </div>
        ))}
      </div>
    </div>
  );
}
