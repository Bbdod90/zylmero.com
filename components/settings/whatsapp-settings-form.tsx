"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import {
  updateWhatsAppSettingsAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { WhatsAppChannelSettings } from "@/lib/types";
import type { CompanySocialConnection } from "@/lib/queries/social-connections";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-14 min-h-[3.5rem] w-full rounded-xl bg-primary text-primary-foreground px-8 text-base font-semibold shadow-sm transition active:scale-[0.99] sm:w-auto sm:min-w-[18rem]"
    >
      {pending ? "Bezig met opslaan…" : label}
    </Button>
  );
}

const initial: SettingsFormState = {};

const META_OAUTH_CONNECT = "/api/oauth/meta";

export function WhatsAppSettingsForm({
  channel,
  socialConnections,
  metaConfigured,
  metaAppId,
}: {
  channel: WhatsAppChannelSettings;
  socialConnections: CompanySocialConnection[];
  metaConfigured: boolean;
  metaAppId: string;
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
    <form
      action={action}
      className={cn(
        "cf-dashboard-panel mx-auto w-full max-w-4xl overflow-hidden rounded-[1.35rem] border-border/55 shadow-[0_24px_64px_-40px_hsl(222_47%_11%/0.18)]",
        "space-y-0 p-0 sm:shadow-[0_28px_72px_-44px_hsl(222_47%_11%/0.22)]",
      )}
    >
      <div className="relative border-b border-border/45 bg-gradient-to-br from-primary/[0.12] via-card to-muted/20 px-5 py-6 sm:px-8 sm:py-7 dark:border-white/[0.08] dark:from-primary/[0.18] dark:via-[hsl(222_28%_11%/0.95)]">
        <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-inner ring-1 ring-primary/25 dark:bg-primary/25">
            <MessageCircle className="size-6" strokeWidth={1.6} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/90">WhatsApp</p>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">WhatsApp koppelen</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
              Koppel je zakelijke WhatsApp met 1 knop. Na verbinden kiest de klant het profiel/nummer en gebruikt
              Zylmero direct jouw chatbot op dat gekoppelde kanaal.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-9">
        <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/[0.25] p-5 dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
          <p className="text-sm font-semibold text-foreground">Meta app per gebruiker</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="meta_app_id" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Meta App ID
              </Label>
              <input
                id="meta_app_id"
                name="meta_app_id"
                defaultValue={metaAppId}
                className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm dark:border-white/[0.1]"
                placeholder="123456789012345"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meta_app_secret" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Meta App Secret
              </Label>
              <input
                id="meta_app_secret"
                name="meta_app_secret"
                type="password"
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm dark:border-white/[0.1]"
                placeholder={metaAppId ? "Laat leeg om bestaande secret te behouden" : "••••••••••"}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Deze waarden worden per account opgeslagen en gebruikt voor de WhatsApp OAuth-flow van dit bedrijf.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/[0.25] p-5 dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
          <p className="text-sm font-semibold text-foreground">Verbind direct met WhatsApp (Meta)</p>
          <div className="flex flex-wrap items-center gap-3">
            {metaConfigured ? (
              <Button asChild size="lg" className="h-12 rounded-xl font-semibold shadow-sm">
                <a href={META_OAUTH_CONNECT}>
                  <ExternalLink className="mr-2 size-4 opacity-90" aria-hidden />
                  {metaConnected ? "Opnieuw verbinden met Meta" : "Nu verbinden met WhatsApp"}
                </a>
              </Button>
            ) : (
              <Button size="lg" className="h-12 rounded-xl font-semibold shadow-sm" disabled>
                <ExternalLink className="mr-2 size-4 opacity-90" aria-hidden />
                Nu verbinden met WhatsApp
              </Button>
            )}
            {metaConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-3.5" />
                Gekoppeld
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Nog niet gekoppeld</span>
            )}
          </div>
          {!metaConfigured ? (
            <p className="text-xs text-destructive">
              Vul eerst je Meta App ID en App Secret in en klik daarna op &quot;Gebruik deze WhatsApp koppeling&quot;.
            </p>
          ) : null}
        </div>

        {metaConnected && metaPages.length > 0 ? (
          <div className="space-y-3 rounded-2xl border border-border/55 bg-background/50 p-5 dark:border-white/[0.1] dark:bg-white/[0.03]">
            <Label htmlFor="meta_profile_pick" className="text-sm font-semibold text-foreground">
              Kies profiel / nummer dat je wilt koppelen
            </Label>
            <select
              id="meta_profile_pick"
              name="external_id"
              defaultValue={defaultProfileId}
              className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm dark:border-white/[0.1]"
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
            <p className="text-xs text-muted-foreground">Na opslaan gebruikt Zylmero dit profiel voor je WhatsApp-flow.</p>
          </div>
        ) : null}

        <input type="hidden" name="provider" value="meta" />
        <input type="hidden" name="connected" value={metaConnected ? "on" : "off"} />
        <input type="hidden" name="phone_number" value={channel.phone_number ?? ""} />
        <input type="hidden" name="auto_reply_enabled" value="on" />
        <input type="hidden" name="auto_reply_delay_seconds" value="15" />

        {state.error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Opgeslagen. Open{" "}
            <Link
              href="/dashboard/inbox"
              className="font-semibold text-primary underline decoration-primary/40 underline-offset-2"
            >
              Berichten
            </Link>{" "}
            om te testen.
          </p>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-border/40 pt-6 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
          <Submit label="Gebruik deze WhatsApp koppeling" />
          <Button asChild variant="outline" size="lg" className="h-12 rounded-xl font-semibold">
            <Link href="/dashboard/chatbot">Naar je chatbot</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
