"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { nl } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import type { InboxThread } from "@/lib/queries/inbox";
import type { Lead, Message } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { LeadStatusMenu } from "@/components/leads/lead-status-menu";
import { Search } from "lucide-react";
import { sendInboxMessage, generateInboxReply } from "@/actions/inbox";

function nameInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0] ?? "?";
  const b = parts[parts.length - 1]?.[0] ?? "";
  return `${a}${b}`.toUpperCase();
}

function threadListTime(lastAt: string): string {
  const d = new Date(lastAt);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Gisteren";
  return format(d, "d MMM", { locale: nl });
}
import { useRouter } from "next/navigation";
import type { LeadTemperature } from "@/lib/sales/scoring";
import { LeadPriorityMenu } from "@/components/leads/lead-priority-menu";
import { describeFollowUpRisk } from "@/lib/sales/followup-risk";
import { channelLabelNl } from "@/lib/i18n/channel-nl";
import { AiTagBadges } from "@/components/leads/ai-tag-badges";

export function InboxWorkspace({
  threads,
  staleReplyLeadIds = [],
  demoMode = false,
}: {
  threads: InboxThread[];
  staleReplyLeadIds?: string[];
  demoMode?: boolean;
}) {
  const router = useRouter();
  const stale = useMemo(() => new Set(staleReplyLeadIds), [staleReplyLeadIds]);
  const [demoPriority, setDemoPriority] = useState<
    Record<string, LeadTemperature>
  >({});
  const [selected, setSelected] = useState(threads[0]?.conversation.id ?? "");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [compose, setCompose] = useState("");
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    setOptimistic({});
  }, [selected]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return threads;
    return threads.filter(
      (t) =>
        t.lead.full_name.toLowerCase().includes(n) ||
        t.preview.toLowerCase().includes(n),
    );
  }, [threads, q]);

  const active = filtered.find((t) => t.conversation.id === selected) || filtered[0];

  const mergedMessages = useMemo(() => {
    if (!active) return [];
    const extra = optimistic[active.conversation.id] ?? [];
    return [...active.messages, ...extra].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, [active, optimistic]);

  const activeRisk = active
    ? describeFollowUpRisk(
        active.lead,
        mergedMessages,
        [],
        { staleReply: stale.has(active.lead.id) },
      )
    : null;

  const augmentLead = (lead: Lead): Lead => {
    const p = demoPriority[lead.id];
    if (!p) return lead;
    return {
      ...lead,
      custom_fields: { ...lead.custom_fields, priority_override: p },
    };
  };

  return (
    <div className="grid min-h-[min(680px,90dvh)] gap-6 pb-24 md:min-h-[620px] md:pb-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-6">
      <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-[hsl(215_20%_97%)] shadow-[0_28px_70px_-48px_rgb(0_0_0/0.35)] dark:border-white/[0.08] dark:bg-[hsl(217_28%_10%)] dark:shadow-[0_32px_80px_-52px_rgb(0_0_0/0.55)]">
        <header className="flex h-[3.35rem] shrink-0 items-center border-b border-border/35 px-5 dark:border-white/[0.07] dark:bg-[hsl(217_30%_8%)]">
          <div>
            <h2 className="text-[1.0625rem] font-semibold leading-none tracking-tight text-foreground">
              Chats
            </h2>
            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground/75">
              {filtered.length === threads.length
                ? `${threads.length} gesprek${threads.length === 1 ? "" : "ken"}`
                : `${filtered.length} van ${threads.length}`}
            </p>
          </div>
        </header>
        <div className="relative shrink-0 border-b border-border/30 px-4 py-2.5 dark:border-white/[0.06]">
          <Search className="absolute left-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Zoek op naam …"
            className="h-10 rounded-xl border-border/45 bg-background/95 pl-10 text-[0.9375rem] placeholder:text-muted-foreground/55 dark:border-white/[0.07] dark:bg-white/[0.04]"
          />
        </div>
        <ScrollArea className="min-h-[280px] flex-1">
          <div className="divide-y divide-border/30 dark:divide-white/[0.05]">
            {filtered.map((t) => {
              const on = t.conversation.id === active?.conversation.id;
              const rowLead = augmentLead(t.lead);
              return (
                <div
                  key={t.conversation.id}
                  className={cn(
                    "flex gap-2 px-3 py-2.5 transition-colors",
                    on
                      ? "bg-primary/[0.07]"
                      : "hover:bg-muted/35 dark:hover:bg-white/[0.03]",
                  )}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-lg py-0.5 text-left outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-primary/35"
                    onClick={() => setSelected(t.conversation.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(t.conversation.id);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                        on
                          ? "bg-primary text-primary-foreground shadow-[0_4px_14px_-6px_hsl(var(--primary))]"
                          : "bg-muted text-foreground dark:bg-white/[0.08]",
                      )}
                    >
                      {nameInitials(t.lead.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[0.9375rem] font-semibold leading-tight tracking-tight text-foreground">
                          {t.lead.full_name}
                        </span>
                        <span className="shrink-0 text-[0.7rem] font-medium tabular-nums text-muted-foreground">
                          {threadListTime(t.lastAt)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[0.8125rem] leading-snug text-muted-foreground">
                        {t.preview}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/65">
                          {channelLabelNl(t.conversation.channel)}
                        </span>
                        <AiTagBadges tags={t.lead.ai_tags} size="xs" />
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex shrink-0 flex-col items-end gap-1.5 self-start pt-1"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <LeadStatusMenu
                      leadId={t.lead.id}
                      status={t.lead.status}
                      demoMode={demoMode}
                      compact
                      stopPropagation
                      className="max-w-[min(100%,9rem)]"
                    />
                    <LeadPriorityMenu
                      lead={rowLead}
                      demoMode={demoMode}
                      staleReply={stale.has(t.lead.id)}
                      compact
                      stopPropagation
                      onDemoPriorityChange={(next) =>
                        setDemoPriority((m) => ({ ...m, [t.lead.id]: next }))
                      }
                    />
                    {stale.has(t.lead.id) ? (
                      <span className="rounded-full border border-destructive/20 bg-destructive/10 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-destructive">
                        Te laat
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Card className="glass flex min-h-[520px] flex-col overflow-hidden rounded-3xl shadow-premium lg:min-h-0">
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
            <p className="text-sm font-medium text-foreground">Kies een gesprek</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Open een gesprek om te antwoorden met de snelheid die klanten verwachten.
            </p>
          </div>
        ) : (
          <>
            <div className="border-b border-border/50 bg-muted/10 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Geschatte waarde</span>{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {active.lead.estimated_value != null
                        ? formatCurrency(active.lead.estimated_value)
                        : "— stel een waarde in bij de lead"}
                    </span>
                  </p>
                  <p className="leading-relaxed text-muted-foreground">
                    {stale.has(active.lead.id)
                      ? "Laatste bericht is van de klant — een kort antwoord houdt het vertrouwen erin."
                      : "Korte, duidelijke antwoorden werken het best — één vraag per bericht."}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-b border-white/[0.06] px-6 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold tracking-tight">
                    {active.lead.full_name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {active.lead.email || "—"} · {active.lead.phone || "—"}
                  </p>
                  <p className="mt-2">
                    <span className="inline-flex rounded-full border border-primary/25 bg-primary/[0.08] px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-primary">
                      {channelLabelNl(active.conversation.channel)}
                    </span>
                  </p>
                  <div className="mt-3">
                    <AiTagBadges tags={active.lead.ai_tags} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <LeadStatusMenu
                      leadId={active.lead.id}
                      status={active.lead.status}
                      demoMode={demoMode}
                      compact
                    />
                    <LeadPriorityMenu
                      lead={augmentLead(active.lead)}
                      demoMode={demoMode}
                      staleReply={stale.has(active.lead.id)}
                      onDemoPriorityChange={(next) =>
                        setDemoPriority((m) => ({
                          ...m,
                          [active.lead.id]: next,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" asChild>
                  <Link href={`/dashboard/leads/${active.lead.id}`}>
                    Open werkruimte
                  </Link>
                </Button>
              </div>
              {activeRisk ? (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {activeRisk.detail}
                  {activeRisk.sendNow ? (
                    <span className="mt-2 block font-medium text-foreground">
                      Stuur nu een opvolging — dit gesprek koelt af.
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
            <ScrollArea className="min-h-[280px] flex-1 px-4 py-4 md:max-h-[min(480px,42vh)]">
              <div className="space-y-4 pr-2">
                {mergedMessages.map((m) => {
                  const inbound = m.role === "user";
                  const pendingLocal = m.id.startsWith("optimistic-");
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "animate-in fade-in slide-in-from-bottom-1 max-w-[min(100%,85%)] rounded-[1.15rem] px-4 py-3.5 text-sm leading-relaxed duration-300 md:max-w-[min(100%,520px)]",
                        inbound
                          ? "glass-bubble mr-auto rounded-tl-md"
                          : "ml-auto rounded-tr-md border border-primary/30 bg-primary/[0.11] shadow-[0_2px_12px_-8px_hsl(var(--primary)/0.4)] backdrop-blur-xl dark:border-primary/22 dark:bg-primary/[0.09]",
                        pendingLocal && "opacity-90 ring-1 ring-primary/15",
                      )}
                    >
                      <p className="mb-2 text-2xs uppercase tracking-wide text-muted-foreground">
                        {m.role === "staff"
                          ? pendingLocal
                            ? "Team · verzenden…"
                            : "Team"
                          : m.role === "user"
                            ? "Klant"
                            : m.role}{" "}
                        ·{" "}
                        {channelLabelNl(
                          m.channel ?? active.conversation.channel,
                        )}{" "}
                        {!pendingLocal && (
                          <>· {formatDateTime(m.created_at)}</>
                        )}
                      </p>
                      <p className="whitespace-pre-wrap text-[15px]">{m.content}</p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="space-y-4 border-t border-border/60 bg-background/50 p-4 backdrop-blur-md dark:border-white/[0.06] md:static md:rounded-b-2xl">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-xl"
                  disabled={pending}
                  onClick={() => {
                    start(async () => {
                      const res = await generateInboxReply(active.conversation.id);
                      if (!res.ok) {
                        toast.error(res.error);
                        return;
                      }
                      setDraft(res.data.reply);
                      toast.success("AI-antwoord gegenereerd", {
                        description: "Controleer de tekst en pas aan waar nodig.",
                      });
                    });
                  }}
                >
                  Genereer AI-antwoord
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  disabled={!draft}
                  onClick={() => {
                    setCompose((c) => (c ? `${c}\n\n${draft}` : draft));
                    toast.message("In composer geplaatst");
                  }}
                >
                  Invoegen in bericht
                </Button>
              </div>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="AI-antwoord — controleer en pas aan…"
                className="min-h-[100px] rounded-xl"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Textarea
                  value={compose}
                  onChange={(e) => setCompose(e.target.value)}
                  placeholder="Schrijf je bericht aan de klant…"
                  className="min-h-[88px] flex-1 rounded-xl"
                />
                <Button
                  type="button"
                  className="h-12 min-h-[48px] shrink-0 rounded-xl px-8 sm:self-stretch"
                  disabled={pending || !compose.trim()}
                  onClick={() => {
                    const text = compose.trim();
                    const cid = active.conversation.id;
                    const tempId = `optimistic-${Date.now()}`;
                    const optimisticMsg: Message = {
                      id: tempId,
                      conversation_id: cid,
                      role: "staff",
                      content: text,
                      channel: active.conversation.channel,
                      created_at: new Date().toISOString(),
                    };
                    if (!demoMode) {
                      setOptimistic((o) => ({
                        ...o,
                        [cid]: [...(o[cid] ?? []), optimisticMsg],
                      }));
                    }
                    start(async () => {
                      const res = await sendInboxMessage(cid, text);
                      if (!res.ok) {
                        if (!demoMode) {
                          setOptimistic((o) => ({
                            ...o,
                            [cid]: (o[cid] ?? []).filter((m) => m.id !== tempId),
                          }));
                        }
                        toast.error(res.error);
                        return;
                      }
                      toast.success("Bericht verzonden", {
                        description: "Je staat nog steeds vooraan in de inbox.",
                      });
                      setCompose("");
                      if (!demoMode) {
                        setOptimistic((o) => {
                          const n = { ...o };
                          delete n[cid];
                          return n;
                        });
                      }
                      router.refresh();
                    });
                  }}
                >
                  Verstuur
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
