"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateWhatsAppSettingsAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBooleanSwitch } from "@/components/settings/form-boolean-switch";
import type { WhatsAppChannelSettings } from "@/lib/types";
import { MessageCircle } from "lucide-react";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-lg px-6 font-semibold shadow-sm">
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
    <form action={action} className="cf-dashboard-panel space-y-8 p-6 sm:p-8 lg:p-9">
      <header className="flex gap-4 border-b border-border/50 pb-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <MessageCircle className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">WhatsApp</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Kies je leverancier en zet je zakelijke nummer klaar. Automatische antwoorden staan hier ook aan of uit.
          </p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="provider" className="text-sm font-medium">
            Provider
          </Label>
          <p className="text-xs text-muted-foreground">Kies de partij die je WhatsApp Business voor je regelt.</p>
          <select
            id="provider"
            name="provider"
            defaultValue={channel.provider}
            className="flex h-11 w-full max-w-md rounded-lg border border-border/60 bg-background/80 px-3 text-sm font-medium shadow-inner-soft ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 dark:border-white/[0.1]"
          >
            <option value="mock">Gesimuleerd (dev / test)</option>
            <option value="twilio">Twilio (WhatsApp Business API)</option>
            <option value="meta">Meta Cloud API</option>
          </select>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-muted/[0.12] p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">Verbonden</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Zet aan zodra je provider bevestigt dat berichten binnen mogen komen.
            </p>
          </div>
          <FormBooleanSwitch
            name="connected"
            defaultChecked={channel.connected}
            label="Actief"
            labelClassName="text-muted-foreground"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-sm font-medium">
              Getoonde telefoon
            </Label>
            <Input
              id="phone_number"
              name="phone_number"
              placeholder="+31 6 12345678"
              defaultValue={channel.phone_number ?? ""}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="external_id" className="text-sm font-medium">
              Extern ID
            </Label>
            <p className="text-xs text-muted-foreground">Twilio From of Meta phone_number_id.</p>
            <Input
              id="external_id"
              name="external_id"
              placeholder="Optioneel — productie"
              defaultValue={channel.external_id ?? ""}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-muted/[0.12] p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">AI auto-antwoord</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Inkomende berichten krijgen een concept (serverless kan ~25 s duren).
            </p>
          </div>
          <FormBooleanSwitch
            name="auto_reply_enabled"
            defaultChecked={auto_reply_enabled}
            label="Aan"
            labelClassName="text-muted-foreground"
          />
        </div>

        <div className="max-w-[12rem] space-y-2">
          <Label htmlFor="auto_reply_delay_seconds" className="text-sm font-medium">
            Vertraging (seconden)
          </Label>
          <Input
            id="auto_reply_delay_seconds"
            name="auto_reply_delay_seconds"
            type="number"
            min={0}
            max={300}
            defaultValue={auto_reply_delay_seconds}
            className="rounded-lg"
          />
        </div>
      </div>

      {state.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Opgeslagen.</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-6">
        <Submit label="WhatsApp-instellingen opslaan" />
      </div>
    </form>
  );
}
