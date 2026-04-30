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
import { Building2, Cloud, Globe2, Mail, MailPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const initial: SettingsFormState = {};

type StoredEmailProvider = "google" | "microsoft" | "other";

/** UI-keuze; wordt omgezet naar oauth-provider + detail voor overige aanbieders. */
type MailChoiceId = "google" | "microsoft" | "zoho" | "hosting" | "forward";

const MAIL_CHOICES: Array<{
  id: MailChoiceId;
  title: string;
  hint: string;
  icon: LucideIcon;
}> = [
  {
    id: "google",
    title: "Gmail / Google Workspace",
    hint: "Meest gebruikt: je kiest daarna welk Google-account.",
    icon: Mail,
  },
  {
    id: "microsoft",
    title: "Outlook / Microsoft 365",
    hint: "Zakelijk Microsoft-account of Outlook.",
    icon: Building2,
  },
  {
    id: "zoho",
    title: "Zoho Mail",
    hint: "Populair bij zzp en kleine teams.",
    icon: Cloud,
  },
  {
    id: "hosting",
    title: "Hosting / eigen domein",
    hint: "o.a. TransIP, Vimexx, Strato, one.com — mail forward.",
    icon: Globe2,
  },
  {
    id: "forward",
    title: "Anders · doorsturen",
    hint: "Elke provider met doorstuurregel naar Zylmero.",
    icon: MailPlus,
  },
];

function savedToChoice(provider: StoredEmailProvider, detail: string): MailChoiceId {
  if (provider === "google") return "google";
  if (provider === "microsoft") return "microsoft";
  const d = detail.trim().toLowerCase();
  if (d === "zoho") return "zoho";
  if (d === "hosting") return "hosting";
  if (d === "forward") return "forward";
  return "forward";
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
    case "zoho":
      return { email_provider: "other", email_provider_detail: "zoho" };
    case "hosting":
      return { email_provider: "other", email_provider_detail: "hosting" };
    case "forward":
      return { email_provider: "other", email_provider_detail: "forward" };
    default:
      return { email_provider: "other", email_provider_detail: "forward" };
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

function otherChoiceHint(choice: MailChoiceId): string | null {
  switch (choice) {
    case "zoho":
      return "Zoho: vul je mailbox-adres in en klik op opslaan. Daarna verwerkt Zylmero mail op dat adres in je inboxflow.";
    case "hosting":
      return "Hostingprovider: vul je adres in (bijv. info@jouwdomein.nl) en sla op. Werkt voor de meeste NL-hosters.";
    case "forward":
      return "Elke andere provider: vul je gewenste mailbox-adres in en sla op.";
    default:
      return null;
  }
}

export function EmailChannelSettingsForm({
  emailInboundEnabled,
  emailProvider,
  emailProviderDetail,
  linkedEmailAddress,
  hasContactEmail,
  socialConnections,
  flashError,
}: {
  emailInboundEnabled: boolean;
  emailProvider: StoredEmailProvider;
  emailProviderDetail: string;
  linkedEmailAddress: string;
  hasContactEmail: boolean;
  socialConnections: CompanySocialConnection[];
  flashError: string | null;
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
  const showOtherHint = otherChoiceHint(mailChoice);

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
              Kies je soort mail. Bij Google en Microsoft log je in en kies je het account op het scherm van de
              provider. Voor andere providers koppel je direct het e-mailadres hieronder. Contactadres staat bij{" "}
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
          <p className="mb-3 text-[0.95rem] font-semibold text-foreground">Stap 1 · Kies je e-mailtype</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {MAIL_CHOICES.map((provider) => {
              const Icon = provider.icon;
              const selected = mailChoice === provider.id;
              return (
                <label
                  key={provider.id}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3.5 transition-all sm:p-4",
                    selected
                      ? "border-primary/45 bg-primary/[0.1] shadow-[0_12px_24px_-18px_hsl(var(--primary)/0.6)]"
                      : "border-border/60 bg-background/85 hover:border-border/80",
                  )}
                >
                  <input
                    type="radio"
                    name="email_choice_ui"
                    className="sr-only"
                    checked={selected}
                    onChange={() => setMailChoice(provider.id)}
                  />
                  <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-background/85 text-primary ring-1 ring-border/60 sm:size-9">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <p className="text-sm font-medium leading-snug text-foreground">{provider.title}</p>
                  <p className="mt-1 text-[0.7rem] leading-relaxed text-muted-foreground/90 sm:text-xs">{provider.hint}</p>
                </label>
              );
            })}
          </div>

          <div className="mt-4 space-y-3">
            {showGoogleConnect ? (
              <>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    type="button"
                    size="sm"
                    className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
                    onClick={() => {
                      window.location.href = "/api/oauth/google-email";
                    }}
                  >
                    Verbind met Google
                  </Button>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      googleEmailConnection?.status === "connected"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-700 dark:text-amber-400",
                    )}
                  >
                    {googleEmailConnection?.status === "connected"
                      ? `Gekoppeld (${googleEmailConnection.display_name || googleEmailConnection.external_page_id || "Google"})`
                      : "Nog niet gekoppeld"}
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Je wordt doorgestuurd naar Google: daar kies je welk account je wilt koppelen. Daarna kun je hieronder
                  opslaan en inkomende mail aanzetten.
                </p>
              </>
            ) : null}

            {showMicrosoftConnect ? (
              <>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    type="button"
                    size="sm"
                    className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
                    onClick={() => {
                      window.location.href = "/api/oauth/microsoft-email";
                    }}
                  >
                    Verbind met Microsoft
                  </Button>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      microsoftEmailConnection?.status === "connected"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-700 dark:text-amber-400",
                    )}
                  >
                    {microsoftEmailConnection?.status === "connected"
                      ? `Gekoppeld (${microsoftEmailConnection.display_name || "Microsoft"})`
                      : "Nog niet gekoppeld"}
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Je krijgt het Microsoft-inlogscherm en kiest het werk- of persoonlijke account voor deze mailbox.
                </p>
              </>
            ) : null}

            {showOtherHint ? (
              <p className="rounded-xl border border-border/50 bg-background/70 px-4 py-3 text-xs leading-relaxed text-muted-foreground ring-1 ring-border/40 dark:bg-white/[0.03]">
                {showOtherHint}
              </p>
            ) : null}

            <div className="space-y-2 rounded-xl border border-border/55 bg-background/75 p-4 dark:border-white/[0.08]">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Koppel e-mailadres
              </p>
              <input
                type="email"
                name="email_linked_address"
                defaultValue={linkedEmailAddress}
                placeholder="info@jouwdomein.nl"
                className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm shadow-inner-soft transition focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/[0.1]"
              />
              <p className="text-xs text-muted-foreground">
                Dit wordt het gekoppelde adres voor dit kanaal. Werkt voor alle providers.
              </p>
            </div>
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
        {flashError ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-sm">
            {flashError === "google_email_not_configured"
              ? "Google koppeling staat nog niet goed ingesteld op de server."
              : flashError === "microsoft_email_not_configured"
                ? "Microsoft koppeling staat nog niet goed ingesteld op de server."
                : "Koppelen is niet gelukt. Probeer opnieuw of controleer de instellingen."}
          </p>
        ) : null}

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
