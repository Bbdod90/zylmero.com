"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateBusinessProfileAction,
  updateKnowledgeAction,
  updateWhiteLabelAction,
  type SettingsFormState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppSettingsForm } from "@/components/settings/whatsapp-settings-form";
import { BillingSettings } from "@/components/settings/billing-settings";
import { WidgetSettings } from "@/components/settings/widget-settings";
import type { Company, WhatsAppChannelSettings } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-xl">
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
  "billing",
  "widget",
]);

export function SettingsTabs({
  company,
  settings,
  leadsThisMonth,
  leadCap,
  siteOrigin,
  widgetEmbedToken,
  defaultTab = "business",
}: {
  company: Company;
  widgetEmbedToken: string | null;
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
    knowledge_snippets: { title: string; body: string }[];
    white_label_logo_url: string | null;
    white_label_primary: string | null;
  };
  leadsThisMonth: number;
  leadCap: number;
  siteOrigin: string;
  defaultTab?: string;
}) {
  const [s1, a1] = useFormState(updateBusinessProfileAction, initial);
  const [s2, a2] = useFormState(updateKnowledgeAction, initial);
  const [s4, a4] = useFormState(updateWhiteLabelAction, initial);

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

  const tab =
    defaultTab && VALID_TABS.has(defaultTab) ? defaultTab : "business";

  return (
    <Tabs defaultValue={tab} className="w-full">
      <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-2xl border border-border/50 bg-muted/35 p-1.5 shadow-inner-soft dark:border-white/[0.08] dark:bg-white/[0.04]">
        <TabsTrigger
          value="business"
          className="rounded-xl px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-primary/20 dark:data-[state=active]:bg-card dark:data-[state=active]:ring-primary/25"
        >
          Bedrijf
        </TabsTrigger>
        <TabsTrigger
          value="knowledge"
          className="rounded-xl px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-primary/20 dark:data-[state=active]:bg-card dark:data-[state=active]:ring-primary/25"
        >
          Kennis
        </TabsTrigger>
        <TabsTrigger
          value="branding"
          className="rounded-xl px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-primary/20 dark:data-[state=active]:bg-card dark:data-[state=active]:ring-primary/25"
        >
          Huisstijl
        </TabsTrigger>
        <TabsTrigger
          value="whatsapp"
          className="rounded-xl px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-primary/20 dark:data-[state=active]:bg-card dark:data-[state=active]:ring-primary/25"
        >
          WhatsApp
        </TabsTrigger>
        <TabsTrigger
          value="billing"
          className="rounded-xl px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-primary/20 dark:data-[state=active]:bg-card dark:data-[state=active]:ring-primary/25"
        >
          Facturatie
        </TabsTrigger>
        <TabsTrigger
          value="widget"
          className="rounded-xl px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-primary/20 dark:data-[state=active]:bg-card dark:data-[state=active]:ring-primary/25"
        >
          Widget
        </TabsTrigger>
      </TabsList>
      <TabsContent value="business" className="mt-6 space-y-6">
        <form action={a1} className="cf-dashboard-panel space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="company_name">Bedrijfsnaam</Label>
            <Input
              id="company_name"
              name="company_name"
              defaultValue={company.name}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact e-mail</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={company.contact_email || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contacttelefoon</Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                defaultValue={company.contact_phone || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Niche / specialisme</Label>
            <Input id="niche" name="niche" defaultValue={settings.niche || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="services">Diensten (één per regel)</Label>
            <Textarea
              id="services"
              name="services"
              className="min-h-[120px] rounded-xl"
              defaultValue={settings.services?.join("\n") || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking_link">Boekingslink</Label>
            <Input
              id="booking_link"
              name="booking_link"
              type="url"
              defaultValue={settings.booking_link || ""}
            />
          </div>
          {s1.error ? (
            <p className="text-sm text-destructive">{s1.error}</p>
          ) : null}
          {s1.ok ? <p className="text-sm text-primary">Opgeslagen.</p> : null}
          <Submit label="Profiel opslaan" />
        </form>
      </TabsContent>
      <TabsContent value="knowledge" className="mt-6">
        <form action={a2} className="cf-dashboard-panel space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="pricing_hints">Prijshints</Label>
            <Textarea
              id="pricing_hints"
              name="pricing_hints"
              className="min-h-[100px] rounded-xl"
              defaultValue={settings.pricing_hints || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faq">FAQ (V || A-blokken, lege regel ertussen)</Label>
            <Textarea
              id="faq"
              name="faq"
              className="min-h-[140px] rounded-xl"
              defaultValue={faqText}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_hours">Openingstijden</Label>
            <Textarea
              id="business_hours"
              name="business_hours"
              className="min-h-[80px] rounded-xl"
              defaultValue={hoursText}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="knowledge_snippets">
              Extra kennis voor AI (titel || tekst, lege regel tussen items)
            </Label>
            <Textarea
              id="knowledge_snippets"
              name="knowledge_snippets"
              className="min-h-[120px] rounded-xl"
              defaultValue={snippetsText}
              placeholder={`Levertijden || 2–3 werkdagen\n\nGarantie || 12 maanden op montage`}
            />
          </div>
          {s2.error ? (
            <p className="text-sm text-destructive">{s2.error}</p>
          ) : null}
          {s2.ok ? <p className="text-sm text-primary">Opgeslagen.</p> : null}
          <Submit label="Kennis opslaan" />
        </form>
      </TabsContent>
      <TabsContent value="branding" className="mt-6">
        <form action={a4} className="cf-dashboard-panel space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="white_label_logo_url">Logo-URL (https)</Label>
            <Input
              id="white_label_logo_url"
              name="white_label_logo_url"
              type="url"
              placeholder="https://…"
              defaultValue={settings.white_label_logo_url || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="white_label_primary">Primaire kleur (hex)</Label>
            <Input
              id="white_label_primary"
              name="white_label_primary"
              placeholder="#2563eb"
              defaultValue={settings.white_label_primary || ""}
            />
          </div>
          {s4.error ? (
            <p className="text-sm text-destructive">{s4.error}</p>
          ) : null}
          {s4.ok ? <p className="text-sm text-primary">Opgeslagen.</p> : null}
          <Submit label="Huisstijl opslaan" />
        </form>
      </TabsContent>
      <TabsContent value="whatsapp" className="mt-6 space-y-4">
        <WhatsAppSettingsForm
          channel={settings.whatsapp_channel}
          auto_reply_enabled={settings.auto_reply_enabled}
          auto_reply_delay_seconds={settings.auto_reply_delay_seconds}
        />
        <div className="glass-bubble rounded-2xl border border-dashed border-border/70 p-5 text-xs text-muted-foreground dark:border-white/[0.1]">
          <p className="font-semibold text-foreground">Webhook-endpoint</p>
          <p className="mt-1 break-all">
            POST {siteOrigin}/api/webhooks/whatsapp
          </p>
          <p className="mt-2">
            Stuur header <code className="rounded bg-muted px-1">x-whatsapp-signature</code>{" "}
            of <code className="rounded bg-muted px-1">Authorization: Bearer</code> met{" "}
            <code className="rounded bg-muted px-1">WHATSAPP_WEBHOOK_SECRET</code>. JSON-body:{" "}
            <code className="rounded bg-muted px-1">company_id</code>,{" "}
            <code className="rounded bg-muted px-1">from</code>,{" "}
            <code className="rounded bg-muted px-1">body</code>.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="billing" className="mt-6">
        <BillingSettings
          company={company}
          leadsThisMonth={leadsThisMonth}
          leadCap={leadCap}
        />
      </TabsContent>
      <TabsContent value="widget" className="mt-6">
        {widgetEmbedToken ? (
          <WidgetSettings siteOrigin={siteOrigin} embedToken={widgetEmbedToken} />
        ) : (
          <div className="cf-dashboard-panel rounded-2xl p-8 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Widget-token ontbreekt. Voer de database-migratie uit en herlaad deze pagina.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
