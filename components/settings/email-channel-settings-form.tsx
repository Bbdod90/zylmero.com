"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateEmailInboundSettingsAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
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
  const inboundPath = `${base}/api/webhooks/inbound-email`;

  const builderPack = [
    "Zylmero — koppeling inkomende e-mail",
    "",
    "1) Zet de schakelaar hieronder aan in je Zylmero-instellingen.",
    "2) Vul bij Bedrijf je openbare contactmail in (als die nog leeg is).",
    "3) Laat je mailleverancier of IT inkomende mail automatisch doorsturen naar het koppel-adres hieronder.",
    "",
    `Koppel-adres (alleen voor technische kant):`,
    inboundPath,
    "",
    `Jouw referentie in het bericht (veld company_id):`,
    companyId,
    "",
    "Voorbeeldinhoud van een bericht:",
    `{ "company_id": "${companyId}", "from": "klant@voorbeeld.nl", "from_name": "Jan", "subject": "Vraag", "body": "…" }`,
  ].join("\n");

  return (
    <form action={action} className="cf-dashboard-panel space-y-8 p-6 sm:p-8 lg:p-9">
      <header className="flex gap-4 border-b border-border/50 pb-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Mail className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">E-mail binnen laten komen</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Klantmail verschijnt bij <strong className="font-medium text-foreground">Berichten</strong>, net als
            WhatsApp. Zelfde assistent — één overzicht.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/55 bg-gradient-to-b from-card to-muted/15 p-4 shadow-sm dark:border-white/[0.08]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stap 1</p>
          <p className="mt-2 text-sm font-medium text-foreground">Contactmail invullen</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Die staat bij Bedrijf in je instellingen.</p>
          <p
            className={cn(
              "mt-3 text-xs font-medium",
              hasContactEmail ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400",
            )}
          >
            {hasContactEmail ? "Contactmail staat erin." : "Vul eerst je contactmail in bij Bedrijf."}
          </p>
        </div>
        <div className="rounded-xl border border-border/55 bg-gradient-to-b from-card to-muted/15 p-4 shadow-sm dark:border-white/[0.08]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stap 2</p>
          <p className="mt-2 text-sm font-medium text-foreground">Inkomend aanzetten</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Pas als dit aan staat, verwerken we automatisch doorgestuurde mail voor jouw bedrijf.
          </p>
        </div>
        <div className="rounded-xl border border-border/55 bg-gradient-to-b from-card to-muted/15 p-4 shadow-sm dark:border-white/[0.08]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stap 3</p>
          <p className="mt-2 text-sm font-medium text-foreground">Leverancier laten doorsturen</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Gebruik de knop hieronder om alles in één keer naar je webbouwer of IT te sturen.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-primary/22 bg-gradient-to-br from-primary/[0.06] to-muted/10 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-primary/30">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">Inkomende e-mail verwerken</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Uit = we negeren automatische doorstuuracties. Aan = berichten komen bij je binnen.
          </p>
        </div>
        <FormBooleanSwitch
          name="email_inbound_enabled"
          defaultChecked={emailInboundEnabled}
          label="Aan"
          labelClassName="text-muted-foreground"
        />
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 p-5 dark:border-white/[0.08]">
        <p className="text-sm font-semibold text-foreground">Voor je webbouwer of IT</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Er hoeft hier niets technisch te worden afgelezen. Kopieer het blok en mail het door — daar staat alles in wat
          zij nodig hebben.
        </p>
        <div className="mt-4">
          <CopyButton text={builderPack} label="Kopieer instructies voor je webbouwer" />
        </div>
      </div>

      <Separator className="bg-border/60" />

      {state.error ? <p className="text-sm font-medium text-destructive">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Opgeslagen.</p>
      ) : null}
      <Submit label="Voorkeur opslaan" />
    </form>
  );
}
