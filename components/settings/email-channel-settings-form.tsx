"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import {
  updateEmailInboundSettingsAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/growth/copy-button";
import { FormBooleanSwitch } from "@/components/settings/form-boolean-switch";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Building2, Mail, Server, Sparkles } from "lucide-react";

const initial: SettingsFormState = {};

type MailProvider = "google" | "microsoft" | "other";

const MAIL_PROVIDERS: Array<{
  value: MailProvider;
  title: string;
  hint: string;
  icon: typeof Mail;
}> = [
  { value: "google", title: "Gmail / Google Workspace", hint: "Zakelijke of standaard Gmail inbox", icon: Mail },
  { value: "microsoft", title: "Outlook / Microsoft 365", hint: "Exchange Online of Outlook mailbox", icon: Building2 },
  { value: "other", title: "Andere mailprovider", hint: "IMAP/SMTP host of eigen server", icon: Server },
];

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-lg px-6 font-semibold shadow-sm">
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
  const [mailProvider, setMailProvider] = useState<MailProvider>("google");
  const base = siteOrigin.replace(/\/$/, "");
  const inboundPath = `${base}/api/webhooks/inbound-email`;

  const builderPack = [
    "Zylmero — koppeling inkomende e-mail",
    "",
    `Provider: ${mailProvider}`,
    `Koppel-adres (webhook): ${inboundPath}`,
    `Company id: ${companyId}`,
    "",
    "Voorbeeld payload:",
    `{ "company_id": "${companyId}", "from": "klant@voorbeeld.nl", "from_name": "Jan", "subject": "Vraag", "body": "..." }`,
  ].join("\n");

  return (
    <form
      action={action}
      className={cn(
        "cf-dashboard-panel mx-auto w-full max-w-4xl overflow-hidden rounded-[1.35rem] border-border/55 p-0 shadow-[0_24px_64px_-40px_hsl(222_47%_11%/0.18)]",
        "space-y-0",
      )}
    >
      <div className="relative border-b border-border/45 bg-gradient-to-br from-sky-500/[0.08] via-card to-muted/15 px-5 py-7 sm:px-8 sm:py-8 dark:border-white/[0.08] dark:from-sky-500/[0.12]">
        <div className="pointer-events-none absolute -left-10 -top-16 size-48 rounded-full bg-sky-400/15 blur-3xl" />
        <header className="relative flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Mail className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/90">Kanaal</p>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">E-mail koppelen</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
              Kies je mailtype, zet inkomende mail aan, en klaar. Klantmail komt daarna in{" "}
              <strong className="font-medium text-foreground">Berichten</strong>. Contactadres beheer je in tabblad{" "}
              <Link href="/dashboard/settings?tab=business" className="font-medium text-primary underline decoration-primary/35 underline-offset-2">
                Bedrijf
              </Link>
              .
            </p>
          </div>
        </header>
      </div>

      <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-9">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Wat voor e-mail wil je koppelen?</p>
          <input type="hidden" name="email_provider" value={mailProvider} />
          <div className="grid gap-3 sm:grid-cols-3">
            {MAIL_PROVIDERS.map((provider) => {
              const Icon = provider.icon;
              const selected = mailProvider === provider.value;
              return (
                <label
                  key={provider.value}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 transition-all",
                    selected ? "border-primary bg-primary/[0.08]" : "border-border/55 bg-gradient-to-b from-card to-muted/15",
                  )}
                >
                  <input
                    type="radio"
                    name="email_provider_ui"
                    className="sr-only"
                    checked={selected}
                    onChange={() => setMailProvider(provider.value)}
                  />
                  <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-background/80 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <p className="text-sm font-medium text-foreground">{provider.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{provider.hint}</p>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-primary/22 bg-gradient-to-br from-primary/[0.06] to-muted/10 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-primary/30">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">Inkomende e-mail verwerken</p>
            <p className="text-xs leading-relaxed text-muted-foreground">Aan = doorgestuurde mail komt direct in Berichten.</p>
            <p className={cn("text-xs font-medium", hasContactEmail ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400")}>
              {hasContactEmail ? "Contactmail staat goed." : "Tip: vul ook contactmail in bij Bedrijf."}
            </p>
          </div>
          <FormBooleanSwitch name="email_inbound_enabled" defaultChecked={emailInboundEnabled} label="Aan" labelClassName="text-muted-foreground" />
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-5 dark:border-white/[0.08]">
          <p className="text-sm font-semibold text-foreground">Optioneel: stuur setup-info naar je IT</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <CopyButton text={builderPack} label="Kopieer setup-instructies" />
            <Button asChild variant="secondary">
              <Link href="/dashboard/inbox">
                <Sparkles className="mr-2 size-4" />
                Test in Berichten
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {state.error ? <p className="text-sm font-medium text-destructive">{state.error}</p> : null}
        {state.ok ? <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Opgeslagen.</p> : null}
        <Submit label="E-mail koppeling opslaan" />
      </div>
    </form>
  );
}
