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
import type { CompanySocialConnection } from "@/lib/queries/social-connections";
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
    <Button
      type="submit"
      disabled={pending}
      className="h-12 min-h-[3rem] rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_14px_34px_-18px_hsl(var(--primary)/0.72)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_38px_-18px_hsl(var(--primary)/0.8)]"
    >
      {pending ? "Opslaan…" : label}
    </Button>
  );
}

export function EmailChannelSettingsForm({
  companyId,
  emailInboundEnabled,
  hasContactEmail,
  siteOrigin,
  socialConnections,
}: {
  companyId: string;
  emailInboundEnabled: boolean;
  hasContactEmail: boolean;
  siteOrigin: string;
  socialConnections: CompanySocialConnection[];
}) {
  const [state, action] = useFormState(updateEmailInboundSettingsAction, initial);
  const [mailProvider, setMailProvider] = useState<MailProvider>("google");
  const googleEmailConnection = socialConnections.find((c) => c.provider === "google_email");
  const microsoftEmailConnection = socialConnections.find((c) => c.provider === "microsoft_email");
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
        "cf-dashboard-panel mx-auto w-full max-w-4xl overflow-hidden rounded-[1.35rem] border border-border/60 bg-card p-0 shadow-[0_26px_74px_-44px_hsl(222_47%_11%/0.24)]",
        "space-y-0",
      )}
    >
      <div className="relative border-b border-border/50 bg-gradient-to-br from-sky-500/[0.09] via-card to-muted/20 px-5 py-6 sm:px-8 sm:py-7 dark:border-white/[0.08] dark:from-sky-500/[0.14]">
        <div className="pointer-events-none absolute -left-10 -top-16 size-48 rounded-full bg-sky-400/12 blur-3xl" />
        <header className="relative flex gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Mail className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/90">Kanaal</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">E-mail koppelen</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
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

      <div className="space-y-5 px-5 py-7 sm:px-8 sm:py-8">
        <div className="rounded-2xl border border-border/55 bg-muted/[0.18] p-5 dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
          <p className="mb-3 text-[0.95rem] font-semibold text-foreground">Stap 1 · Kies je e-mailtype</p>
          <input type="hidden" name="email_provider" value={mailProvider} />
          <div className="grid gap-3.5 sm:grid-cols-3">
            {MAIL_PROVIDERS.map((provider) => {
              const Icon = provider.icon;
              const selected = mailProvider === provider.value;
              return (
                <label
                  key={provider.value}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 transition-all",
                    selected
                      ? "border-primary/45 bg-primary/[0.1] shadow-[0_12px_24px_-18px_hsl(var(--primary)/0.6)]"
                      : "border-border/60 bg-background/85 hover:border-border/80",
                  )}
                >
                  <input
                    type="radio"
                    name="email_provider_ui"
                    className="sr-only"
                    checked={selected}
                    onChange={() => setMailProvider(provider.value)}
                  />
                  <div className="mb-2.5 flex size-9 items-center justify-center rounded-lg bg-background/85 text-primary ring-1 ring-border/60">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <p className="text-sm font-medium text-foreground">{provider.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground/90">{provider.hint}</p>
                </label>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {mailProvider === "google" ? (
              <Button asChild size="sm" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                <a href="/api/oauth/google-email">Nu verbinden met Google</a>
              </Button>
            ) : null}
            {mailProvider === "microsoft" ? (
              <Button asChild size="sm" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                <a href="/api/oauth/microsoft-email">Nu verbinden met Microsoft</a>
              </Button>
            ) : null}
            {mailProvider === "other" ? (
              <p className="text-xs text-muted-foreground">
                Voor andere providers: zet e-mail doorsturen aan naar je webhook.
              </p>
            ) : null}
            {mailProvider === "google" ? (
              <p
                className={cn(
                  "text-xs font-medium",
                  googleEmailConnection?.status === "connected"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400",
                )}
              >
                {googleEmailConnection?.status === "connected"
                  ? `Google gekoppeld (${googleEmailConnection.display_name || "account"})`
                  : "Google nog niet gekoppeld"}
              </p>
            ) : null}
            {mailProvider === "microsoft" ? (
              <p
                className={cn(
                  "text-xs font-medium",
                  microsoftEmailConnection?.status === "connected"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400",
                )}
              >
                {microsoftEmailConnection?.status === "connected"
                  ? `Microsoft gekoppeld (${microsoftEmailConnection.display_name || "account"})`
                  : "Microsoft nog niet gekoppeld"}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] to-muted/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-[0.95rem] font-semibold text-foreground">Stap 2 · Inkomende e-mail verwerken</p>
            <p className="text-xs leading-relaxed text-muted-foreground">Aan = doorgestuurde mail komt direct in Berichten.</p>
            <p className={cn("text-xs font-medium", hasContactEmail ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400")}>
              {hasContactEmail ? "Contactmail staat goed." : "Tip: vul ook contactmail in bij Bedrijf."}
            </p>
          </div>
          <FormBooleanSwitch name="email_inbound_enabled" defaultChecked={emailInboundEnabled} label="Aan" labelClassName="text-muted-foreground" />
        </div>

        <div className="rounded-2xl border border-border/60 bg-muted/[0.18] p-5 dark:border-white/[0.08]">
          <p className="text-[0.95rem] font-semibold text-foreground">Stap 3 · Optioneel: stuur setup-info naar je IT</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <CopyButton text={builderPack} label="Kopieer setup-instructies" />
            <Button asChild variant="secondary" className="h-10 rounded-lg">
              <Link href="/dashboard/inbox">
                <Sparkles className="mr-2 size-4" />
                Test in Berichten
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {state.error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-sm">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm dark:text-emerald-200">
            Opgeslagen.
          </p>
        ) : null}
        <Submit label="E-mail koppeling opslaan" />
      </div>
    </form>
  );
}
