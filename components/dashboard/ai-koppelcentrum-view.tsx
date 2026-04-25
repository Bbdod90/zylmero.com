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

/** Compacte kaarten — minder hoogte dan de standaard Card-padding (p-7). */
const stepCardHeader = "space-y-2 p-4 pb-2 sm:p-5 sm:space-y-2";
const stepCardContent = "space-y-2 p-4 pt-0 sm:p-5";
const stepDesc = "text-xs leading-snug text-muted-foreground sm:text-[0.8125rem] sm:leading-snug";

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
    <div className="space-y-6 sm:space-y-7">
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div
          className="pointer-events-none absolute -inset-x-4 -top-1 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent sm:-inset-x-6 dark:via-primary/35"
          aria-hidden
        />
        <p className="max-w-xl text-[13px] leading-relaxed tracking-[-0.01em] text-muted-foreground">
          <span className="font-semibold text-foreground/90">Volgorde:</span> eerst kennis, daarna
          WhatsApp, widget en e-mail. Inkomend werk vind je altijd onder{" "}
          <Link
            href="/dashboard/inbox"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-2 transition hover:decoration-primary"
          >
            Berichten
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-border/70 bg-background/80 px-4 text-xs font-semibold shadow-sm backdrop-blur-sm transition hover:border-primary/30 hover:bg-muted/40 dark:border-white/[0.12] dark:bg-white/[0.04] dark:hover:border-primary/35"
          >
            <Link href="/dashboard/inbox">
              <Inbox className="size-3.5 opacity-80" aria-hidden />
              Berichten
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-9 rounded-full bg-gradient-to-r from-primary to-primary/88 px-4 text-xs font-semibold text-primary-foreground shadow-[0_1px_0_0_hsl(0_0%_0%/0.08)] dark:shadow-[0_1px_0_0_hsl(0_0%_0%/0.25)]"
          >
            <Link href="/dashboard/settings">
              <Settings2 className="size-3.5 opacity-90" aria-hidden />
              Instellingen
            </Link>
          </Button>
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
          <CardHeader className="flex flex-col gap-3 p-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:pb-2">
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

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <Card id="kennis" className="cf-dashboard-panel scroll-mt-24 border-border/70 shadow-sm dark:border-white/[0.08]">
          <CardHeader className={stepCardHeader}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-primary">
                <Brain className="size-[1.125rem] shrink-0 sm:size-5" />
                <CardTitle className="text-base sm:text-lg">1 · AI trainen</CardTitle>
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
            <CardDescription className={stepDesc}>{knowledgeSummary}</CardDescription>
          </CardHeader>
          <CardContent className={cn(stepCardContent, "flex flex-wrap gap-2")}>
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
          <CardHeader className={stepCardHeader}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-primary">
                <MessageCircle className="size-[1.125rem] shrink-0 sm:size-5" />
                <CardTitle className="text-base sm:text-lg">2 · WhatsApp</CardTitle>
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
            <CardDescription className={stepDesc}>
              Twilio of Meta, webhook op onderstaande URL,{" "}
              <strong className="font-medium text-foreground">AI auto-antwoord</strong> aan. Header{" "}
              <code className="rounded bg-muted px-1 text-[0.65rem] sm:text-xs">x-webhook-secret</code>{" "}
              uit je omgeving.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn(stepCardContent, "space-y-2")}>
            <div className="rounded-lg border border-border/60 bg-background/70 px-2.5 py-1.5 font-mono text-[0.65rem] leading-snug text-muted-foreground break-all dark:bg-white/[0.03] sm:px-3 sm:text-xs">
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
          <CardHeader className={stepCardHeader}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-primary">
                <Globe className="size-[1.125rem] shrink-0 sm:size-5" />
                <CardTitle className="text-base sm:text-lg">3 · Website-widget</CardTitle>
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
            <CardDescription className={stepDesc}>
              Script op je site → berichten in{" "}
              <strong className="font-medium text-foreground">Berichten</strong>. Vereist actief proef-
              of betaalabonnement.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn(stepCardContent, "space-y-2")}>
            {!demoMode && !websiteWidgetActive ? (
              <p className="rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2 text-xs leading-snug text-amber-950 dark:text-amber-100">
                <strong className="font-semibold">Widget uit</strong> zonder abonnement.{" "}
                <Link href="/dashboard/upgrade" className="font-semibold underline underline-offset-2">
                  Plannen
                </Link>
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
          <CardHeader className={stepCardHeader}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="size-[1.125rem] shrink-0 sm:size-5" />
                <CardTitle className="text-base sm:text-lg">4 · E-mail & aanvragen</CardTitle>
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
            <CardDescription className={stepDesc}>
              Mailprovider → JSON naar webhook hieronder.{" "}
              <strong className="font-medium text-foreground">Contactmail</strong> onder Bedrijf. Alles
              landt in <strong className="font-medium text-foreground">Berichten</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn(stepCardContent, "space-y-2")}>
            <div className="rounded-lg border border-border/60 bg-background/70 px-2.5 py-1.5 font-mono text-[0.65rem] leading-snug text-muted-foreground break-all dark:bg-white/[0.03] sm:px-3 sm:text-xs">
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
    </div>
  );
}
