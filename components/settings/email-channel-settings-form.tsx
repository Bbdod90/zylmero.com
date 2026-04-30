"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import {
  updateEmailInboundSettingsAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormBooleanSwitch } from "@/components/settings/form-boolean-switch";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { CompanySocialConnection } from "@/lib/queries/social-connections";
import { Mail } from "lucide-react";

const initial: SettingsFormState = {};

type StoredEmailProvider = "google" | "microsoft" | "other";

/** UI-keuze; wordt omgezet naar oauth-provider + detail voor overige aanbieders. */
type MailChoiceId = "google" | "microsoft";

const MAIL_CHOICES: Array<{
  id: MailChoiceId;
  title: string;
  hint: string;
}> = [
  {
    id: "google",
    title: "Gmail / Google Workspace",
    hint: "Meest gebruikt: je kiest daarna welk Google-account.",
  },
  {
    id: "microsoft",
    title: "Outlook / Microsoft 365",
    hint: "Zakelijk Microsoft-account of Outlook.",
  },
];

function savedToChoice(provider: StoredEmailProvider, detail: string): MailChoiceId {
  if (provider === "google") return "google";
  if (provider === "microsoft") return "microsoft";
  const d = detail.trim().toLowerCase();
  if (d === "microsoft") return "microsoft";
  return "google";
}

function choiceToHiddenFields(choice: MailChoiceId): {
  email_provider: StoredEmailProvider;
  email_provider_detail: string;
} {
  switch (choice) {
    case "google":
      return { email_provider: "google", email_provider_detail: "" };
    case "microsoft":
      return { email_provider: "microsoft", email_provider_detail: "" };
    default:
      return { email_provider: "google", email_provider_detail: "" };
  }
}

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
  emailInboundEnabled,
  emailProvider,
  emailProviderDetail,
  hasContactEmail,
  socialConnections,
}: {
  emailInboundEnabled: boolean;
  emailProvider: StoredEmailProvider;
  emailProviderDetail: string;
  hasContactEmail: boolean;
  socialConnections: CompanySocialConnection[];
}) {
  const [state, action] = useFormState(updateEmailInboundSettingsAction, initial);
  const [mailChoice, setMailChoice] = useState<MailChoiceId>(() =>
    savedToChoice(emailProvider, emailProviderDetail),
  );

  useEffect(() => {
    setMailChoice(savedToChoice(emailProvider, emailProviderDetail));
  }, [emailProvider, emailProviderDetail]);

  const hidden = useMemo(() => choiceToHiddenFields(mailChoice), [mailChoice]);

  const googleEmailConnection = socialConnections.find((c) => c.provider === "google_email");
  const microsoftEmailConnection = socialConnections.find((c) => c.provider === "microsoft_email");

  const showGoogleConnect = mailChoice === "google";
  const showMicrosoftConnect = mailChoice === "microsoft";
  const selectedChoice = MAIL_CHOICES.find((choice) => choice.id === mailChoice);

  return (
    <form
      action={action}
      className={cn(
        "cf-dashboard-panel mx-auto w-full max-w-4xl overflow-hidden rounded-[1.35rem] border border-border/60 bg-card p-0 shadow-[0_26px_74px_-44px_hsl(222_47%_11%/0.24)]",
        "space-y-0",
      )}
    >
      <input type="hidden" name="email_provider" value={hidden.email_provider} />
      <input type="hidden" name="email_provider_detail" value={hidden.email_provider_detail} />

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
              Kies je provider en klik op e-mail koppelen. Je wordt direct doorgestuurd naar de inlogpagina van die provider. Contactadres staat bij{" "}
              <Link
                href="/dashboard/settings?tab=business"
                className="font-medium text-primary underline decoration-primary/35 underline-offset-2"
              >
                Bedrijf
              </Link>
              .
            </p>
          </div>
        </header>
      </div>

      <div className="space-y-5 px-5 py-7 sm:px-8 sm:py-8">
        <div className="rounded-2xl border border-border/55 bg-muted/[0.18] p-5 dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
          <p className="mb-3 text-[0.95rem] font-semibold text-foreground">Provider kiezen</p>

          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Provider</span>
                <select
                  name="oauth_provider"
                  value={mailChoice}
                  onChange={(e) => {
                    setMailChoice(e.target.value as MailChoiceId);
                  }}
                  className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm shadow-inner-soft transition focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/[0.1]"
                >
                  {MAIL_CHOICES.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      {choice.title}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                asChild
                className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                <a href={`/api/oauth/email?oauth_provider=${mailChoice}`}>
                  E-mail koppelen
                </a>
              </Button>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {selectedChoice?.hint}
            </p>

            {(showGoogleConnect || showMicrosoftConnect) ? (
              <p
                className={cn(
                  "text-xs font-medium",
                  (showGoogleConnect && googleEmailConnection?.status === "connected") ||
                    (showMicrosoftConnect && microsoftEmailConnection?.status === "connected")
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400",
                )}
              >
                {showGoogleConnect
                  ? googleEmailConnection?.status === "connected"
                    ? `Google gekoppeld (${googleEmailConnection.display_name || googleEmailConnection.external_page_id || "Google"})`
                    : "Google nog niet gekoppeld"
                  : microsoftEmailConnection?.status === "connected"
                    ? `Microsoft gekoppeld (${microsoftEmailConnection.display_name || "Microsoft"})`
                    : "Microsoft nog niet gekoppeld"}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] to-muted/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-[0.95rem] font-semibold text-foreground">Stap 2 · Inkomende e-mail verwerken</p>
            <p className="text-xs leading-relaxed text-muted-foreground">Aan = doorgestuurde mail komt direct in Berichten.</p>
            <p
              className={cn(
                "text-xs font-medium",
                hasContactEmail ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400",
              )}
            >
              {hasContactEmail ? "Contactmail staat goed." : "Tip: vul ook contactmail in bij Bedrijf."}
            </p>
          </div>
          <FormBooleanSwitch name="email_inbound_enabled" defaultChecked={emailInboundEnabled} label="Aan" labelClassName="text-muted-foreground" />
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
        <div className="flex flex-wrap items-center gap-3">
          <Submit label="E-mail koppeling opslaan" />
          <Button type="button" asChild variant="secondary" className="h-10 rounded-lg">
            <Link href="/dashboard/inbox">Test in Berichten</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
