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
import { OnboardingStepsStrip } from "@/components/dashboard/onboarding-steps-strip";
import type { OnboardingStepUi } from "@/lib/dashboard/readiness";

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

const cardLift =
  "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:scale-[0.99]";

export type AiKoppelcentrumProps = {
  demoMode: boolean;
  onboarding: {
    ai: OnboardingStepUi;
    channel: OnboardingStepUi;
    live: OnboardingStepUi;
  };
  needsAiSetup: boolean;
  knowledgeStatus: StepStatus;
  knowledgeSummary: string;
  whatsappConnected: boolean;
  whatsappAutoReply: boolean;
  hasWidgetToken: boolean;
  websiteWidgetActive: boolean;
  hasContactEmail: boolean;
  emailInboundEnabled: boolean;
};

export function AiKoppelcentrumView({
  demoMode,
  onboarding,
  needsAiSetup,
  knowledgeStatus,
  knowledgeSummary,
  whatsappConnected,
  whatsappAutoReply,
  hasWidgetToken,
  websiteWidgetActive,
  hasContactEmail,
  emailInboundEnabled,
}: AiKoppelcentrumProps) {
  const waStatus: StepStatus = demoMode
    ? "demo"
    : whatsappConnected && whatsappAutoReply
      ? "ok"
      : whatsappConnected || whatsappAutoReply
        ? "partial"
        : "todo";

  const widgetLive = websiteWidgetActive && hasWidgetToken;
  const widgetStatus: StepStatus = demoMode
    ? "demo"
    : widgetLive
      ? "ok"
      : hasWidgetToken || websiteWidgetActive
        ? "partial"
        : "todo";

  const mailStatus: StepStatus = demoMode
    ? "demo"
    : emailInboundEnabled && hasContactEmail
      ? "ok"
      : emailInboundEnabled || hasContactEmail
        ? "partial"
        : "todo";

  const assistantFeelsReady =
    !needsAiSetup && (knowledgeStatus === "ok" || knowledgeStatus === "partial");

  return (
    <div className="space-y-8 sm:space-y-10">
      <OnboardingStepsStrip onboarding={onboarding} />

      {demoMode ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          <strong className="font-semibold">Demo:</strong> zo ziet het scherm eruit. Met je eigen account koppel je
          echte kanalen.
        </p>
      ) : null}

      {needsAiSetup ? (
        <Card className={cn("rounded-2xl border-primary/25 bg-primary/[0.04] shadow-sm dark:border-primary/30", cardLift)}>
          <CardHeader className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Eerste keer: assistent laten meedenken</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Vul in een paar minuten je diensten en veelgestelde vragen in — daarna kan je meteen antwoorden
                  laten sturen.
                </CardDescription>
              </div>
            </div>
            <Button asChild className="w-full shrink-0 rounded-xl sm:w-auto">
              <Link href="/dashboard/ai-setup">
                Starten
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className={cn("cf-dashboard-panel rounded-2xl border-border/70 shadow-sm dark:border-white/[0.08]", cardLift)}>
          <CardHeader className="space-y-3 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Brain className="size-5 shrink-0" />
                <CardTitle className="text-lg sm:text-xl">Je assistent is klaar</CardTitle>
              </div>
              <StatusBadge
                status={knowledgeStatus === "ok" ? "ok" : knowledgeStatus === "partial" ? "partial" : "todo"}
                label={
                  demoMode
                    ? "Demo"
                    : knowledgeStatus === "ok"
                      ? "Kennis compleet"
                      : knowledgeStatus === "partial"
                        ? "Nog aanvullen"
                        : "Start hier"
                }
              />
            </div>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">{knowledgeSummary}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
            <Button asChild size="sm" className="rounded-xl shadow-sm">
              <Link href="/dashboard/ai-knowledge">
                Kennis bewerken
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/dashboard/ai">Toon & antwoorden</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className={cn("cf-dashboard-panel rounded-2xl border-border/70 shadow-sm dark:border-white/[0.08]", cardLift)}>
          <CardHeader className="space-y-2 p-5 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Kies waar klanten je bereiken</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              Koppel minstens één kanaal. Alles komt bij elkaar onder Berichten — nergens technisch gedoe.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
            <Button
              asChild
              variant="outline"
              className="h-auto justify-between rounded-xl border-border/70 py-4 text-left shadow-sm hover:bg-muted/40"
            >
              <Link href="/dashboard/settings?tab=whatsapp" className="flex w-full items-center gap-3">
                <MessageCircle className="size-5 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">WhatsApp</span>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    {demoMode
                      ? "Demo"
                      : waStatus === "ok"
                        ? "Gekoppeld met automatische antwoorden"
                        : waStatus === "partial"
                          ? "Nog afronden in Instellingen"
                          : "Nog niet gekoppeld"}
                  </span>
                </span>
                <StatusBadge
                  status={waStatus}
                  label={demoMode ? "Demo" : waStatus === "ok" ? "Actief" : waStatus === "partial" ? "Deels" : "Open"}
                />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto justify-between rounded-xl border-border/70 py-4 text-left shadow-sm hover:bg-muted/40"
            >
              <Link href="/dashboard/settings?tab=widget" className="flex w-full items-center gap-3">
                <Globe className="size-5 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">Websitechat</span>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    {demoMode
                      ? "Demo"
                      : widgetLive
                        ? "Staat op je site"
                        : !websiteWidgetActive
                          ? "Plan nodig om live te gaan"
                          : "Code nog niet geplaatst"}
                  </span>
                </span>
                <StatusBadge
                  status={widgetStatus}
                  label={
                    demoMode ? "Demo" : widgetLive ? "Actief" : widgetStatus === "partial" ? "Deels" : "Open"
                  }
                />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto justify-between rounded-xl border-border/70 py-4 text-left shadow-sm hover:bg-muted/40"
            >
              <Link href="/dashboard/settings?tab=email" className="flex w-full items-center gap-3">
                <Mail className="size-5 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">E-mail</span>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    {demoMode
                      ? "Demo"
                      : mailStatus === "ok"
                        ? "Inkomend staat aan"
                        : mailStatus === "partial"
                          ? "Nog een instelling open"
                          : "Nog niet gekoppeld"}
                  </span>
                </span>
                <StatusBadge
                  status={mailStatus}
                  label={
                    demoMode ? "Demo" : mailStatus === "ok" ? "Actief" : mailStatus === "partial" ? "Deels" : "Open"
                  }
                />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
        <p className="text-sm text-muted-foreground">
          {assistantFeelsReady
            ? "Je bent goed bezig — test een gesprek vanaf je site of stuur jezelf een WhatsApp."
            : "Rond eerst kennis en één kanaal af — dan mis je geen aanvraag."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full border-border/70 shadow-sm"
          >
            <Link href="/dashboard/inbox">
              <Inbox className="size-3.5 opacity-80" aria-hidden />
              Berichten
            </Link>
          </Button>
          <Button asChild size="sm" className="rounded-full shadow-sm">
            <Link href="/dashboard/settings">
              <Settings2 className="size-3.5 opacity-90" aria-hidden />
              Instellingen
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
