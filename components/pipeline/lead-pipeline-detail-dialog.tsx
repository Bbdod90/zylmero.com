"use client";

import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { Lead, LeadStatus } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LeadStatusMenu } from "@/components/leads/lead-status-menu";
import { AiTagBadges } from "@/components/leads/ai-tag-badges";
import { ExternalLink, Mail, Phone, User } from "lucide-react";

function DetailField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "d MMM yyyy, HH:mm", { locale: nl });
}

export function LeadPipelineDetailDialog({
  lead,
  open,
  onOpenChange,
  demoMode,
  onDemoStatusChange,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demoMode: boolean;
  onDemoStatusChange?: (next: LeadStatus) => void;
}) {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,760px)] overflow-y-auto rounded-2xl p-5 sm:max-w-[460px]">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="flex items-start gap-2 text-lg leading-snug">
            <User className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <span className="break-words">{lead.full_name}</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground">Klant in de pipeline</p>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm" className="rounded-lg font-semibold" asChild>
              <Link href={`/dashboard/leads/${lead.id}`}>
                Volledige werkruimte
                <ExternalLink className="ml-1.5 size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/10 px-3 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <LeadStatusMenu
                leadId={lead.id}
                status={lead.status}
                demoMode={demoMode}
                stopPropagation
                onDemoStatusChange={onDemoStatusChange}
              />
            </div>
          </div>

          <Separator className="bg-border/60 dark:bg-white/[0.08]" />

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailField label="E-mail">
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  <Mail className="size-3.5 shrink-0 opacity-70" aria-hidden />
                  {lead.email}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailField>
            <DetailField label="Telefoon">
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  <Phone className="size-3.5 shrink-0 opacity-70" aria-hidden />
                  {lead.phone}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Bron">
              {lead.source ? (
                <span>{lead.source}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailField>
            <DetailField label="Score">
              {lead.score != null ? (
                <span className="tabular-nums font-semibold">{lead.score}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailField>
          </div>

          <DetailField label="Geschatte waarde">
            {lead.estimated_value != null ? (
              <span className="text-base font-bold tabular-nums text-primary">
                {formatCurrency(lead.estimated_value)}
              </span>
            ) : (
              <span className="text-muted-foreground">Niet ingevuld</span>
            )}
          </DetailField>

          {lead.ai_tags && lead.ai_tags.length > 0 ? (
            <DetailField label="AI-tags">
              <AiTagBadges tags={lead.ai_tags} size="sm" />
            </DetailField>
          ) : null}

          {lead.summary ? (
            <DetailField label="Samenvatting">
              <p className="whitespace-pre-wrap text-muted-foreground">{lead.summary}</p>
            </DetailField>
          ) : null}

          {lead.intent ? (
            <DetailField label="Intentie">
              <p className="whitespace-pre-wrap text-muted-foreground">{lead.intent}</p>
            </DetailField>
          ) : null}

          {lead.suggested_next_action ? (
            <DetailField label="Voorgestelde vervolgstap">
              <p className="whitespace-pre-wrap text-muted-foreground">
                {lead.suggested_next_action}
              </p>
            </DetailField>
          ) : null}

          {lead.status_recommendation ? (
            <DetailField label="Statusadvies">
              <p className="whitespace-pre-wrap text-muted-foreground">
                {lead.status_recommendation}
              </p>
            </DetailField>
          ) : null}

          {lead.notes ? (
            <DetailField label="Notities">
              <p className="whitespace-pre-wrap text-muted-foreground">{lead.notes}</p>
            </DetailField>
          ) : null}

          <Separator className="bg-border/60 dark:bg-white/[0.08]" />

          <div className="grid gap-2 text-xs text-muted-foreground">
            <p>Laatste bericht: {formatWhen(lead.last_message_at)}</p>
            <p>Aangemaakt: {formatWhen(lead.created_at)}</p>
            <p>Bijgewerkt: {formatWhen(lead.updated_at)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
