"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import type { InboxThread } from "@/lib/queries/inbox";
import type { Message, ReplyTemplate } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { LeadStatusMenu } from "@/components/leads/lead-status-menu";
import { Search, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sendInboxMessage, generateInboxReply } from "@/actions/inbox";
import { useRouter } from "next/navigation";
import { computeDisplayScore, leadTemperature } from "@/lib/sales/scoring";
import { TemperatureBadge } from "@/components/sales/temperature-badge";
import { describeFollowUpRisk } from "@/lib/sales/followup-risk";
import { channelLabelNl } from "@/lib/i18n/channel-nl";
import { AiTagBadges } from "@/components/leads/ai-tag-badges";

export function InboxWorkspace({
  threads,
  staleReplyLeadIds = [],
  demoMode = false,
  replyTemplates = [],
}: {
  threads: InboxThread[];
  staleReplyLeadIds?: string[];
  demoMode?: boolean;
  replyTemplates?: ReplyTemplate[];
}) {
  const router = useRouter();
  const stale = useMemo(() => new Set(staleReplyLeadIds), [staleReplyLeadIds]);
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

  return (
    <div className="grid min-h-[min(680px,90dvh)] gap-6 pb-24 md:min-h-[620px] md:pb-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-8">
      <Card className="glass flex flex-col overflow-hidden rounded-3xl shadow-premium">
        <div className="relative border-b border-white/[0.06] p-4">
          <Search className="absolute left-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
                placeholder="Zoek op naam of onderwerp…"
            className="h-12 border-white/[0.06] bg-background/40 pl-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3">
            {filtered.map((t) => {
              const on = t.conversation.id === active?.conversation.id;
              const score = computeDisplayScore(t.lead, {
                staleReply: stale.has(t.lead.id),
              });
              const temp = leadTemperature(t.lead, score);
              return (
                <button
                  key={t.conversation.id}
                  type="button"
                  onClick={() => setSelected(t.conversation.id)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition-all duration-200",
                    on
                      ? "border-primary/30 bg-primary/[0.07] shadow-inner-soft"
                      : "border-transparent bg-transparent hover:border-white/[0.06] hover:bg-white/[0.03]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold tracking-tight">
                      {t.lead.full_name}
                    </p>
                    <LeadStatusMenu
                      leadId={t.lead.id}
                      status={t.lead.status}
                      demoMode={demoMode}
                      compact
                      stopPropagation
                      className="max-w-[min(100%,9rem)]"
                    />
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex rounded-full border border-white/[0.08] bg-background/50 px-2 py-0.5 text-2xs font-medium text-muted-foreground">
                      {channelLabelNl(t.conversation.channel)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <AiTagBadges tags={t.lead.ai_tags} size="xs" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <TemperatureBadge temp={temp} />
                    {stale.has(t.lead.id) ? (
                      <span className="rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-2xs font-semibold uppercase text-destructive">
                        Te laat
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {t.preview}
                  </p>
                  <p className="mt-2 text-2xs tabular-nums text-muted-foreground">
                    {formatDateTime(t.lastAt)}
                  </p>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={pending || demoMode || replyTemplates.length === 0}
                    >
                      <FileText className="mr-2 size-4" />
                      Snel invoegen
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                    {replyTemplates.map((t) => (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => {
                          const first = String(active.lead.full_name || "")
                            .split(/\s+/)[0]
                            .trim();
                          const body = t.body.replace(/\{\{naam\}\}/gi, first);
                          setCompose((c) => (c ? `${c}\n\n${body}` : body));
                          toast.message(`Sjabloon: ${t.title}`);
                        }}
                      >
                        {t.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
