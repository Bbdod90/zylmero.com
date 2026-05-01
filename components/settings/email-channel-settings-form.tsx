"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useMemo } from "react";
import {
  updateEmailInboundSettingsAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { FormBooleanSwitch } from "@/components/settings/form-boolean-switch";
import type { CompanySocialConnection } from "@/lib/queries/social-connections";

const initial: SettingsFormState = {};

type StoredEmailProvider = "google" | "microsoft" | "other";

type MailChoiceId = "google" | "microsoft";

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
    <Button type="submit" disabled={pending} size="sm" variant="secondary">
      {pending ? "…" : label}
    </Button>
  );
}

export function EmailChannelSettingsForm({
  emailInboundEnabled,
  emailProvider,
  emailProviderDetail: _emailProviderDetail,
  hasContactEmail,
  socialConnections,
  flashError,
}: {
  emailInboundEnabled: boolean;
  emailProvider: StoredEmailProvider;
  emailProviderDetail: string;
  hasContactEmail: boolean;
  socialConnections: CompanySocialConnection[];
  flashError: string | null;
}) {
  const [state, action] = useFormState(updateEmailInboundSettingsAction, initial);

  const googleEmailConnection = socialConnections.find((c) => c.provider === "google_email");
  const microsoftEmailConnection = socialConnections.find((c) => c.provider === "microsoft_email");

  const hidden = useMemo(() => {
    let choice: MailChoiceId = "google";
    if (googleEmailConnection?.status === "connected") choice = "google";
    else if (microsoftEmailConnection?.status === "connected") choice = "microsoft";
    else if (emailProvider === "microsoft") choice = "microsoft";
    else if (emailProvider === "google") choice = "google";
    return choiceToHiddenFields(choice);
  }, [
    googleEmailConnection?.status,
    microsoftEmailConnection?.status,
    emailProvider,
  ]);

  return (
    <div className="cf-dashboard-panel mx-auto max-w-md space-y-5 rounded-xl border border-border/60 bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">E-mail</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kies Gmail of Outlook. Je gaat inloggen bij je provider om te koppelen.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild className="w-full sm:w-auto">
          <a href="/api/oauth/email?oauth_provider=google" target="_top" rel="noopener noreferrer">
            Gmail koppelen
          </a>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <a href="/api/oauth/email?oauth_provider=microsoft" target="_top" rel="noopener noreferrer">
            Outlook koppelen
          </a>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Gmail:{" "}
        {googleEmailConnection?.status === "connected"
          ? `gekoppeld (${googleEmailConnection.display_name || googleEmailConnection.external_page_id || "ok"})`
          : "niet gekoppeld"}
        <br />
        Outlook:{" "}
        {microsoftEmailConnection?.status === "connected"
          ? `gekoppeld (${microsoftEmailConnection.display_name || "ok"})`
          : "niet gekoppeld"}
      </p>

      <form action={action} className="space-y-4 border-t border-border/50 pt-5">
        <input type="hidden" name="email_provider" value={hidden.email_provider} />
        <input type="hidden" name="email_provider_detail" value={hidden.email_provider_detail} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">Inkomende mail naar Berichten</span>
          <FormBooleanSwitch
            name="email_inbound_enabled"
            defaultChecked={emailInboundEnabled}
            label="Aan"
            labelClassName="text-muted-foreground"
          />
        </div>

        {!hasContactEmail ? (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Tip: vul een contactmail in bij het tabblad Bedrijf.
          </p>
        ) : null}

        {flashError ? (
          <p className="text-sm text-destructive">
            {flashError === "google_email_not_configured"
              ? "Google is op de server nog niet ingesteld."
              : flashError === "microsoft_email_not_configured"
                ? "Microsoft is op de server nog niet ingesteld."
                : flashError === "no_company"
                  ? "Geen bedrijf gevonden voor dit account. Vernieuw of log opnieuw in."
                  : "Koppelen mislukt. Probeer opnieuw."}
          </p>
        ) : null}
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.ok ? <p className="text-sm text-emerald-600 dark:text-emerald-400">Opgeslagen.</p> : null}

        <Submit label="Opslaan" />
      </form>
    </div>
  );
}
