"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
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
  Building2,
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
      className="min-h-11 rounded-xl bg-gradient-to-r from-primary to-primary/88 px-8 font-semibold shadow-md transition hover:brightness-[1.03] active:scale-[0.99]"
    >
      {pending ? "Opslaan…" : label}
    </Button>
  );
}

const initial: SettingsFormState = {};

type WaProvider = "meta" | "twilio" | "mock";

const META_WA_OVERVIEW =
  "https://developers.facebook.com/docs/whatsapp/cloud-api/overview";

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
    title: "Meta — jouw zakelijke nummer",
    hint: "Zelfde nummer als in de gratis WhatsApp Business-app. Aanbevolen voor de meeste zzp’ers en kleine teams.",
    icon: Smartphone,
    accent: "from-emerald-500/15 to-teal-500/8",
  },
  {
    value: "twilio",
    title: "Twilio — via partner of IT",
    hint: "Als je al een WhatsApp Business API-account via Twilio hebt, vul je hier de gegevens in.",
    icon: Building2,
    accent: "from-sky-500/12 to-indigo-500/8",
  },
  {
    value: "mock",
    title: "Alleen testen",
    hint: "Geen echte berichten — handig om de rest van Zylmero uit te proberen.",
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
        "relative flex cursor-pointer flex-col gap-2 rounded-2xl border-2 bg-gradient-to-br p-4 shadow-sm transition-all",
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
      <span className="flex size-10 items-center justify-center rounded-xl bg-background/80 text-primary ring-1 ring-border/50 dark:bg-black/25 dark:ring-white/[0.08]">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="text-sm font-semibold leading-snug text-foreground">{option.title}</span>
      <span className="text-xs leading-relaxed text-muted-foreground">{option.hint}</span>
      {selected ? (
        <span
          className="absolute right-3 top-3 size-2.5 rounded-full border-2 border-primary bg-primary shadow-sm"
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

  return (
    <form
      action={action}
      className={cn(
        "cf-dashboard-panel overflow-hidden rounded-[1.35rem] border-border/55 shadow-[0_24px_64px_-40px_hsl(222_47%_11%/0.18)]",
        "space-y-0 p-0 sm:shadow-[0_28px_72px_-44px_hsl(222_47%_11%/0.22)]",
      )}
    >
      <div className="relative border-b border-border/45 bg-gradient-to-br from-primary/[0.12] via-card to-muted/20 px-5 py-7 sm:px-8 sm:py-8 dark:border-white/[0.08] dark:from-primary/[0.18] dark:via-[hsl(222_28%_11%/0.95)]">
        <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-inner ring-1 ring-primary/25 dark:bg-primary/25">
            <MessageCircle className="size-6" strokeWidth={1.6} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/90">Kanaal</p>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              WhatsApp — het nummer dat klanten al kennen
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
              Voor automatische concept-antwoorden gebruik je{" "}
              <strong className="font-medium text-foreground">WhatsApp Business</strong> via een officiële
              koppeling. Dat is wél hetzelfde mobiele nummer als in je groene Business-app — klanten merken geen
              verschil. De gewone <strong className="font-medium text-foreground">privé-WhatsApp</strong> (zonder
              Business) kan niet rechtstreeks: zet je zaak gratis om naar WhatsApp Business en kies hieronder{" "}
              <strong className="font-medium text-foreground">Meta</strong>.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" className="rounded-full border-primary/25 bg-background/70" asChild>
                <a href={META_WA_OVERVIEW} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 size-3.5 opacity-80" aria-hidden />
                  Uitleg Meta (Engels)
                </a>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full bg-background/70" asChild>
                <Link href="/dashboard/chatbot">Je chatbot</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-9">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-foreground">Hoe wil je koppelen?</legend>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Kies één optie. In productie gebruik je bijna altijd <span className="font-medium text-foreground">Meta</span>{" "}
            (gratis Cloud API) of <span className="font-medium text-foreground">Twilio</span> als je dat al hebt.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
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

        <div
          className={cn(
            "flex flex-col gap-4 rounded-2xl border border-border/55 bg-muted/[0.2] p-5 sm:flex-row sm:items-center sm:justify-between",
            "dark:border-white/[0.08] dark:bg-white/[0.03]",
          )}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">Verbinding actief</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Aan = dit kanaal mag berichten binnenlaten zodra je provider klaarstaat. Uit = tijdelijk pauzeren.
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
              Vul alleen in als je provider dat vraagt — bijv. Meta <span className="font-mono text-[0.7rem]">phone_number_id</span>{" "}
              of Twilio <span className="font-mono text-[0.7rem]">From</span>.
            </p>
            <Input
              id="external_id"
              name="external_id"
              placeholder="Plak hier de ID uit je provider-dashboard"
              defaultValue={channel.external_id ?? ""}
              className="h-11 rounded-xl border-border/60 bg-background/90 shadow-inner-soft dark:border-white/[0.1]"
            />
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent p-5 sm:flex-row sm:items-center sm:justify-between",
            "dark:border-primary/30 dark:from-primary/[0.1]",
          )}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">Chatbot helpt meeschrijven</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Nieuwe appjes krijgen automatisch een <strong className="font-medium text-foreground">concept</strong>{" "}
              in je inbox — jij stuurt ze door of past aan. Eerste reactie meestal binnen enkele seconden.
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
            Korte pauze voor antwoord (seconden)
          </Label>
          <p className="text-xs text-muted-foreground">
            Handig om niet instant te reageren midden in de nacht — standaard 30 is rustig.
          </p>
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

        {state.error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Opgeslagen — je chatbot gebruikt deze WhatsApp-instellingen.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-6 dark:border-white/[0.06]">
          <Submit label="WhatsApp opslaan" />
        </div>
      </div>
    </form>
  );
}
