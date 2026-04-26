"use client";

import type { ComponentProps } from "react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  updateBusinessProfileAction,
  updateKnowledgeAction,
  updateQuoteTemplateAction,
  updateWhiteLabelAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppSettingsForm } from "@/components/settings/whatsapp-settings-form";
import { EmailChannelSettingsForm } from "@/components/settings/email-channel-settings-form";
import { BillingSettings } from "@/components/settings/billing-settings";
import { WidgetSettings } from "@/components/settings/widget-settings";
import { WidgetSubscriptionGate } from "@/components/settings/widget-subscription-gate";
import { FormBooleanSwitch } from "@/components/settings/form-boolean-switch";
import { cn } from "@/lib/utils";
import type { Company, WhatsAppChannelSettings } from "@/lib/types";
import { Puzzle } from "lucide-react";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-lg px-6 font-semibold shadow-sm">
      {pending ? "Opslaan…" : label}
    </Button>
  );
}

const initial: SettingsFormState = {};

const VALID_TABS = new Set([
  "business",
  "knowledge",
  "branding",
  "whatsapp",
  "email",
  "billing",
  "widget",
  "quotes",
]);

const tabTriggerClass =
  "relative shrink-0 snap-start scroll-m-1 whitespace-nowrap rounded-none border-b-2 border-transparent bg-transparent px-2.5 py-2.5 text-[0.8125rem] font-medium text-muted-foreground shadow-none ring-offset-background transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none sm:px-4 sm:py-3 sm:text-sm";

function FormShell({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "cf-dashboard-panel space-y-8 p-6 sm:p-8 lg:p-9",
        className,
      )}
      {...props}
    />
  );
}

function FormIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <header className="space-y-1.5 border-b border-border/50 pb-6">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{children}</p>
    </header>
  );
}

export function SettingsTabs({
  company,
  settings,
  leadsThisMonth,
  leadCap,
  siteOrigin,
  widgetEmbedToken,
  websiteWidgetActive,
  defaultTab = "business",
}: {
  company: Company;
  widgetEmbedToken: string | null;
  /** Proef- of betaalabonnement: widget mag leads aannemen */
  websiteWidgetActive: boolean;
  settings: {
    niche: string | null;
    services: string[];
    faq: { q: string; a: string }[];
    pricing_hints: string | null;
    business_hours: Record<string, string>;
    booking_link: string | null;
    whatsapp_channel: WhatsAppChannelSettings;
    auto_reply_enabled: boolean;
    auto_reply_delay_seconds: number;
    email_inbound_enabled: boolean;
    knowledge_snippets: { title: string; body: string }[];
    white_label_logo_url: string | null;
    white_label_primary: string | null;
    quote_intro: string | null;
    quote_footer: string | null;
    quote_include_pricing_hints: boolean;
    quote_include_zylmero_notice: boolean;
  };
  leadsThisMonth: number;
  leadCap: number;
  siteOrigin: string;
  defaultTab?: string;
}) {
  const [s1, a1] = useFormState(updateBusinessProfileAction, initial);
  const [s2, a2] = useFormState(updateKnowledgeAction, initial);
  const [s4, a4] = useFormState(updateWhiteLabelAction, initial);
  const [s5, a5] = useFormState(updateQuoteTemplateAction, initial);

  const faqText =
    settings.faq?.map((f) => `${f.q} || ${f.a}`).join("\n\n") || "";
  const snippetsText =
    settings.knowledge_snippets
      ?.map((k) => `${k.title} || ${k.body}`)
      .join("\n\n") || "";
  const hoursText =
    typeof settings.business_hours?.text === "string"
      ? settings.business_hours.text
      : JSON.stringify(settings.business_hours || {}, null, 2);

  const initialTab =
    defaultTab && VALID_TABS.has(defaultTab) ? defaultTab : "business";
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabListScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  /** Actief tabblad horizontaal in beeld — zachte swipe-UX (zoals losse carrousel). */
  useLayoutEffect(() => {
    const scroller = tabListScrollRef.current;
    if (!scroller) return;
    const activeEl = scroller.querySelector(
      '[role="tab"][data-state="active"]',
    ) as HTMLElement | null;
    activeEl?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeTab]);

  /** Client-safe: niet trial.ts importeren (trekt server-only demo-map mee). */
  const trialExpiredHint =
    company.plan === "trial" &&
    company.trial_ends_at != null &&
    new Date(company.trial_ends_at).getTime() < Date.now();

  const primaryPreview =
    settings.white_label_primary?.trim() &&
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(settings.white_label_primary.trim())
      ? settings.white_label_primary.trim()
      : "#e2e8f0";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="sticky top-0 z-10 -mx-1 mb-4 border-b border-border/60 bg-background/90 pb-0 pt-0.5 backdrop-blur-md dark:bg-background/80">
          <div
            ref={tabListScrollRef}
            className="cf-dashboard-inline-scroll cursor-grab overflow-x-auto overflow-y-hidden pb-0.5 pt-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] active:cursor-grabbing"
          >
            <TabsList className="inline-flex h-11 min-h-[2.75rem] w-max max-w-none flex-nowrap items-stretch justify-start gap-0 rounded-none border-0 bg-transparent p-0 pr-1">
            <TabsTrigger value="business" className={tabTriggerClass}>
              Bedrijf
            </TabsTrigger>
            <TabsTrigger value="knowledge" className={tabTriggerClass}>
              Kennis
            </TabsTrigger>
            <TabsTrigger value="quotes" className={tabTriggerClass}>
              Offertes
            </TabsTrigger>
            <TabsTrigger value="branding" className={tabTriggerClass}>
              Huisstijl
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className={tabTriggerClass}>
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" className={tabTriggerClass}>
              E-mail
            </TabsTrigger>
            <TabsTrigger value="billing" className={tabTriggerClass}>
              Facturatie
            </TabsTrigger>
            <TabsTrigger value="widget" className={tabTriggerClass}>
              Widget
            </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="business" className="mt-8 outline-none">
          <form action={a1} className="space-y-8">
            <FormShell className="space-y-8">
              <FormIntro title="Bedrijf & contact">
                Gegevens voor antwoorden, offertes en je publieke profiel. Houd dit actueel — de AI gebruikt dit
                dagelijks.
              </FormIntro>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-sm font-medium">
                    Bedrijfsnaam
                  </Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    defaultValue={company.name}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-sm font-medium">
                      Contact e-mail
                    </Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      defaultValue={company.contact_email || ""}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone" className="text-sm font-medium">
                      Contacttelefoon
                    </Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      defaultValue={company.contact_phone || ""}
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="niche" className="text-sm font-medium">
                    Niche / specialisme
                  </Label>
                  <Input
                    id="niche"
                    name="niche"
                    defaultValue={settings.niche || ""}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="services" className="text-sm font-medium">
                    Diensten
                  </Label>
                  <p className="text-xs text-muted-foreground">Één dienst per regel.</p>
                  <Textarea
                    id="services"
                    name="services"
                    className="min-h-[120px] rounded-lg"
                    defaultValue={settings.services?.join("\n") || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking_link" className="text-sm font-medium">
                    Boekingslink
                  </Label>
                  <p className="text-xs text-muted-foreground">Agenda of Calendly-URL voor afspraken.</p>
                  <Input
                    id="booking_link"
                    name="booking_link"
                    type="url"
                    defaultValue={settings.booking_link || ""}
                    className="rounded-lg"
                  />
                </div>
              </div>
              {s1.error ? (
                <p className="text-sm font-medium text-destructive">{s1.error}</p>
              ) : null}
              {s1.ok ? (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Opgeslagen.</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-6">
                <Submit label="Profiel opslaan" />
              </div>
            </FormShell>
          </form>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-8 outline-none">
          <form action={a2}>
            <FormShell className="space-y-8">
              <FormIntro title="Kennis voor AI">
                Richtlijnen en snippets die antwoorden scherper maken. FAQ en extra kennis gebruiken het formaat{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">vraag || antwoord</code> met een lege regel
                tussen items.
              </FormIntro>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pricing_hints" className="text-sm font-medium">
                    Prijshints
                  </Label>
                  <p className="text-xs text-muted-foreground">Richtprijzen of uurtarieven (intern, niet juridisch bindend).</p>
                  <Textarea
                    id="pricing_hints"
                    name="pricing_hints"
                    className="min-h-[100px] rounded-lg"
                    defaultValue={settings.pricing_hints || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faq" className="text-sm font-medium">
                    FAQ
                  </Label>
                  <p className="text-xs text-muted-foreground">Blokken: vraag || antwoord. Lege regel tussen blokken.</p>
                  <Textarea
                    id="faq"
                    name="faq"
                    className="min-h-[140px] rounded-lg"
                    defaultValue={faqText}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_hours" className="text-sm font-medium">
                    Openingstijden
                  </Label>
                  <p className="text-xs text-muted-foreground">Vrije tekst of gestructureerde JSON — wat je team gewend is.</p>
                  <Textarea
                    id="business_hours"
                    name="business_hours"
                    className="min-h-[88px] rounded-lg font-mono text-xs leading-relaxed"
                    defaultValue={hoursText}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="knowledge_snippets" className="text-sm font-medium">
                    Extra kennis
                  </Label>
                  <p className="text-xs text-muted-foreground">Titel || tekst per item, lege regel ertussen.</p>
                  <Textarea
                    id="knowledge_snippets"
                    name="knowledge_snippets"
                    className="min-h-[120px] rounded-lg"
                    defaultValue={snippetsText}
                    placeholder={`Levertijden || 2–3 werkdagen\n\nGarantie || 12 maanden op montage`}
                  />
                </div>
              </div>
              {s2.error ? (
                <p className="text-sm font-medium text-destructive">{s2.error}</p>
              ) : null}
              {s2.ok ? (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Opgeslagen.</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-6">
                <Submit label="Kennis opslaan" />
              </div>
            </FormShell>
          </form>
        </TabsContent>

        <TabsContent value="quotes" className="mt-8 outline-none">
          <form action={a5}>
            <FormShell className="space-y-8">
              <FormIntro title="Offerte-PDF">
                Vaste boven- en ondertekst voor elke PDF. Optioneel prijshints uit het tabblad Kennis en een korte
                platformvermelding.
              </FormIntro>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="quote_intro" className="text-sm font-medium">
                    Vaste intro
                  </Label>
                  <p className="text-xs text-muted-foreground">Bovenaan de PDF, vóór de regels.</p>
                  <Textarea
                    id="quote_intro"
                    name="quote_intro"
                    className="min-h-[100px] rounded-lg"
                    defaultValue={settings.quote_intro || ""}
                    placeholder="Bedankt voor uw aanvraag. Onderstaande offerte is vrijblijvend…"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote_footer" className="text-sm font-medium">
                    Voorwaarden & afsluiting
                  </Label>
                  <p className="text-xs text-muted-foreground">Onderaan de PDF: betaling, garantie, voorwaarden.</p>
                  <Textarea
                    id="quote_footer"
                    name="quote_footer"
                    className="min-h-[140px] rounded-lg"
                    defaultValue={settings.quote_footer || ""}
                    placeholder="Betaling binnen 14 dagen. Werkzaamheden volgens afspraak…"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Opties</p>
                <div className="grid gap-3">
                  <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-muted/[0.12] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium text-foreground">Prijshints uit Kennis</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Voegt het veld Prijshints (tabblad Kennis) toe op de PDF als richtlijn.
                      </p>
                    </div>
                    <FormBooleanSwitch
                      name="quote_include_pricing_hints"
                      defaultChecked={settings.quote_include_pricing_hints}
                      switchAriaLabel="Prijshints op PDF"
                    />
                  </div>
                  <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-muted/[0.12] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium text-foreground">Zylmero-vermelding</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Korte standaardtekst dat de offerte via Zylmero loopt (aanbevolen).
                      </p>
                    </div>
                    <FormBooleanSwitch
                      name="quote_include_zylmero_notice"
                      defaultChecked={settings.quote_include_zylmero_notice}
                      switchAriaLabel="Zylmero-vermelding op PDF"
                    />
                  </div>
                </div>
              </div>
              {s5.error ? (
                <p className="text-sm font-medium text-destructive">{s5.error}</p>
              ) : null}
              {s5.ok ? (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Opgeslagen.</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-6">
                <Submit label="Offerte-template opslaan" />
              </div>
            </FormShell>
          </form>
        </TabsContent>

        <TabsContent value="branding" className="mt-8 outline-none">
          <form action={a4}>
            <FormShell className="space-y-8">
              <FormIntro title="Huisstijl">Logo en primaire kleur voor offertes en klantgerichte uitstraling.</FormIntro>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="white_label_logo_url" className="text-sm font-medium">
                    Logo-URL
                  </Label>
                  <p className="text-xs text-muted-foreground">Publieke HTTPS-URL naar je logo (PNG of SVG).</p>
                  <Input
                    id="white_label_logo_url"
                    name="white_label_logo_url"
                    type="url"
                    placeholder="https://…"
                    defaultValue={settings.white_label_logo_url || ""}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="white_label_primary" className="text-sm font-medium">
                    Primaire kleur
                  </Label>
                  <p className="text-xs text-muted-foreground">Hex-kleur, bijvoorbeeld #2563eb.</p>
                  <div className="flex flex-wrap items-stretch gap-3">
                    <Input
                      id="white_label_primary"
                      name="white_label_primary"
                      placeholder="#2563eb"
                      defaultValue={settings.white_label_primary || ""}
                      className="max-w-xs flex-1 rounded-lg font-mono text-sm"
                    />
                    <div
                      className="size-11 shrink-0 rounded-lg border border-border/60 shadow-inner-soft dark:border-white/[0.12]"
                      style={{ backgroundColor: primaryPreview }}
                      title="Voorbeeldkleur"
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
              {s4.error ? (
                <p className="text-sm font-medium text-destructive">{s4.error}</p>
              ) : null}
              {s4.ok ? (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Opgeslagen.</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-6">
                <Submit label="Huisstijl opslaan" />
              </div>
            </FormShell>
          </form>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-8 space-y-5 outline-none">
          <WhatsAppSettingsForm
            channel={settings.whatsapp_channel}
            auto_reply_enabled={settings.auto_reply_enabled}
            auto_reply_delay_seconds={settings.auto_reply_delay_seconds}
          />
          <div className="cf-dashboard-panel p-5 text-sm leading-relaxed text-muted-foreground sm:p-6">
            <p className="font-semibold text-foreground">Koppeling afronden bij je provider</p>
            <p className="mt-2">
              Twilio of Meta vraagt om een paar technische gegevens op hun scherm. Die staan bij hen in de handleiding —
              niet hier. Lukt het niet, mail ons support met je bedrijfsnaam.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-8 outline-none">
          <EmailChannelSettingsForm
            companyId={company.id}
            emailInboundEnabled={settings.email_inbound_enabled}
            hasContactEmail={Boolean(company.contact_email?.trim())}
            siteOrigin={siteOrigin}
          />
        </TabsContent>

        <TabsContent value="billing" className="mt-8 outline-none">
          <BillingSettings
            company={company}
            leadsThisMonth={leadsThisMonth}
            leadCap={leadCap}
          />
        </TabsContent>

        <TabsContent value="widget" className="mt-8 outline-none">
          {!websiteWidgetActive ? (
            <WidgetSubscriptionGate trialExpiredHint={trialExpiredHint} />
          ) : widgetEmbedToken ? (
            <WidgetSettings siteOrigin={siteOrigin} embedToken={widgetEmbedToken} />
          ) : (
            <div className="cf-dashboard-panel p-8 sm:p-10">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <Puzzle className="size-6" aria-hidden />
                </div>
                <div className="min-w-0 space-y-3">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">Websitechat is bijna beschikbaar</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Je account wordt nog voorzien van een persoonlijke chatcode. Vernieuw deze pagina over een paar
                    minuten. Werkt het dan nog niet? Neem contact op met support — vermeld je bedrijfsnaam.
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
