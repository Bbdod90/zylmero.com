"use client";

import { useTransition } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Automation } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  toggleAutomation,
  updateAutomationAction,
  createDefaultAutomations,
  type AutoState,
} from "@/actions/automations";
import Link from "next/link";

const triggerNl: Record<string, string> = {
  lead_created: "lead aangemaakt",
  quote_sent: "offerte verstuurd",
  no_reply: "geen antwoord",
};

function Row({
  a,
  canUseAutomations,
}: {
  a: Automation;
  canUseAutomations: boolean;
}) {
  const initial: AutoState = {};
  const [state, action] = useFormState(updateAutomationAction, initial);
  const triggerLabel = triggerNl[a.trigger_type] ?? a.trigger_type;

  return (
    <Card className="cf-dashboard-panel overflow-hidden border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{a.name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {triggerLabel} · vertraging {a.delay_minutes} min
          </p>
        </div>
        <Toggle
          enabled={a.enabled}
          id={a.id}
          canUseAutomations={canUseAutomations}
        />
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <input type="hidden" name="id" value={a.id} />
          <div className="space-y-2">
            <Label htmlFor={`name-${a.id}`}>Naam</Label>
            <Input id={`name-${a.id}`} name="name" defaultValue={a.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`delay-${a.id}`}>Vertraging (minuten)</Label>
            <Input
              id={`delay-${a.id}`}
              name="delay_minutes"
              type="number"
              defaultValue={a.delay_minutes}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`tpl-${a.id}`}>Sjabloon</Label>
            <Textarea
              id={`tpl-${a.id}`}
              name="template_text"
              defaultValue={a.template_text}
              className="min-h-[100px] rounded-xl"
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          {state.ok ? (
            <p className="text-sm text-primary">Opgeslagen.</p>
          ) : null}
          <Button
            type="submit"
            size="sm"
            className="rounded-xl"
            disabled={!canUseAutomations}
          >
            Opslaan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Toggle({
  enabled,
  id,
  canUseAutomations,
}: {
  enabled: boolean;
  id: string;
  canUseAutomations: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Switch
      checked={enabled}
      disabled={pending || (!canUseAutomations && !enabled)}
      onCheckedChange={(v) => {
        start(async () => {
          const res = await toggleAutomation(id, v);
          if (!res.ok) toast.error(res.error || "");
          else router.refresh();
        });
      }}
    />
  );
}

export function AutomationList({
  items,
  canUseAutomations,
  schemaError,
}: {
  items: Automation[];
  canUseAutomations: boolean;
  schemaError?: string | null;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      {schemaError ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-5 text-sm shadow-sm backdrop-blur-sm dark:bg-amber-500/[0.06]">
          <p className="font-semibold text-foreground">
            Automatiseringen zijn nog niet beschikbaar in de database
          </p>
          <p className="mt-2 text-muted-foreground">
            Voer de Supabase-migratie uit die de tabel{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">automations</code>{" "}
            aanmaakt (bestand{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              20260410120000_automations.sql
            </code>
            ), daarna opnieuw laden.
          </p>
        </div>
      ) : null}
      {!canUseAutomations ? (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm">
          <p className="font-medium">Automatiseringen zitten in Growth en Pro</p>
          <p className="mt-1 text-muted-foreground">
            Upgrade om opvolgingsritmes en sjablonen te gebruiken.
          </p>
          <Button asChild className="mt-3 rounded-xl" size="sm">
            <Link href="/dashboard/upgrade">Bekijk abonnementen</Link>
          </Button>
        </div>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        className="rounded-lg"
        disabled={pending || !canUseAutomations}
        onClick={() => {
          start(async () => {
            const res = await createDefaultAutomations();
            if (!res.ok) toast.error(res.error || "");
            else toast.success("Standaardautomatiseringen aangemaakt");
          });
        }}
      >
        Standaardautomatiseringen aanmaken
      </Button>
      {items.map((a) => (
        <Row key={a.id} a={a} canUseAutomations={canUseAutomations} />
      ))}
    </div>
  );
}
