"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateWhatsAppSettingsAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WhatsAppChannelSettings } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-xl">
      {pending ? "Opslaan…" : label}
    </Button>
  );
}

const initial: SettingsFormState = {};

export function WhatsAppSettingsForm({
  channel,
  auto_reply_enabled,
  auto_reply_delay_seconds,
}: {
  channel: WhatsAppChannelSettings;
  auto_reply_enabled: boolean;
  auto_reply_delay_seconds: number;
}) {
  const [state, action] = useFormState(updateWhatsAppSettingsAction, initial);

  return (
    <form action={action} className="cf-dashboard-panel space-y-6 p-6 sm:p-8">
      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <select
          id="provider"
          name="provider"
          defaultValue={channel.provider}
          className="flex h-10 w-full max-w-md rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="mock">Gesimuleerd (dev / test)</option>
          <option value="twilio">Twilio (WhatsApp Business API)</option>
          <option value="meta">Meta Cloud API</option>
        </select>
        <p className="text-xs text-muted-foreground">
          Echte API-keys later via omgevingsvariabelen; inbound webhooks gebruiken
          het gedeelde geheim hieronder.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Verbonden</p>
          <p className="text-xs text-muted-foreground">
            Markeer als verbonden als je nummer webhooks kan ontvangen.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="connected"
            defaultChecked={channel.connected}
            className="size-4 rounded border-input"
          />
          Actief
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone_number">Getoonde telefoon</Label>
          <Input
            id="phone_number"
            name="phone_number"
            placeholder="+31 6 12345678"
            defaultValue={channel.phone_number ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="external_id">Extern ID (Twilio From / Meta phone_number_id)</Label>
          <Input
            id="external_id"
            name="external_id"
            placeholder="Optioneel — invullen bij productie"
            defaultValue={channel.external_id ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">AI auto-antwoord</p>
          <p className="text-xs text-muted-foreground">
            Als dit aan staat, krijgen inkomende WhatsApp-berichten een AI-conceptantwoord
            (max. ca. 25 s vertraging op serverless).
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="auto_reply_enabled"
            defaultChecked={auto_reply_enabled}
            className="size-4 rounded border-input"
          />
          Aan
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="auto_reply_delay_seconds">Vertraging (seconden)</Label>
        <Input
          id="auto_reply_delay_seconds"
          name="auto_reply_delay_seconds"
          type="number"
          min={0}
          max={300}
          defaultValue={auto_reply_delay_seconds}
          className="max-w-xs"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.ok ? <p className="text-sm text-primary">Opgeslagen.</p> : null}
      <Submit label="WhatsApp-instellingen opslaan" />
    </form>
  );
}
