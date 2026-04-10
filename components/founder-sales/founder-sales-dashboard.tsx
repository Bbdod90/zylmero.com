"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Copy,
  ExternalLink,
  AtSign,
  Mail,
  MessageSquarePlus,
  Plus,
  Send,
  XCircle,
} from "lucide-react";
import type {
  FounderSalesProspect,
  FounderSalesReminder,
  FounderSalesSettings,
  FounderSalesStats,
} from "@/lib/types";
import { FOUNDER_FOLLOW_UP_SCRIPT } from "@/lib/founder/outreach-script";
import {
  createFounderProspectAction,
  incrementDailyContactGoalAction,
  markClosedFounderAction,
  markDemoSentFounderAction,
  markLostFounderAction,
  recordReplyFounderAction,
  sendFollowUpFounderAction,
  updateFounderNotesAction,
  updateFounderProspectAction,
} from "@/actions/founder-sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_OPTIONS: FounderSalesProspect["status"][] = [
  "contacted",
  "replied",
  "demo_sent",
  "interested",
  "closed",
  "lost",
];

const STATUS_LABELS: Record<FounderSalesProspect["status"], string> = {
  contacted: "Benaderd",
  replied: "Beantwoord",
  demo_sent: "Demo verstuurd",
  interested: "Geïnteresseerd",
  closed: "Gesloten",
  lost: "Verloren",
};

function channelLabel(c: FounderSalesProspect["channel"]) {
  if (c === "instagram") return "IG";
  if (c === "whatsapp") return "WhatsApp";
  return "Email";
}

function igUrl(handle: string | null) {
  if (!handle?.trim()) return "https://www.instagram.com/";
  const h = handle.trim().replace(/^@/, "");
  return `https://www.instagram.com/${encodeURIComponent(h)}/`;
}

function waUrl(e164: string | null) {
  const d = (e164 ?? "").replace(/\D/g, "");
  if (!d) return "https://web.whatsapp.com/";
  return `https://wa.me/${d}`;
}

export function FounderSalesDashboard({
  initial,
}: {
  initial: {
    prospects: FounderSalesProspect[];
    settings: FounderSalesSettings;
    reminders: FounderSalesReminder[];
    stats: FounderSalesStats;
    pipeline: {
      contacted: number;
      replied: number;
      demo: number;
      closed: number;
    };
  };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const list = initial.prospects;
    if (tab === "all") return list;
    if (tab === "contacted")
      return list.filter((p) => p.status === "contacted");
    if (tab === "replied")
      return list.filter(
        (p) => p.status === "replied" || p.status === "interested",
      );
    if (tab === "demo") return list.filter((p) => p.status === "demo_sent");
    if (tab === "closed") return list.filter((p) => p.status === "closed");
    return list;
  }, [initial.prospects, tab]);

  const goal = initial.settings.daily_contact_goal;
  const done = initial.settings.contacts_completed_today;
  const pct = Math.min(100, Math.round((done / Math.max(goal, 1)) * 100));

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, msg?: string) {
    start(async () => {
      const r = await fn();
      if (r.ok) {
        if (msg) toast.success(msg);
        router.refresh();
      } else toast.error(r.error ?? "Mislukt");
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Berichten verstuurd
            </CardTitle>
            <p className="text-3xl font-bold tabular-nums">
              {initial.stats.messagesSent}
            </p>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Reacties
            </CardTitle>
            <p className="text-3xl font-bold tabular-nums">
              {initial.stats.replies}
            </p>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demos
            </CardTitle>
            <p className="text-3xl font-bold tabular-nums">
              {initial.stats.demos}
            </p>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Gesloten deals
            </CardTitle>
            <p className="text-3xl font-bold tabular-nums">
              {initial.stats.closed}
            </p>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-2xl border-primary/25 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conversie</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gesloten ÷ alle prospects · Win rate = gesloten ÷ (gesloten + verloren)
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          <p>
            <span className="font-semibold text-foreground">
              {initial.stats.total === 0
                ? "0%"
                : `${Math.round(initial.stats.conversionRate * 100)}%`}
            </span>{" "}
            pijplijn-conversie
          </p>
          <p>
            <span className="font-semibold text-foreground">
              {initial.stats.closed + initial.stats.lost === 0
                ? "—"
                : `${Math.round(initial.stats.winRate * 100)}%`}
            </span>{" "}
            winpercentage
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Outreach van vandaag</CardTitle>
            <p className="text-sm text-muted-foreground">
              Neem contact op met {goal} bedrijven · log elke touch
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            className="min-h-[48px] w-full rounded-xl font-bold sm:w-auto"
            disabled={pending}
            onClick={() =>
              run(
                () => incrementDailyContactGoalAction(),
                "+1 contact gelogd",
              )
            }
          >
            +1 contact loggen
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm font-medium">
            <span>
              {done} / {goal} gedaan
            </span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Benaderd", initial.pipeline.contacted],
            ["Geantwoord", initial.pipeline.replied],
            ["Demo", initial.pipeline.demo],
            ["Gesloten", initial.pipeline.closed],
          ] as const
        ).map(([label, n]) => (
          <div
            key={label}
            className="rounded-2xl border border-border/70 bg-card/50 px-4 py-4 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{n}</p>
          </div>
        ))}
      </div>

      {initial.reminders.length > 0 ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            Actie-wachtrij
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {initial.reminders.map((r) => (
              <li key={`${r.id}-${r.kind}`}>
                {r.kind === "follow_up_today" ? (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <CalendarClock className="size-3.5" />
                    Vandaag opvolging — {r.business_name}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <AlertTriangle className="size-3.5" />
                    Geen reactie binnen 24 u — {r.business_name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Pijplijn</h2>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="min-h-[48px] w-full rounded-xl font-bold sm:w-auto">
              <Plus className="mr-2 size-4" />
              Prospect toevoegen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nieuwe outreach</DialogTitle>
            </DialogHeader>
            <form
              className="grid gap-4 pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                start(async () => {
                  const r = await createFounderProspectAction(fd);
                  if (r.ok) {
                    toast.success("Prospect toegevoegd");
                    setAddOpen(false);
                    router.refresh();
                  } else toast.error(r.error ?? "Mislukt");
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="business_name">Bedrijfsnaam</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  required
                  className="rounded-xl"
                  placeholder="Bijv. Garage Jansen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contactpersoon</Label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel">Kanaal</Label>
                <select
                  id="channel"
                  name="channel"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="instagram">Instagram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram_handle">Instagram (optioneel)</Label>
                <Input
                  id="instagram_handle"
                  name="instagram_handle"
                  className="rounded-xl"
                  placeholder="@shop of shopnaam"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">E-mail (optioneel)</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp_e164">WhatsApp E.164 (optioneel)</Label>
                <Input
                  id="whatsapp_e164"
                  name="whatsapp_e164"
                  className="rounded-xl"
                  placeholder="+31612345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_follow_up_at">Volgende opvolging (optioneel)</Label>
                <Input
                  id="next_follow_up_at"
                  name="next_follow_up_at"
                  type="datetime-local"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notities</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  className="min-h-[80px] rounded-xl"
                />
              </div>
              <Button
                type="submit"
                className="min-h-[48px] w-full rounded-xl font-bold"
                disabled={pending}
              >
                Prospect opslaan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="all" className="rounded-lg">
            Alles
          </TabsTrigger>
          <TabsTrigger value="contacted" className="rounded-lg">
            Benaderd
          </TabsTrigger>
          <TabsTrigger value="replied" className="rounded-lg">
            Geantwoord
          </TabsTrigger>
          <TabsTrigger value="demo" className="rounded-lg">
            Demo
          </TabsTrigger>
          <TabsTrigger value="closed" className="rounded-lg">
            Gesloten
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bedrijf</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="max-w-[4rem]">Kanaal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Volg. FU</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      Geen prospects — voeg er een toe.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <ProspectRow
                      key={p.id}
                      prospect={p}
                      pending={pending}
                      onRun={run}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
    </div>
  );
}

function ProspectRow({
  prospect: p,
  pending,
  onRun,
}: {
  prospect: FounderSalesProspect;
  pending: boolean;
  onRun: (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    msg?: string,
  ) => void;
}) {
  const [notes, setNotes] = useState(p.notes ?? "");

  useEffect(() => {
    setNotes(p.notes ?? "");
  }, [p.id, p.notes]);

  return (
    <TableRow id={`p-${p.id}`}>
      <TableCell className="align-top font-medium">
        <div>{p.business_name}</div>
        <div className="mt-2 sm:hidden">
          <NotesCell
            value={notes}
            onChange={setNotes}
            onSave={() =>
              onRun(
                () => updateFounderNotesAction(p.id, notes),
                "Notities opgeslagen",
              )
            }
            disabled={pending}
          />
        </div>
      </TableCell>
      <TableCell className="hidden align-top text-muted-foreground sm:table-cell">
        {p.contact_name ?? "—"}
      </TableCell>
      <TableCell className="align-top">
        <span className="text-xs font-medium">{channelLabel(p.channel)}</span>
      </TableCell>
      <TableCell className="align-top">
        <select
          className="max-w-[140px] rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
          value={p.status}
          disabled={pending}
          onChange={(e) => {
            const status = e.target.value as FounderSalesProspect["status"];
            onRun(
              () =>
                updateFounderProspectAction({
                  id: p.id,
                  status,
                }),
              "Bijgewerkt",
            );
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </TableCell>
      <TableCell className="hidden align-top text-sm text-muted-foreground md:table-cell">
        {p.next_follow_up_at ? formatDateTime(p.next_follow_up_at) : "—"}
      </TableCell>
      <TableCell className="align-top text-right">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="rounded-xl text-xs font-semibold"
            disabled={pending}
            onClick={() =>
              onRun(
                () => sendFollowUpFounderAction(p.id),
                "Opvolging gelogd",
              )
            }
          >
            <Send className="mr-1 size-3" />
            Opvolging sturen
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl text-xs font-semibold"
            disabled={pending}
            onClick={async () => {
              await navigator.clipboard.writeText(FOUNDER_FOLLOW_UP_SCRIPT);
              toast.success("Script gekopieerd");
            }}
          >
            <Copy className="mr-1 size-3" />
            Script kopiëren
          </Button>
          {p.channel === "instagram" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl text-xs font-semibold"
              asChild
            >
              <a href={igUrl(p.instagram_handle)} target="_blank" rel="noreferrer">
                <AtSign className="mr-1 size-3" />
                Instagram
                <ExternalLink className="ml-1 size-3 opacity-60" />
              </a>
            </Button>
          ) : null}
          {p.channel === "whatsapp" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl text-xs font-semibold"
              asChild
            >
              <a href={waUrl(p.whatsapp_e164)} target="_blank" rel="noreferrer">
                <MessageSquarePlus className="mr-1 size-3" />
                WhatsApp
                <ExternalLink className="ml-1 size-3 opacity-60" />
              </a>
            </Button>
          ) : null}
          {p.channel === "email" && p.contact_email ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl text-xs font-semibold"
              asChild
            >
              <a href={`mailto:${encodeURIComponent(p.contact_email)}`}>
                <Mail className="mr-1 size-3" />
                Email
              </a>
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl text-xs font-semibold"
            disabled={pending}
            onClick={() =>
              onRun(() => recordReplyFounderAction(p.id), "Gemarkeerd als beantwoord")
            }
          >
            Ze antwoordden
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl text-xs font-semibold"
            disabled={pending}
            onClick={() =>
              onRun(() => markDemoSentFounderAction(p.id), "Demo gelogd")
            }
          >
            Demo verstuurd
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-xl text-xs font-semibold"
            disabled={pending}
            onClick={() =>
              onRun(() => markClosedFounderAction(p.id), "Gemarkeerd als gesloten")
            }
          >
            <CheckCircle2 className="mr-1 size-3" />
            Gesloten
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="rounded-xl text-xs text-destructive"
            disabled={pending}
            onClick={() =>
              onRun(() => markLostFounderAction(p.id), "Gemarkeerd als verloren")
            }
          >
            <XCircle className="mr-1 size-3" />
            Verloren
          </Button>
        </div>
        <div className="mt-3 hidden sm:block">
          <NotesCell
            value={notes}
            onChange={setNotes}
            onSave={() =>
              onRun(
                () => updateFounderNotesAction(p.id, notes),
                "Notities opgeslagen",
              )
            }
            disabled={pending}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

function NotesCell({
  value,
  onChange,
  onSave,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase text-muted-foreground">Notities</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onSave}
        disabled={disabled}
        className="min-h-[72px] rounded-xl text-xs"
        placeholder="Snelle notities…"
      />
    </div>
  );
}
