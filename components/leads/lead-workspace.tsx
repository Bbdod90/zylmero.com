"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { LeadDetailPayload } from "@/lib/queries/lead-detail";
import type { Lead, LeadStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeadStatusMenu } from "@/components/leads/lead-status-menu";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import {
  advanceLeadStageLinearAction,
  generateLeadReply,
  generateQuoteDraft,
  generateSmartFollowUp,
  moveLeadToSuggestedStage,
  summarizeLeadConversation,
} from "@/actions/ai";
import { refreshLeadAiTags } from "@/actions/ai-tags";
import {
  updateLeadCustomFields,
  updateLeadNotes,
  updateLeadProfile,
} from "@/actions/leads";
import {
  convertLeadToAppointment,
  generateQuoteDraftAndSend,
  markLeadWon,
} from "@/actions/quick-actions";
import { buildConversionInsight } from "@/lib/sales/insights";
import { describeFollowUpRisk } from "@/lib/sales/followup-risk";

import { appointmentStatusNl, quoteStatusNl } from "@/lib/i18n/nl-labels";
import {
  computeDisplayScore,
  isHighValueLead,
  leadTemperature,
} from "@/lib/sales/scoring";
import { ConversionInsightPanel } from "@/components/sales/conversion-insight-panel";
import { TemperatureBadge } from "@/components/sales/temperature-badge";
import { HighValueBadge } from "@/components/sales/high-value-badge";
import { AiTagBadges } from "@/components/leads/ai-tag-badges";
import {
  Bot,
  Calendar,
  ClipboardCopy,
  Loader2,
  MessageSquare,
  Phone,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

function waHref(phone: string | null) {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  if (!d) return null;
  return `https://wa.me/${d}`;
}

function serializeCustomFields(cf: Record<string, string> | undefined): string {
  return Object.entries(cf || {})
    .map(([k, v]) => `${k} || ${v}`)
    .join("\n");
}

function parseCustomFieldLines(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const i = t.indexOf("||");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 2).trim();
    if (k) out[k] = v;
  }
  return out;
}

export function LeadWorkspace({
  initial,
  staleReply = false,
  demoMode = false,
}: {
  initial: LeadDetailPayload;
  staleReply?: boolean;
  demoMode?: boolean;
}) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead>(initial.lead);
  const [reply, setReply] = useState("");
  const [smartFollowUp, setSmartFollowUp] = useState("");
  const [pending, start] = useTransition();

  const messages = initial.messages;

  useEffect(() => {
    setLead(initial.lead);
  }, [initial.lead]);

  const displayScore = useMemo(
    () => computeDisplayScore(lead, { staleReply }),
    [lead, staleReply],
  );
  const temp = useMemo(
    () => leadTemperature(lead, displayScore),
    [lead, displayScore],
  );
  const insight = useMemo(
    () => buildConversionInsight(lead, { staleReply }),
    [lead, staleReply],
  );
  const risk = useMemo(
    () =>
      describeFollowUpRisk(lead, messages, initial.quotes, {
        staleReply,
      }),
    [lead, messages, initial.quotes, staleReply],
  );
  const highValue = isHighValueLead(lead, displayScore);

  return (
    <div className="space-y-10">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-primary/[0.1] to-transparent px-5 py-4 text-sm font-medium leading-snug">
          Deze lead is{" "}
          <span className="font-semibold text-foreground">
            {lead.estimated_value != null
              ? `${formatCurrency(lead.estimated_value)} waard`
              : "nog niet ingeschat — voeg een waarde toe"}
          </span>
        </div>
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-5 py-4 text-sm font-medium leading-snug text-amber-100">
          Antwoord binnen 2 minuten om deze klus te winnen
        </div>
        <div className="rounded-2xl border border-destructive/25 bg-destructive/[0.08] px-5 py-4 text-sm font-medium leading-snug text-destructive">
          {staleReply
            ? "Je kunt deze klant verliezen — antwoord nu"
            : "Trage antwoorden lekken omzet naar concurrenten"}
        </div>
      </div>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,420px)_1fr] xl:gap-14">
      <div className="space-y-8">
        <Card className="rounded-2xl border-white/[0.06] bg-gradient-to-b from-card to-secondary/[0.04]">
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    {lead.full_name}
                  </CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {lead.email || "—"} · {lead.phone || "—"}
                  </p>
                </div>
                <LeadStatusMenu
                  leadId={lead.id}
                  status={lead.status}
                  demoMode={demoMode}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <TemperatureBadge temp={temp} />
                {highValue ? <HighValueBadge /> : null}
                {staleReply ? (
                  <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                    Antwoord te laat
                  </span>
                ) : null}
                <span className="text-xs tabular-nums text-muted-foreground">
                  Score {displayScore}
                </span>
              </div>
              <AiTagBadges tags={lead.ai_tags} className="mt-2" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field
              label="CRM-score (ruw)"
              value={lead.score != null ? `${lead.score}/100` : "—"}
            />
            <Field
              label="Geschatte kluswaarde"
              value={
                lead.estimated_value != null
                  ? formatCurrency(lead.estimated_value)
                  : "—"
              }
            />
            <Field
              label="Laatste activiteit"
              value={
                lead.last_message_at
                  ? formatDateTime(lead.last_message_at)
                  : "—"
              }
            />
          </CardContent>
        </Card>

        {!demoMode ? (
          <Card className="rounded-2xl border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-base">Contact & bron</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  start(async () => {
                    const res = await updateLeadProfile(lead.id, {
                      full_name: String(fd.get("full_name") || ""),
                      email: String(fd.get("email") || ""),
                      phone: String(fd.get("phone") || ""),
                      source: String(fd.get("source") || ""),
                    });
                    if (!res.ok) {
                      toast.error(res.error);
                      return;
                    }
                    setLead((l) => ({
                      ...l,
                      full_name: String(fd.get("full_name") || "").trim(),
                      email: String(fd.get("email") || "").trim() || null,
                      phone: String(fd.get("phone") || "").trim() || null,
                      source: String(fd.get("source") || "").trim() || null,
                    }));
                    toast.success("Wijzigingen opgeslagen");
                    router.refresh();
                  });
                }}
              >
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit_full_name">Naam</Label>
                  <Input
                    id="edit_full_name"
                    name="full_name"
                    defaultValue={lead.full_name}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_email">E-mail</Label>
                  <Input
                    id="edit_email"
                    name="email"
                    type="email"
                    defaultValue={lead.email || ""}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_phone">Telefoon</Label>
                  <Input
                    id="edit_phone"
                    name="phone"
                    defaultValue={lead.phone || ""}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit_source">Bron</Label>
                  <Input
                    id="edit_source"
                    name="source"
                    defaultValue={lead.source || ""}
                    placeholder="Website, WhatsApp…"
                    className="rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="secondary" className="rounded-xl">
                    Wijzigingen opslaan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {!demoMode ? (
          <Card className="rounded-2xl border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-base">Extra klantvelden</CardTitle>
              <p className="text-sm text-muted-foreground">
                Niche-specifieke gegevens — één regel per veld:{" "}
                <span className="font-medium text-foreground">label || waarde</span>
              </p>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const raw = String(
                    (e.currentTarget.elements.namedItem(
                      "custom_fields",
                    ) as HTMLTextAreaElement)?.value || "",
                  );
                  start(async () => {
                    const parsed = parseCustomFieldLines(raw);
                    const res = await updateLeadCustomFields(lead.id, parsed);
                    if (!res.ok) {
                      toast.error(res.error);
                      return;
                    }
                    setLead((l) => ({
                      ...l,
                      custom_fields: parsed,
                    }));
                    toast.success("Extra velden opgeslagen");
                    router.refresh();
                  });
                }}
              >
                <Textarea
                  id="custom_fields"
                  name="custom_fields"
                  className="min-h-[120px] rounded-xl"
                  defaultValue={serializeCustomFields(lead.custom_fields)}
                  key={lead.id}
                  placeholder={`Postcode || 1234 AB\nAdres || Voorbeeldstraat 12`}
                />
                <Button type="submit" variant="secondary" className="rounded-xl">
                  Extra velden opslaan
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <ConversionInsightPanel insight={insight} />

        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Samenvatting</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {lead.summary || "Klik op Samenvatten om te genereren."}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Intentie</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {lead.intent || "—"}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Voorgestelde volgende stap</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {lead.suggested_next_action || "—"}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Interne notities</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (fd) => {
                const text = String(fd.get("notes") || "");
                const res = await updateLeadNotes(lead.id, text);
                if (!res.ok) toast.error(res.error);
                else toast.success("Notities opgeslagen");
              }}
            >
              <Textarea
                name="notes"
                defaultValue={lead.notes || ""}
                className="min-h-[120px] rounded-xl"
              />
              <Button type="submit" variant="secondary" className="mt-3 rounded-xl">
                Notities opslaan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Acties met één klik</CardTitle>
            <p className="text-sm text-muted-foreground">
              Snelle stappen die omzet beschermen — zonder door menu&apos;s te zoeken.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {lead.phone ? (
              <Button variant="secondary" className="rounded-xl" asChild>
                <a href={`tel:${lead.phone.replace(/\s/g, "")}`}>
                  <Phone className="size-4" />
                  Bel lead
                </a>
              </Button>
            ) : (
              <Button variant="secondary" className="rounded-xl" disabled>
                <Phone className="size-4" />
                Bel lead
              </Button>
            )}
            {waHref(lead.phone) ? (
              <Button variant="secondary" className="rounded-xl" asChild>
                <a href={waHref(lead.phone)!} target="_blank" rel="noreferrer">
                  <MessageSquare className="size-4" />
                  WhatsApp
                </a>
              </Button>
            ) : (
              <Button variant="secondary" className="rounded-xl" disabled>
                <MessageSquare className="size-4" />
                WhatsApp
              </Button>
            )}
            <Button
              type="button"
              className="rounded-xl"
              disabled={pending || demoMode}
              onClick={() => {
                start(async () => {
                  const res = await convertLeadToAppointment(lead.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  setLead((l) => ({
                    ...l,
                    status: "appointment_booked",
                  }));
                  toast.success("Afspraakslot aangemaakt — fase bijgewerkt");
                  router.refresh();
                });
              }}
            >
              <Calendar className="size-4" />
              Omzetten naar afspraak
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href={`/dashboard/appointments?lead=${lead.id}`}>
                <Calendar className="size-4" />
                Agenda openen
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={pending || demoMode}
              onClick={() => {
                start(async () => {
                  const res = await generateQuoteDraftAndSend(lead.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  setLead((l) => ({ ...l, status: "quote_sent" }));
                  toast.success("Offerte gegenereerd en als verstuurd gemarkeerd");
                  router.refresh();
                });
              }}
            >
              <Zap className="size-4" />
              Offerte maken + versturen
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={pending || demoMode || lead.status === "won"}
              onClick={() => {
                start(async () => {
                  const res = await markLeadWon(lead.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  setLead((l) => ({ ...l, status: "won" }));
                  toast.success("Gemarkeerd als gewonnen");
                  router.refresh();
                });
              }}
            >
              <Trophy className="size-4" />
              Markeer als gewonnen
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-amber-500/20 bg-amber-500/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Opvolgingsradar</CardTitle>
            <p className="text-sm text-muted-foreground">{risk.detail}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {risk.tag ? (
              <span className="inline-flex rounded-full bg-background/80 px-2 py-1 text-[11px] font-semibold uppercase text-amber-900 dark:text-amber-100">
                {risk.tag}
              </span>
            ) : null}
            {risk.sendNow ? (
              <p className="text-sm font-medium text-foreground">
                Deze lead koelt af — stuur nu een opvolging.
              </p>
            ) : null}
            <Button
              type="button"
              className="rounded-xl"
              disabled={pending || demoMode}
              onClick={() => {
                start(async () => {
                  const res = await generateSmartFollowUp(lead.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  setSmartFollowUp(res.data.message);
                  setReply(res.data.message);
                  toast.success("Slimme opvolging klaar");
                });
              }}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Stuur slimme opvolging
            </Button>
            {smartFollowUp ? (
              <p className="text-xs text-muted-foreground">
                Gekopieerd naar &apos;AI-antwoordconcept&apos; — bewerk en plak in
                WhatsApp of je berichten.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">AI-closer</CardTitle>
            <p className="text-sm text-muted-foreground">
              Output is afgestemd op boekingen en offerte-acceptatie — geen
              generieke chat.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              disabled={pending || demoMode}
              onClick={() => {
                start(async () => {
                  const res = await summarizeLeadConversation(lead.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success("Samenvatting succesvol bijgewerkt");
                  router.refresh();
                });
              }}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <TrendingUp className="size-4" />}
              Samenvatten
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={pending || demoMode}
              onClick={() => {
                start(async () => {
                  const res = await refreshLeadAiTags(lead.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  setLead((l) => ({ ...l, ai_tags: res.data.tags }));
                  toast.success("AI-labels bijgewerkt");
                  router.refresh();
                });
              }}
            >
              Labels bijwerken
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={pending || demoMode}
              onClick={() => {
                start(async () => {
                  const res = await generateLeadReply(lead.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  setReply(res.data.reply);
                  toast.success("Antwoord klaar");
                });
              }}
            >
              <MessageSquare className="size-4" />
              Genereer antwoord
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={pending || demoMode}
              onClick={() => {
                start(async () => {
                  const res = await generateQuoteDraft(lead.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success("Offerteconcept opgeslagen");
                  router.refresh();
                });
              }}
            >
              <Bot className="size-4" />
              Maak offerte (concept)
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={pending || demoMode}
              onClick={() => {
                start(async () => {
                  const res = await moveLeadToSuggestedStage(lead.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  setLead((l) => ({
                    ...l,
                    status: res.data.status as LeadStatus,
                  }));
                  toast.success("Fase toegepast");
                });
              }}
            >
              <Sparkles className="size-4" />
              Pas fase toe (AI)
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              disabled={pending || demoMode}
              onClick={() => {
                start(async () => {
                  const res = await advanceLeadStageLinearAction(lead.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  setLead((l) => ({ ...l, status: res.data.status }));
                  toast.success("Volgende fase");
                });
              }}
            >
              Volgende fase (lineair)
            </Button>
            <Button variant="link" className="rounded-xl px-2" asChild>
              <Link href="/dashboard/quotes">Bekijk offertes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/[0.06]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">AI-antwoordconcept</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!reply}
              onClick={() => reply && navigator.clipboard.writeText(reply)}
            >
              <ClipboardCopy className="size-4" />
              Kopiëren
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Genereer een antwoord of slimme opvolging…"
              className="min-h-[160px] rounded-xl"
            />
          </CardContent>
        </Card>

        <Card className="flex max-h-[560px] flex-col rounded-2xl border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Gesprek</CardTitle>
            <p className="text-sm text-muted-foreground">
              {messages.length} berichten
            </p>
          </CardHeader>
          <Separator className="bg-white/[0.06]" />
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-[440px] px-4 py-4">
              <div className="space-y-4 pr-2">
                {messages.map((m) => {
                  const inbound = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[min(100%,520px)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        inbound
                          ? "rounded-tl-md border border-white/[0.06] bg-muted/25"
                          : "ml-auto rounded-tr-md border border-primary/20 bg-primary/[0.07]",
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between gap-6 text-2xs text-muted-foreground">
                        <span className="font-semibold uppercase tracking-wide text-foreground">
                          {m.role === "staff"
                            ? "Team"
                            : m.role === "user"
                              ? "Klant"
                              : m.role}
                        </span>
                        <span className="shrink-0 tabular-nums">
                          {formatDateTime(m.created_at)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-base">Lopende deals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {initial.quotes.length === 0 ? (
                <p className="text-muted-foreground">
                  Nog geen offertes — maak er één via AI-acties.
                </p>
              ) : (
                initial.quotes.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-white/[0.06] bg-background/30 p-3"
                  >
                    <Link
                      href={`/dashboard/quotes/${q.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {q.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {quoteStatusNl(q.status)} · {formatDateTime(q.created_at)}
                    </p>
                    <p className="mt-2 text-sm tabular-nums">
                      {formatCurrency(q.total)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-base">Afspraken</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {initial.appointments.length === 0 ? (
                <p className="text-muted-foreground">
                  Geen afspraken — gebruik &apos;Omzetten naar afspraak&apos;.
                </p>
              ) : (
                initial.appointments.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-white/[0.06] bg-background/30 p-3"
                  >
                    <p className="font-medium">{formatDateTime(a.starts_at)}</p>
                    <p className="text-xs text-muted-foreground">
                      {appointmentStatusNl(a.status)}
                    </p>
                    {a.notes ? (
                      <p className="mt-2 text-muted-foreground">{a.notes}</p>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-background/25 p-4">
      <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
