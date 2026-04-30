"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { updateWhatsAppSettingsAction, type SettingsFormState } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { WhatsAppChannelSettings } from "@/lib/types";
import type { CompanySocialConnection } from "@/lib/queries/social-connections";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ExternalLink,
  Link2,
  MessageCircle,
} from "lucide-react";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-12 min-h-[3rem] w-full rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_14px_34px_-18px_hsl(var(--primary)/0.72)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_38px_-18px_hsl(var(--primary)/0.8)] active:scale-[0.99] sm:w-auto sm:min-w-[16rem]"
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
}: {
  channel: WhatsAppChannelSettings;
  socialConnections: CompanySocialConnection[];
  metaConfigured: boolean;
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
    <div
      className={cn(
        "cf-dashboard-panel mx-auto w-full max-w-4xl overflow-hidden rounded-[1.35rem] border border-border/60 bg-card",
        "space-y-0 p-0 shadow-[0_26px_74px_-44px_hsl(222_47%_11%/0.24)] sm:shadow-[0_32px_88px_-48px_hsl(222_47%_11%/0.3)]",
      )}
    >
      <div className="relative border-b border-border/50 bg-gradient-to-br from-primary/[0.11] via-card to-muted/20 px-5 py-6 sm:px-8 sm:py-7 dark:border-white/[0.08] dark:from-primary/[0.16] dark:via-[hsl(222_28%_11%/0.95)]">
        <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-inner ring-1 ring-primary/30 dark:bg-primary/25">
            <MessageCircle className="size-6" strokeWidth={1.6} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/90">
              WhatsApp
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
              WhatsApp koppelen
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Koppel je zakelijke WhatsApp met 1 knop. Na verbinden kiest de klant het profiel/nummer en gebruikt Zylmero
              direct jouw chatbot op dat gekoppelde kanaal.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-7 sm:px-8 sm:py-8">
        <form
          action={action}
          className={cn(
            "space-y-5",
          )}
        >
          <div className="rounded-2xl border border-border/55 bg-muted/[0.18] p-5 dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
            <div className="mb-4 flex items-start gap-3.5">
              <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-lg bg-background/80 text-primary ring-1 ring-border/60 dark:bg-white/[0.04] dark:ring-white/[0.1]">
                <Link2 className="size-[0.95rem]" aria-hidden />
              </span>
              <div className="space-y-1">
                <p className="text-[0.95rem] font-semibold text-foreground">Stap 1 · Verbind direct met WhatsApp (Meta)</p>
                <p className="text-xs leading-relaxed text-muted-foreground/90">
                  Klik op de knop, kies in Meta het WhatsApp-profiel/nummer, en Zylmero koppelt daarna automatisch.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              {metaConfigured ? (
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_12px_28px_-16px_hsl(var(--primary)/0.75)] transition hover:translate-y-[-1px]"
                >
                  <a href={META_OAUTH_CONNECT}>
                    <ExternalLink className="mr-2 size-4 opacity-90" aria-hidden />
                    {metaConnected ? "Opnieuw verbinden met Meta" : "Nu verbinden met WhatsApp"}
                  </a>
                </Button>
              ) : (
                <Button size="lg" className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground opacity-60" disabled>
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
              <p className="mt-3 text-xs text-destructive">
                WhatsApp koppelen is nog niet beschikbaar op deze omgeving. Neem contact op met support.
              </p>
            ) : null}
          </div>

          {metaConnected && metaPages.length > 0 ? (
            <div className="space-y-3 rounded-2xl border border-border/55 bg-background/75 p-5 dark:border-white/[0.1] dark:bg-white/[0.03]">
              <Label htmlFor="meta_profile_pick" className="text-sm font-semibold text-foreground">
                Stap 2 · Kies profiel / nummer dat je wilt koppelen
              </Label>
              <select
                id="meta_profile_pick"
                name="external_id"
                defaultValue={defaultProfileId}
                className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm shadow-inner-soft transition focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/[0.1]"
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
              <p className="text-xs text-muted-foreground">
                Klik onderaan op &quot;Gebruik deze WhatsApp koppeling&quot; om dit profiel vast te leggen.
              </p>
            </div>
          ) : null}

          <input type="hidden" name="provider" value="meta" />
          <input type="hidden" name="connected" value={metaConnected ? "on" : "off"} />
          <input type="hidden" name="phone_number" value={channel.phone_number ?? ""} />
          <input type="hidden" name="auto_reply_enabled" value="on" />
          <input type="hidden" name="auto_reply_delay_seconds" value="15" />

          {state.error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-sm">
              {state.error}
            </p>
          ) : null}
          {state.ok ? (
            <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm dark:text-emerald-200">
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

          <div className="flex flex-col gap-4 border-t border-border/50 pt-5 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
            <Submit label="Gebruik deze WhatsApp koppeling" />
            <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-border/70 bg-background/85 font-semibold shadow-sm">
              <Link href="/dashboard/chatbot">Naar je chatbot</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
