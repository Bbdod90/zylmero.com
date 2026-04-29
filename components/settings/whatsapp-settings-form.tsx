"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  updateWhatsAppSettingsAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBooleanSwitch } from "@/components/settings/form-boolean-switch";
import type { WhatsAppChannelSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  ExternalLink,
  MessageCircle,
  Smartphone,
  Sparkles,
} from "lucide-react";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-14 min-h-[3.5rem] w-full rounded-xl bg-gradient-to-r from-primary to-primary/88 px-8 text-base font-semibold shadow-md transition hover:brightness-[1.03] active:scale-[0.99] sm:w-auto sm:min-w-[18rem]"
    >
      {pending ? "Bezig met opslaan…" : label}
    </Button>
  );
}

const initial: SettingsFormState = {};

type WaProvider = "meta" | "twilio" | "mock";

const META_BUSINESS_WA = "https://business.facebook.com/latest/whatsapp";
const META_DEV_DOCS = "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started";
const TWILIO_CONSOLE = "https://console.twilio.com/";

type ProviderOption = {
  value: string;
  title: string;
  hint: string;
  icon: typeof Smartphone;
  accent: string;
};

const PROVIDERS: ProviderOption[] = [
  {
    value: "meta",
    title: "Meta (aanbevolen)",
    hint: "Zelfde zakelijke nummer als in de groene WhatsApp Business-app.",
    icon: Smartphone,
    accent: "from-emerald-500/15 to-teal-500/8",
  },
  {
    value: "twilio",
    title: "Twilio",
    hint: "Als je API al via Twilio loopt.",
    icon: Building2,
    accent: "from-sky-500/12 to-indigo-500/8",
  },
  {
    value: "mock",
    title: "Alleen testen",
    hint: "Geen echte WhatsApp — wél Berichten en AI proberen.",
    icon: Sparkles,
    accent: "from-violet-500/12 to-primary/8",
  },
];

function ProviderCard({
  option,
  selected,
  onSelect,
}: {
  option: ProviderOption;
  selected: boolean;
  onSelect: (value: WaProvider) => void;
}) {
  const Icon = option.icon;
  return (
    <label
      className={cn(
        "relative flex min-h-[9.5rem] cursor-pointer flex-col gap-2 rounded-2xl border-2 bg-gradient-to-br p-5 shadow-sm transition-all",
        "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md",
        selected
          ? "border-primary bg-primary/[0.08] shadow-[0_12px_40px_-24px_hsl(var(--primary)/0.35)] dark:border-primary/55"
          : "border-border/55 dark:border-white/[0.1]",
        option.accent,
      )}
    >
      <input
        type="radio"
        name="provider"
        value={option.value}
        checked={selected}
        onChange={() => onSelect(option.value as WaProvider)}
        className="sr-only"
      />
      <span className="flex size-11 items-center justify-center rounded-xl bg-background/80 text-primary ring-1 ring-border/50 dark:bg-black/25 dark:ring-white/[0.08]">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="text-base font-semibold leading-snug text-foreground">{option.title}</span>
      <span className="text-sm leading-relaxed text-muted-foreground">{option.hint}</span>
      {selected ? (
        <span
          className="absolute right-4 top-4 size-2.5 rounded-full border-2 border-primary bg-primary shadow-sm"
          aria-hidden
        />
      ) : null}
    </label>
  );
}

export function WhatsAppSettingsForm({
  channel,
  auto_reply_enabled,
  auto_reply_delay_seconds,
}: {
  channel: WhatsAppChannelSettings;
  auto_reply_enabled: boolean;
  auto_reply_delay_seconds: number;
}) {
  const [state, action] = useFormState(updateWhatsAppSettingsAction, initial);
  const [provider, setProvider] = useState<WaProvider>(() => {
    const p = channel.provider;
    return p === "meta" || p === "twilio" || p === "mock" ? p : "mock";
  });
  const advDetailsRef = useRef<HTMLDetailsElement>(null);
  const shouldOpenAdvanced =
    Boolean(channel.phone_number?.trim()) || Boolean(channel.external_id?.trim());
  useLayoutEffect(() => {
    const el = advDetailsRef.current;
    if (el && shouldOpenAdvanced) el.open = true;
  }, [shouldOpenAdvanced]);
  const providerLinks: Record<WaProvider, { label: string; href: string }> = {
    meta: { label: "Open Meta WhatsApp", href: META_BUSINESS_WA },
    twilio: { label: "Open Twilio Console", href: TWILIO_CONSOLE },
    mock: { label: "Open Berichten in Zylmero", href: "/dashboard/inbox" },
  };
  const activeProviderLink = providerLinks[provider];

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
              Kies je provider, open de juiste omgeving en sla je keuze op. Geen stappenplan — gewoon direct koppelen.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-9">
        <fieldset className="space-y-4">
          <legend className="text-base font-semibold text-foreground">Welke WhatsApp-provider wil je koppelen?</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            {PROVIDERS.map((p) => (
              <ProviderCard
                key={p.value}
                option={p}
                selected={provider === p.value}
                onSelect={setProvider}
              />
            ))}
          </div>
        </fieldset>

        <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/[0.25] p-5 dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
          <p className="text-sm font-semibold text-foreground">Open geselecteerde provider</p>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Zylmero logt niet voor je in bij Meta of Twilio. Open je gekozen provider, rond daar je setup af en klik
            daarna op opslaan.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="h-12 rounded-xl font-semibold shadow-sm">
              <a
                href={activeProviderLink.href}
                target={provider === "mock" ? undefined : "_blank"}
                rel={provider === "mock" ? undefined : "noopener noreferrer"}
              >
                <ExternalLink className="mr-2 size-4 opacity-90" aria-hidden />
                {activeProviderLink.label}
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg" className="h-12 rounded-xl font-semibold">
              <Link href="/dashboard/inbox">
                Berichten in Zylmero
                <ArrowRight className="ml-2 size-4 opacity-80" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-12 rounded-xl text-muted-foreground">
              <a href={META_DEV_DOCS} target="_blank" rel="noopener noreferrer">
                Technische uitleg (Meta, Engels)
              </a>
            </Button>
          </div>
        </div>

        <details
          ref={advDetailsRef}
          className="group rounded-2xl border border-border/55 bg-background/50 dark:border-white/[0.1] dark:bg-white/[0.03]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 marker:content-none [&::-webkit-details-marker]:hidden sm:px-5">
            <span className="text-sm font-semibold text-foreground">Optioneel: nummer, ID en finetuning</span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-6 border-t border-border/40 px-4 pb-5 pt-4 dark:border-white/[0.08] sm:px-5 sm:pb-6">
            <div
              className={cn(
                "flex flex-col gap-4 rounded-2xl border border-border/55 bg-muted/[0.2] p-4 sm:flex-row sm:items-center sm:justify-between",
                "dark:border-white/[0.08] dark:bg-white/[0.03]",
              )}
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-foreground">Verbinding actief</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Uit = tijdelijk geen berichten binnenlaten in Zylmero.
                </p>
              </div>
              <FormBooleanSwitch
                name="connected"
                defaultChecked={channel.connected}
                label="Actief"
                labelClassName="text-muted-foreground"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-semibold text-foreground">
                  Telefoonnummer (weergave)
                </Label>
                <p className="text-xs text-muted-foreground">Zoals klanten het zien, bijv. +31 6 …</p>
                <Input
                  id="phone_number"
                  name="phone_number"
                  placeholder="+31 6 12 34 56 78"
                  defaultValue={channel.phone_number ?? ""}
                  className="h-11 rounded-xl border-border/60 bg-background/90 shadow-inner-soft dark:border-white/[0.1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="external_id" className="text-sm font-semibold text-foreground">
                  Koppel-ID (Meta of Twilio)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Alleen als je provider het vraagt — bijv. Meta{" "}
                  <span className="font-mono text-[0.7rem]">phone_number_id</span> of Twilio{" "}
                  <span className="font-mono text-[0.7rem]">From</span>.
                </p>
                <Input
                  id="external_id"
                  name="external_id"
                  placeholder="Plak ID uit provider-dashboard"
                  defaultValue={channel.external_id ?? ""}
                  className="h-11 rounded-xl border-border/60 bg-background/90 shadow-inner-soft dark:border-white/[0.1]"
                />
              </div>
            </div>

            <div
              className={cn(
                "flex flex-col gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent p-4 sm:flex-row sm:items-center sm:justify-between",
                "dark:border-primary/30 dark:from-primary/[0.1]",
              )}
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-foreground">Chatbot helpt meeschrijven</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Nieuwe appjes krijgen een <strong className="font-medium text-foreground">concept</strong> in je
                  inbox.
                </p>
              </div>
              <FormBooleanSwitch
                name="auto_reply_enabled"
                defaultChecked={auto_reply_enabled}
                label="Aan"
                labelClassName="text-muted-foreground"
              />
            </div>

            <div className="max-w-xs space-y-2">
              <Label htmlFor="auto_reply_delay_seconds" className="text-sm font-semibold text-foreground">
                Pauze voor antwoord (seconden)
              </Label>
              <p className="text-xs text-muted-foreground">Standaard 30 — rustig voor buiten kantoortijd.</p>
              <Input
                id="auto_reply_delay_seconds"
                name="auto_reply_delay_seconds"
                type="number"
                min={0}
                max={300}
                defaultValue={auto_reply_delay_seconds}
                className="h-11 rounded-xl border-border/60 bg-background/90 dark:border-white/[0.1]"
              />
            </div>
          </div>
        </details>

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
          <Submit label="Opslaan in Zylmero" />
          <Button asChild variant="outline" size="lg" className="h-12 rounded-xl font-semibold">
            <Link href="/dashboard/chatbot">Naar je chatbot</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
