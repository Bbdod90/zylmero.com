"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateEmailInboundSettingsAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/growth/copy-button";
import { FormBooleanSwitch } from "@/components/settings/form-boolean-switch";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

const initial: SettingsFormState = {};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-lg px-6 font-semibold shadow-sm">
      {pending ? "Opslaan…" : label}
    </Button>
  );
}

function ReadonlyRow({
  label,
  value,
  copyText,
  copyLabel,
}: {
  label: string;
  value: string;
  copyText: string;
  copyLabel: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <CopyButton text={copyText} label={copyLabel} />
      </div>
      <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5 font-mono text-xs leading-relaxed text-foreground/95 shadow-inner-soft dark:border-white/[0.08]">
        <span className="break-all">{value}</span>
      </div>
    </div>
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
    <form action={action} className="cf-dashboard-panel space-y-8 p-6 sm:p-8 lg:p-9">
      <header className="flex gap-4 border-b border-border/50 pb-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Mail className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Inbound e-mail</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Koppel Mailgun, Cloudflare Email Routing, Zapier of n8n: die posten JSON naar Zylmero en berichten komen in{" "}
            <strong className="font-medium text-foreground">Berichten</strong>. Zelfde AI auto-antwoord als bij
            WhatsApp — daar schakel je het in.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-muted/[0.12] p-4 dark:border-white/[0.08]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stap 1</p>
          <p className="mt-2 text-sm font-medium text-foreground">Bedrijfsmail</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Publieke contactmail staat onder <strong className="text-foreground">Bedrijf</strong>.
          </p>
          <p
            className={cn(
              "mt-3 text-xs font-medium",
              hasContactEmail ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400",
            )}
          >
            {hasContactEmail ? "Contactmail is ingevuld." : "Vul eerst je contactmail in bij Bedrijf."}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/[0.12] p-4 dark:border-white/[0.08]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stap 2</p>
          <p className="mt-2 text-sm font-medium text-foreground">Webhook aanzetten</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Zonder schakelaar wijzen we POST&apos;s op je endpoint af.
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/[0.12] p-4 dark:border-white/[0.08]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stap 3</p>
          <p className="mt-2 text-sm font-medium text-foreground">Provider configureren</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Gebruik company_id, URL en headers hieronder in je automation.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-primary/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between dark:border-primary/25">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">Inbound via webhook</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Alleen als dit aan staat accepteren we POST&apos;s voor jouw{" "}
            <code className="rounded bg-background/80 px-1 py-0.5 font-mono text-[0.65rem] ring-1 ring-border/40">
              company_id
            </code>
            .
          </p>
        </div>
        <FormBooleanSwitch
          name="email_inbound_enabled"
          defaultChecked={emailInboundEnabled}
          label="Actief"
          labelClassName="text-muted-foreground"
        />
      </div>

      <div className="space-y-6">
        <ReadonlyRow
          label="Jouw company_id (JSON-body)"
          value={companyId}
          copyText={companyId}
          copyLabel="Kopieer ID"
        />
        <ReadonlyRow
          label="Endpoint"
          value={`POST ${url}`}
          copyText={url}
          copyLabel="Kopieer URL"
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Authenticatie: header{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.65rem]">x-inbound-email-secret</code>,{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.65rem]">x-webhook-secret</code> of{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.65rem]">Authorization: Bearer …</code>{" "}
          met{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.65rem]">INBOUND_EMAIL_WEBHOOK_SECRET</code>{" "}
          (fallback:{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.65rem]">WHATSAPP_WEBHOOK_SECRET</code>
          ).
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Voorbeeld JSON</p>
        <pre className="max-h-56 overflow-auto rounded-lg border border-border/60 bg-[hsl(222_47%_6%/0.04)] p-4 font-mono text-[0.7rem] leading-relaxed text-foreground/90 shadow-inner-soft dark:border-white/[0.08] dark:bg-black/25">
{`{
  "company_id": "${companyId}",
  "from": "klant@voorbeeld.nl",
  "from_name": "Jan de Vries",
  "subject": "Vraag over afspraak",
  "body": "Hallo, kunnen jullie volgende week…"
}`}
        </pre>
        <CopyButton
          text={`{\n  "company_id": "${companyId}",\n  "from": "klant@voorbeeld.nl",\n  "from_name": "Jan de Vries",\n  "subject": "Vraag over afspraak",\n  "body": "Hallo, kunnen jullie volgende week…"\n}`}
          label="Kopieer JSON"
        />
      </div>

      <Separator className="bg-border/60" />

      {state.error ? <p className="text-sm font-medium text-destructive">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Opgeslagen.</p>
      ) : null}
      <Submit label="E-mail inbound opslaan" />
    </form>
  );
}
