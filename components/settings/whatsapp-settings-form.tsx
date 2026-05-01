"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateWhatsAppSettingsAction, type SettingsFormState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { WhatsAppChannelSettings } from "@/lib/types";
import type { CompanySocialConnection } from "@/lib/queries/social-connections";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm" variant="secondary">
      {pending ? "…" : label}
    </Button>
  );
}

const initial: SettingsFormState = {};

const META_OAUTH = "/api/oauth/meta";

function mapWhatsAppOAuthFlash(raw: string): string {
  switch (raw) {
    case "no_company":
      return "Je sessie klopt niet. Vernieuw de pagina en probeer opnieuw.";
    case "meta_not_configured":
      return "WhatsApp is hier nog niet ingesteld (Meta-app ontbreekt).";
    case "session_mismatch":
      return "Sessie kwam niet overeen. Probeer opnieuw te verbinden.";
    case "state_expired":
      return "Verbinding verlopen. Klik opnieuw op de knop.";
    default:
      return raw.length > 220 ? `${raw.slice(0, 220)}…` : raw;
  }
}

export function WhatsAppSettingsForm({
  channel,
  socialConnections,
  metaConfigured,
  oauthFlashError,
}: {
  channel: WhatsAppChannelSettings;
  socialConnections: CompanySocialConnection[];
  metaConfigured: boolean;
  oauthFlashError?: string | null;
}) {
  const [state, action] = useFormState(updateWhatsAppSettingsAction, initial);

  const metaConnection = socialConnections.find((c) => c.provider === "meta");
  const metaPages = Array.isArray(metaConnection?.metadata?.pages)
    ? (metaConnection.metadata.pages as Array<Record<string, unknown>>)
    : [];
  const metaConnected = metaConnection?.status === "connected";
  const defaultProfileId =
    channel.external_id?.trim() || String(metaPages[0]?.id ?? "");

  return (
    <div className="cf-dashboard-panel mx-auto max-w-md space-y-5 rounded-xl border border-border/60 bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">WhatsApp</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Koppel via Meta. Daarna kun je hier het juiste profiel kiezen als je er meer hebt.
        </p>
      </div>

      {oauthFlashError ? (
        <p className="text-sm text-destructive">{mapWhatsAppOAuthFlash(oauthFlashError)}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {metaConfigured ? (
          <Button asChild>
            <a href={META_OAUTH} target="_top" rel="noopener noreferrer">
              {metaConnected ? "Opnieuw koppelen" : "WhatsApp koppelen"}
            </a>
          </Button>
        ) : (
          <Button type="button" disabled>
            WhatsApp koppelen
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          {metaConnected ? "Gekoppeld" : "Niet gekoppeld"}
        </span>
      </div>

      {!metaConfigured ? (
        <p className="text-xs text-muted-foreground">Vraag support om Meta (WhatsApp) in te stellen.</p>
      ) : null}

      <form action={action} className="space-y-4 border-t border-border/50 pt-5">
        {metaConnected && metaPages.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="meta_profile_pick" className="text-sm">
              Profiel
            </Label>
            <select
              id="meta_profile_pick"
              name="external_id"
              defaultValue={defaultProfileId}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {metaPages.map((p) => {
                const id = String(p.id ?? "");
                const name = String(p.name ?? id);
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <input type="hidden" name="external_id" value={defaultProfileId} />
        )}

        <input type="hidden" name="provider" value="meta" />
        <input type="hidden" name="connected" value={metaConnected ? "on" : "off"} />
        <input type="hidden" name="phone_number" value={channel.phone_number ?? ""} />
        <input type="hidden" name="auto_reply_enabled" value="on" />
        <input type="hidden" name="auto_reply_delay_seconds" value="15" />

        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.ok ? <p className="text-sm text-emerald-600 dark:text-emerald-400">Opgeslagen.</p> : null}

        {metaConnected ? <Submit label="Opslaan" /> : null}
      </form>
    </div>
  );
}
