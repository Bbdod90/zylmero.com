import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Globe,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepStatus = "ok" | "partial" | "todo" | "demo";

function StatusDot({
  status,
  label,
}: {
  status: StepStatus;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          status === "ok" && "bg-emerald-500 shadow-[0_0_8px_-2px_hsl(142_76%_36%)]",
          status === "partial" &&
            "bg-amber-500 shadow-[0_0_8px_-2px_hsl(38_92%_50%)]",
          status === "todo" && "bg-muted-foreground/35",
          status === "demo" && "bg-primary shadow-[0_0_8px_-2px_hsl(var(--primary)/0.5)]",
        )}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}

export type AiKoppelcentrumProps = {
  demoMode: boolean;
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

function ChannelRow({
  href,
  icon,
  title,
  description,
  status,
  statusLabel,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  status: StepStatus;
  statusLabel: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 px-5 py-4 transition-colors",
        "hover:bg-muted/[0.45] dark:hover:bg-white/[0.04]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-muted/25 text-primary",
          "shadow-[0_8px_24px_-20px_rgb(0_0_0/0.35)] dark:border-white/[0.07] dark:bg-white/[0.04]",
          "transition-transform duration-200 group-hover:scale-[1.02]",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[0.95rem] font-semibold tracking-tight text-foreground">
            {title}
          </span>
          <StatusDot status={status} label={statusLabel} />
        </div>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{description}</p>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary/70"
        aria-hidden
      />
    </Link>
  );
}

export function AiKoppelcentrumView({
  demoMode,
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

  const ks: StepStatus = demoMode
    ? "demo"
    : knowledgeStatus === "ok"
      ? "ok"
      : knowledgeStatus === "partial"
        ? "partial"
        : "todo";
  const kLabel = demoMode
    ? "Demo"
    : knowledgeStatus === "ok"
      ? "Compleet"
      : knowledgeStatus === "partial"
        ? "Uitbreiden"
        : "Open";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {demoMode ? (
        <p className="text-center text-xs font-medium uppercase tracking-[0.12em] text-amber-800/90 dark:text-amber-200/85">
          Demomodus — koppelingen zijn ter illustratie
        </p>
      ) : null}

      {needsAiSetup ? (
        <p className="text-center text-sm text-muted-foreground">
          Nog niet klaar met de eerste setup?{" "}
          <Link
            href="/dashboard/ai-setup"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Afronden
          </Link>
        </p>
      ) : null}

      <div className="overflow-hidden rounded-[1.125rem] border border-border/50 bg-card/90 shadow-[0_32px_64px_-48px_rgb(0_0_0/0.35)] backdrop-blur-sm dark:border-white/[0.09] dark:bg-[hsl(228_22%_11%/0.88)] dark:shadow-[0_36px_80px_-52px_rgb(0_0_0/0.65)]">
        <div className="border-b border-border/45 px-5 py-4 dark:border-white/[0.06]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Kennis
                </span>
                <StatusDot status={ks} label={kLabel} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {knowledgeSummary}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="h-9 shrink-0 rounded-full px-5">
              <Link href="/dashboard/chatbot#kennis" className="gap-1.5 font-semibold">
                Bewerken
                <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        <div className="divide-y divide-border/40 dark:divide-white/[0.06]">
          <ChannelRow
            href="/dashboard/settings?tab=whatsapp"
            icon={<MessageCircle className="size-[1.15rem]" strokeWidth={2} aria-hidden />}
            title="WhatsApp"
            description={
              demoMode
                ? "Zo gaat zakelijk chat aan."
                : waStatus === "ok"
                  ? "Inkomende berichten in je inbox."
                  : waStatus === "partial"
                    ? "Rond WhatsApp af in Instellingen."
                    : "Koppel zakelijk WhatsApp."
            }
            status={waStatus}
            statusLabel={
              demoMode ? "Demo" : waStatus === "ok" ? "Actief" : waStatus === "partial" ? "Bijna" : "Te doen"
            }
          />

          <ChannelRow
            href="/dashboard/settings?tab=widget"
            icon={<Globe className="size-[1.15rem]" strokeWidth={2} aria-hidden />}
            title="Website"
            description={
              demoMode
                ? "Chat op je eigen site."
                : widgetLive
                  ? "Widget staat live."
                  : !websiteWidgetActive
                    ? "Plan nodig voor livegang."
                    : "Plak de snippet op je site."
            }
            status={widgetStatus}
            statusLabel={
              demoMode
                ? "Demo"
                : widgetLive
                  ? "Live"
                  : widgetStatus === "partial"
                    ? "Bijna"
                    : "Te doen"
            }
          />

          <ChannelRow
            href="/dashboard/settings?tab=email"
            icon={<Mail className="size-[1.15rem]" strokeWidth={2} aria-hidden />}
            title="E-mail"
            description={
              demoMode
                ? "Mail in één inbox."
                : mailStatus === "ok"
                  ? "Inkomend staat aan."
                  : mailStatus === "partial"
                    ? "Nog één stap in Instellingen."
                    : "Koppel je mailbox."
            }
            status={mailStatus}
            statusLabel={
              demoMode ? "Demo" : mailStatus === "ok" ? "Actief" : mailStatus === "partial" ? "Bijna" : "Te doen"
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/40 bg-muted/[0.2] px-4 py-3 dark:border-white/[0.06] dark:bg-black/[0.12]">
          <Button asChild variant="ghost" size="sm" className="h-9 rounded-full text-muted-foreground">
            <Link href="/dashboard/inbox">Naar inbox</Link>
          </Button>
          <Button asChild size="sm" className="h-9 rounded-full px-5 font-semibold">
            <Link href="/dashboard/settings">Instellingen</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
