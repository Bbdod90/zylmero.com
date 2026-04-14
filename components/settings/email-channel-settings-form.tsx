"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateEmailInboundSettingsAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initial: SettingsFormState = {};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-xl">
      {pending ? "Opslaan…" : label}
    </Button>
  );
}

export function EmailChannelSettingsForm({
  companyId,
  emailInboundEnabled,
  hasContactEmail,
  siteOrigin,
}: {
  companyId: string;
  emailInboundEnabled: boolean;
  hasContactEmail: boolean;
  siteOrigin: string;
}) {
  const [state, action] = useFormState(updateEmailInboundSettingsAction, initial);
  const base = siteOrigin.replace(/\/$/, "");
  const url = `${base}/api/webhooks/inbound-email`;

  return (
    <form action={action} className="cf-dashboard-panel space-y-6 p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">E-mail → Zylmero (inbound)</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Zet inkomende klantmails in <strong className="font-medium text-foreground">Berichten</strong>.
          Je koppelt je eigen provider (Mailgun inbound, Cloudflare Email Routing, Zapier, n8n, …) die
          JSON naar onderstaande URL post. Zelfde <strong className="font-medium text-foreground">AI
          auto-antwoord</strong> als bij WhatsApp kun je onder WhatsApp inschakelen.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/15 p-4 text-sm">
        <p className="font-medium text-foreground">1 · Bedrijfsmail</p>
        <p className="mt-1 text-muted-foreground">
          Vul je publieke <strong className="text-foreground">contactmail</strong> in bij{" "}
          <strong className="text-foreground">Bedrijf</strong> — die tonen we in antwoorden waar nodig.
        </p>
        <p className={cn("mt-2 text-xs", hasContactEmail ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800 dark:text-amber-300")}>
          {hasContactEmail ? "Contactmail staat ingevuld." : "Contactmail ontbreekt nog — vul die eerst in bij Bedrijf."}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Inbound via webhook aanzetten</p>
          <p className="text-xs text-muted-foreground">
            Alleen als dit aan staat, accepteren we POST&apos;s op het e-mail-endpoint voor jouw{" "}
            <code className="rounded bg-muted px-1">company_id</code>.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="email_inbound_enabled"
            defaultChecked={emailInboundEnabled}
            className="size-4 rounded border-input"
          />
          Aan
        </label>
      </div>

      <div className="space-y-2">
        <Label>Jouw company_id (voor JSON-body)</Label>
        <code className="block break-all rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs">
          {companyId}
        </code>
      </div>

      <div className="space-y-2">
        <Label>Endpoint</Label>
        <code className="block break-all rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs">
          POST {url}
        </code>
        <p className="text-xs text-muted-foreground">
          Header: <code className="rounded bg-muted px-1">x-inbound-email-secret</code>,{" "}
          <code className="rounded bg-muted px-1">x-webhook-secret</code> of{" "}
          <code className="rounded bg-muted px-1">Authorization: Bearer …</code> met{" "}
          <code className="rounded bg-muted px-1">INBOUND_EMAIL_WEBHOOK_SECRET</code> (of tijdelijk{" "}
          <code className="rounded bg-muted px-1">WHATSAPP_WEBHOOK_SECRET</code>).
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground dark:border-white/[0.1]">
        <p className="font-semibold text-foreground">Voorbeeld JSON</p>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[0.65rem] leading-relaxed">
{`{
  "company_id": "${companyId}",
  "from": "klant@voorbeeld.nl",
  "from_name": "Jan de Vries",
  "subject": "Vraag over afspraak",
  "body": "Hallo, kunnen jullie volgende week…"
}`}
        </pre>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-primary">Opgeslagen.</p> : null}
      <Submit label="E-mail inbound opslaan" />
    </form>
  );
}
