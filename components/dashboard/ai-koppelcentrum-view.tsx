import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  CircleDashed,
  Globe,
  Inbox,
  Mail,
  MessageCircle,
  Puzzle,
  Settings2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StepStatus = "ok" | "partial" | "todo" | "demo";

function StatusBadge({ status, label }: { status: StepStatus; label: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "shrink-0 font-semibold",
        status === "ok" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        status === "partial" && "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
        status === "todo" && "border-border bg-muted/50 text-muted-foreground",
        status === "demo" && "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      {status === "ok" ? <CheckCircle2 className="mr-1 size-3.5" /> : null}
      {status === "partial" ? <CircleDashed className="mr-1 size-3.5" /> : null}
      {label}
    </Badge>
  );
}

export type AiKoppelcentrumProps = {
  demoMode: boolean;
  siteOrigin: string;
  /** Eerste AI-setup (diensten/FAQ genereren) nog niet gedaan */
  needsAiSetup: boolean;
  /** Website-URL + kennistekst */
  knowledgeStatus: StepStatus;
  knowledgeSummary: string;
  /** WhatsApp-kanaal */
  whatsappConnected: boolean;
  whatsappAutoReply: boolean;
  whatsappProvider: string;
  /** Widget op eigen site */
  hasWidgetToken: boolean;
  /** Live leads via widget alleen bij actief abonnement / proef */
  websiteWidgetActive: boolean;
  /** Contactmail bij bedrijf */
  hasContactEmail: boolean;
  /** E-mail inbound-webhook aan in automation_preferences */
  emailInboundEnabled: boolean;
};

export function AiKoppelcentrumView({
  demoMode,
  siteOrigin,
  needsAiSetup,
  knowledgeStatus,
  knowledgeSummary,
  whatsappConnected,
  whatsappAutoReply,
  whatsappProvider,
  hasWidgetToken,
  websiteWidgetActive,
  hasContactEmail,
  emailInboundEnabled,
}: AiKoppelcentrumProps) {
  const base = siteOrigin.replace(/\/$/, "");
  const webhookUrl = `${base}/api/webhooks/whatsapp`;
  const emailWebhookUrl = `${base}/api/webhooks/inbound-email`;

  const waStatus: StepStatus = demoMode
    ? "demo"
    : whatsappConnected && whatsappAutoReply
      ? "ok"
      : whatsappConnected || whatsappAutoReply
        ? "partial"
        : "todo";

  const widgetStatus: StepStatus = demoMode
    ? "demo"
    : !websiteWidgetActive
      ? "partial"
      : hasWidgetToken
        ? "ok"
        : "todo";

  const mailStatus: StepStatus = demoMode
    ? "demo"
    : emailInboundEnabled && hasContactEmail
      ? "ok"
      : emailInboundEnabled || hasContactEmail
        ? "partial"
        : "todo";

  return (
    <div className="space-y-8">
      <div className="cf-dashboard-panel border-primary/20 bg-gradient-to-br from-primary/[0.14] via-background to-background p-6 shadow-sm dark:border-primary/30 dark:from-primary/[0.2] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Alles op één plek
            </p>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Train je AI en sluit kanalen aan
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Hier zie je in één oogopslag wat al klaarstaat. Begin met kennis (website + tekst), zet
              daarna WhatsApp en je site-widget aan voor snelle antwoorden. E-mail en aanvragen landen in{" "}
              <strong className="font-medium text-foreground">Berichten</strong>: zet inbound aan
              (webhook) en vul je contactmail in — dezelfde{" "}
              <strong className="font-medium text-foreground">AI auto-antwoord</strong> als bij
              WhatsApp kun je onder WhatsApp inschakelen.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <Button asChild variant="default" className="rounded-xl shadow-sm">
              <Link href="/dashboard/inbox">
                <Inbox className="mr-2 size-4" />
                Naar berichten
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-border/60 bg-background/70 dark:border-white/[0.1] dark:bg-white/[0.03]">
              <Link href="/dashboard/settings">
                <Settings2 className="mr-2 size-4" />
                Alle instellingen
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {demoMode ? (
        <p className="rounded-xl border border-amber-500/25 bg-gradient-to-r from-amber-500/[0.15] to-amber-500/[0.06] px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          <strong className="font-semibold">Demo:</strong> koppelingen zijn gesimuleerd. Met een echt
          account stel je hier je eigen kanalen in.
        </p>
      ) : null}

      {needsAiSetup ? (
        <Card className="rounded-2xl border-primary/25 bg-primary/[0.04] dark:border-primary/30">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Eerste AI-profiel afronden</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Laat {` `}
                  <span className="font-medium text-foreground">diensten, FAQ en automatiseringen</span>
                  {` `}
                  genereren op basis van je branche — daarna verfijn je hieronder de details.
                </CardDescription>
              </div>
            </div>
            <Button asChild className="w-full shrink-0 rounded-xl sm:w-auto">
              <Link href="/dashboard/ai-setup">
                Naar AI-setup
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Card id="kennis" className="cf-dashboard-panel scroll-mt-24 border-border/70 shadow-sm dark:border-white/[0.08]">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Brain className="size-5 shrink-0" />
                <CardTitle className="text-lg">1 · AI trainen</CardTitle>
              </div>
              <StatusBadge
                status={knowledgeStatus}
                label={
                  knowledgeStatus === "ok"
                    ? "Kennis ingevuld"
                    : knowledgeStatus === "partial"
                      ? "Deels ingevuld"
                      : "Nog starten"
                }
              />
            </div>
            <CardDescription className="text-sm leading-relaxed">
              {knowledgeSummary}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-xl">
              <Link href="/dashboard/ai-knowledge">
                Website & tekst bewerken
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/dashboard/ai">Stem & stijl</Link>
            </Button>
          </CardContent>
        </Card>

        <Card id="whatsapp" className="cf-dashboard-panel scroll-mt-24 border-border/70 shadow-sm dark:border-white/[0.08]">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-primary">
                <MessageCircle className="size-5 shrink-0" />
                <CardTitle className="text-lg">2 · WhatsApp</CardTitle>
              </div>
              <StatusBadge
                status={waStatus}
                label={
                  demoMode
                    ? "Demo"
                    : waStatus === "ok"
                      ? "AI + kanaal"
                      : waStatus === "partial"
                        ? "Deels ingesteld"
                        : "Nog koppelen"
                }
              />
            </div>
            <CardDescription className="text-sm leading-relaxed">
              Kies provider (Twilio of Meta), zet inkomende webhooks op onderstaande URL en schakel{" "}
              <strong className="font-medium text-foreground">AI auto-antwoord</strong> in voor
              snelle conceptantwoorden. Gebruik header{" "}
              <code className="rounded bg-muted px-1 text-xs">x-webhook-secret</code> met je geheim
              uit de server-omgeving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-2 font-mono text-[0.7rem] leading-relaxed text-muted-foreground break-all dark:bg-white/[0.03] sm:text-xs">
              POST {webhookUrl}
            </div>
            <p className="text-2xs text-muted-foreground">
              Provider nu: <span className="font-medium text-foreground">{whatsappProvider}</span>
              {whatsappConnected ? " · gemarkeerd als verbonden" : ""}
              {whatsappAutoReply ? " · AI-antwoord aan" : ""}
            </p>
            <Button asChild size="sm" className="rounded-xl">
              <Link href="/dashboard/settings?tab=whatsapp">
                WhatsApp instellen
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card id="widget" className="cf-dashboard-panel scroll-mt-24 border-border/70 shadow-sm dark:border-white/[0.08]">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Globe className="size-5 shrink-0" />
                <CardTitle className="text-lg">3 · Website-widget</CardTitle>
              </div>
              <StatusBadge
                status={widgetStatus}
                label={
                  demoMode
                    ? "Demo"
                    : !websiteWidgetActive
                      ? "Abonnement nodig"
                      : hasWidgetToken
                        ? "Embed beschikbaar"
                        : "Token nodig"
                }
              />
            </div>
            <CardDescription className="text-sm leading-relaxed">
              Plak het script op je eigen site zodat bezoekers een bericht sturen — alles komt binnen
              bij <strong className="font-medium text-foreground">Berichten</strong> en kan met AI
              worden opgepakt. Werkt alleen als je proef- of betaalabonnement actief is.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!demoMode && !websiteWidgetActive ? (
              <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
                <strong className="font-semibold">De website-widget staat uit</strong> zolang er geen actief
                abonnement is — bezoekers zien het formulier niet verwerkt. Activeer onder{" "}
                <Link href="/dashboard/upgrade" className="font-semibold underline underline-offset-2">
                  Plannen
                </Link>
                .
              </p>
            ) : null}
            <Button asChild size="sm" className="rounded-xl">
              <Link href="/dashboard/settings?tab=widget">
                Widget-code & instructies
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card id="email" className="cf-dashboard-panel scroll-mt-24 border-border/70 shadow-sm dark:border-white/[0.08]">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="size-5 shrink-0" />
                <CardTitle className="text-lg">4 · E-mail & aanvragen</CardTitle>
              </div>
              <StatusBadge
                status={mailStatus}
                label={
                  demoMode
                    ? "Demo"
                    : mailStatus === "ok"
                      ? "Webhook + contactmail"
                      : mailStatus === "partial"
                        ? "Nog afronden"
                        : "Nog instellen"
                }
              />
            </div>
            <CardDescription className="text-sm leading-relaxed">
              Koppel je mailprovider (Mailgun inbound, Cloudflare e-mail, Zapier, n8n, …) zodat die
              JSON naar het webhook-endpoint voor inkomende e-mail stuurt (zie hieronder). Zet
              daarnaast je{" "}
              <strong className="font-medium text-foreground">contactmail</strong> onder Bedrijf —
              die gebruikt de AI waar nodig. Leads via widget en kanalen komen ook in{" "}
              <strong className="font-medium text-foreground">Berichten</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-2 font-mono text-[0.7rem] leading-relaxed text-muted-foreground break-all dark:bg-white/[0.03] sm:text-xs">
              POST {emailWebhookUrl}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="rounded-xl">
                <Link href="/dashboard/settings?tab=email">
                  E-mail inbound instellen
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href="/dashboard/settings?tab=business">Contactmail & bedrijf</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href="/dashboard/inbox">Inbox openen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="cf-dashboard-panel border-dashed border-border/80 bg-muted/10 dark:border-white/[0.1]">
        <CardHeader>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Puzzle className="size-4" />
            <CardTitle className="text-base font-semibold">Meer</CardTitle>
          </div>
          <CardDescription>
            Automatiseringen en facturatie blijven bereikbaar via het menu.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm" className="rounded-xl">
            <Link href="/dashboard/automations">Automatiseringen</Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="rounded-xl">
            <Link href="/dashboard/settings?tab=billing">Facturatie</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
