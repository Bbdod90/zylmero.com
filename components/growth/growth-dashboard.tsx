"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  inviteClientAccount,
  setSalesModeCookie,
} from "@/actions/growth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/growth/copy-button";
import { useGrowthStorage } from "@/components/growth/use-growth-storage";
import { OUTREACH_SCRIPTS } from "@/lib/growth/outreach-scripts";
import {
  getSearchStrategyCopy,
  LEAD_FINDER_KEYWORDS,
} from "@/lib/growth/lead-finder";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Minus,
  Plus,
  Rocket,
  Target,
} from "lucide-react";

const DAILY = [
  { id: "contact_10", label: "Neem contact op met 10 lokale bedrijven" },
  { id: "demo_5", label: "Stuur 5 demo-uitnodigingen" },
  { id: "follow_3", label: "Opvolging bij 3 leads" },
  { id: "call_1", label: "Plan 1 belafspraak" },
] as const;

const FIRST_DEAL = [
  { id: "contact_20", label: "Neem contact op met 20 bedrijven" },
  { id: "get_5_replies", label: "Krijg 5 reacties" },
  { id: "book_2_demos", label: "Boek 2 demo’s" },
  { id: "close_1_deal", label: "Sluit 1 deal" },
] as const;

const PIPELINE_KEYS = [
  { key: "contacted" as const, label: "Benaderd" },
  { key: "replied" as const, label: "Geantwoord" },
  { key: "demoBooked" as const, label: "Demo geboekt" },
  { key: "closed" as const, label: "Gesloten" },
];

export function GrowthDashboard({
  siteUrl,
  salesModeInitial,
}: {
  siteUrl: string;
  salesModeInitial: boolean;
}) {
  const router = useRouter();
  const { data, mutate, ensureDemoSlug, ready } = useGrowthStorage();
  const [salesOn, setSalesOn] = useState(salesModeInitial);
  const [pending, start] = useTransition();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [leadsMo, setLeadsMo] = useState(40);
  const [avgJob, setAvgJob] = useState(350);

  const demoUrl = useMemo(() => {
    if (!data?.demoSlug) return "";
    const base = siteUrl.replace(/\/$/, "");
    return `${base}/demo/${data.demoSlug}`;
  }, [data?.demoSlug, siteUrl]);

  const roi = useMemo(() => {
    const gained = Math.round(leadsMo * avgJob * 0.18);
    const lost = Math.round(leadsMo * avgJob * 0.1);
    return { gained, lost };
  }, [leadsMo, avgJob]);

  const firstDealProgress = useMemo(() => {
    if (!data) return 0;
    const done = FIRST_DEAL.filter((x) => data.checklist[x.id]).length;
    return Math.round((done / FIRST_DEAL.length) * 100);
  }, [data]);

  function toggleSalesMode(next: boolean) {
    start(async () => {
      const res = await setSalesModeCookie(next);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSalesOn(next);
      toast.success(next ? "Verkoopmodus aan" : "Verkoopmodus uit");
      router.refresh();
    });
  }

  function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await inviteClientAccount({
        email: inviteEmail,
        businessName: inviteName,
      });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Uitnodiging verstuurd — de eigenaar ontvangt een e-mail.");
        setInviteEmail("");
        setInviteName("");
      }
    });
  }

  if (!ready || !data) {
    return (
      <div className="cf-dashboard-panel flex min-h-[280px] flex-col items-center justify-center gap-3 p-10 text-center">
        <div className="size-10 animate-pulse rounded-full bg-primary/15 ring-2 ring-primary/20" />
        <p className="text-sm font-medium text-muted-foreground">
          Je groei-workspace laden…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Card className="cf-dashboard-panel rounded-2xl border-primary/25 bg-gradient-to-br from-primary/[0.06] via-card to-card dark:from-primary/[0.09] dark:via-card dark:to-[hsl(222_26%_6%)]">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 sm:p-8 sm:pb-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/22 to-primary/8 text-primary shadow-inner-soft ring-1 ring-primary/18">
              <Rocket className="size-6" />
            </div>
            <div>
              <p className="cf-eyebrow text-[0.625rem]">Modus</p>
              <CardTitle className="mt-0.5 text-xl font-bold tracking-tight">
                Verkoopmodus
              </CardTitle>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Benadrukt waarde, ROI en urgentie bij leads en berichten.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="sales-mode"
              checked={salesOn}
              disabled={pending}
              onCheckedChange={(v) => toggleSalesMode(v)}
            />
            <Label htmlFor="sales-mode" className="text-sm font-medium">
              {salesOn ? "Aan" : "Uit"}
            </Label>
          </div>
        </CardHeader>
      </Card>

      <section>
        <div className="mb-5 flex items-end gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Target className="size-5" />
          </div>
          <div>
            <p className="cf-eyebrow text-[0.625rem]">Focus</p>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Acties voor vandaag
            </h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {DAILY.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                mutate((prev) => ({
                  ...prev,
                  dailyTasks: {
                    ...prev.dailyTasks,
                    [t.id]: !prev.dailyTasks[t.id],
                  },
                }))
              }
              className={cn(
                "cf-transition flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium shadow-sm",
                data.dailyTasks[t.id]
                  ? "border-primary/45 bg-primary/[0.12] shadow-md ring-1 ring-primary/15 dark:bg-primary/[0.14]"
                  : "border-border/65 bg-card/60 hover:border-primary/20 hover:bg-muted/50 dark:bg-card/40 dark:hover:bg-white/[0.04]",
              )}
            >
              {data.dailyTasks[t.id] ? (
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
              ) : (
                <Circle className="size-5 shrink-0 text-muted-foreground" />
              )}
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="cf-eyebrow text-[0.625rem]">Pipeline</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Pijplijn</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_KEYS.map(({ key, label }) => (
            <Card key={key} className="cf-dashboard-panel rounded-2xl">
              <CardHeader className="pb-2 pt-6">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-8 shrink-0 rounded-lg"
                  onClick={() =>
                    mutate((prev) => ({
                      ...prev,
                      pipeline: {
                        ...prev.pipeline,
                        [key]: Math.max(0, prev.pipeline[key] - 1),
                      },
                    }))
                  }
                >
                  <Minus className="size-4" />
                </Button>
                <span className="flex-1 text-center text-2xl font-semibold tabular-nums">
                  {data.pipeline[key]}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-8 shrink-0 rounded-lg"
                  onClick={() =>
                    mutate((prev) => ({
                      ...prev,
                      pipeline: {
                        ...prev.pipeline,
                        [key]: prev.pipeline[key] + 1,
                      },
                    }))
                  }
                >
                  <Plus className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2">
          <p className="cf-eyebrow text-[0.625rem]">Outreach</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Scripts</h2>
        </div>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Kopiëren, [haken] invullen, versturen. Blijf menselijk — één gesprek
          tegelijk.
        </p>
        <div className="space-y-5">
          {OUTREACH_SCRIPTS.map((s) => (
            <Card key={s.id} className="cf-dashboard-panel rounded-2xl">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-base font-medium">{s.label}</CardTitle>
                <CopyButton text={s.body} />
              </CardHeader>
              <CardContent>
                <div className="glass-bubble whitespace-pre-wrap p-5 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="cf-eyebrow text-[0.625rem]">Acquisitie</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Hoe je klanten vindt
          </h2>
        </div>
        <Card className="cf-dashboard-panel rounded-2xl">
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-sm font-medium">Zoekwoorden</p>
              <p className="mt-2 flex flex-wrap gap-2">
                {LEAD_FINDER_KEYWORDS.map((k) => (
                  <span
                    key={k}
                    className="rounded-full border border-border/55 bg-muted/35 px-3 py-1 text-xs font-medium text-foreground shadow-sm ring-1 ring-black/[0.03] dark:border-white/[0.08] dark:bg-white/[0.05] dark:ring-white/[0.04]"
                  >
                    {k}
                  </span>
                ))}
              </p>
            </div>
            <Separator />
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Google Maps:</strong> zoek een sector + stad
                (bijv. kapsalon, praktijk, garage), open profielen, noteer telefoon / WhatsApp.
              </li>
              <li>
                <strong className="text-foreground">Instagram:</strong> hashtags #[stad] + sector
                (#kapper, #tandarts, #garage …) — DM zaken die posten maar traag antwoorden.
              </li>
            </ul>
            <CopyButton
              text={getSearchStrategyCopy()}
              label="Kopieer zoekstrategie"
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-5">
          <p className="cf-eyebrow text-[0.625rem]">Delen</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Demo-link generator
          </h2>
        </div>
        <Card className="cf-dashboard-panel rounded-2xl">
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              Deel deze link — opent het product in demo-modus (zonder login).
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl"
                onClick={() => ensureDemoSlug()}
              >
                {data.demoSlug ? "Nieuw ID genereren" : "Deelbare link maken"}
              </Button>
              {demoUrl ? (
                <>
                  <CopyButton text={demoUrl} label="Kopieer demo-link" />
                  <code className="block w-full truncate rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs">
                    {demoUrl}
                  </code>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Klik op genereren om je link te maken.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-5">
          <p className="cf-eyebrow text-[0.625rem]">Onboarding</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Snelle setup voor klanten
          </h2>
        </div>
        <Card className="cf-dashboard-panel rounded-2xl">
          <CardContent className="pt-6">
            <form onSubmit={submitInvite} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="biz">Bedrijfsnaam</Label>
                <Input
                  id="biz"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Naam van hun bedrijf"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="em">E-mail eigenaar</Label>
                <Input
                  id="em"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="eigenaar@bedrijf.nl"
                  className="rounded-xl"
                  required
                />
              </div>
              <Button
                type="submit"
                className="rounded-xl"
                disabled={pending}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Uitnodiging versturen"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-5">
          <p className="cf-eyebrow text-[0.625rem]">Impact</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Omzet-snapshot
          </h2>
        </div>
        <Card className="cf-dashboard-panel rounded-2xl border-primary/25 bg-gradient-to-br from-primary/[0.07] via-card to-card dark:from-primary/[0.1]">
          <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Leads per maand (inbound)</Label>
              <Input
                type="number"
                min={1}
                value={leadsMo}
                onChange={(e) => setLeadsMo(Number(e.target.value) || 0)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Gemiddelde kluswaarde (€)</Label>
              <Input
                type="number"
                min={1}
                value={avgJob}
                onChange={(e) => setAvgJob(Number(e.target.value) || 0)}
                className="rounded-xl"
              />
            </div>
            <div className="md:col-span-2 rounded-2xl border border-primary/30 bg-background/60 p-6">
              <p className="text-2xl font-semibold text-primary">
                Je kunt ~€{roi.gained.toLocaleString("nl-NL")} / maand extra halen
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Model: snellere antwoorden en opvolging verhogen conversie (~18% van
                leadwaarde vs ~10% verlies zonder direct antwoord).
              </p>
              <p className="mt-4 text-lg font-medium text-destructive/90">
                Verlies zonder tool ~€{roi.lost.toLocaleString("nl-NL")} / maand
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-2">
          <p className="cf-eyebrow text-[0.625rem]">Social proof</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Testimonial-builder
          </h2>
        </div>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Demo-citaten voor pitches — vrij bewerken; opgeslagen in deze browser.
        </p>
        <div className="space-y-5">
          {data.testimonials.map((row, idx) => (
            <Card key={row.id} className="cf-dashboard-panel rounded-2xl">
              <CardContent className="space-y-3 pt-6">
                <Textarea
                  value={row.quote}
                  onChange={(e) =>
                    mutate((prev) => {
                      const next = [...prev.testimonials];
                      next[idx] = { ...next[idx]!, quote: e.target.value };
                      return { ...prev, testimonials: next };
                    })
                  }
                  className="min-h-[80px] rounded-xl"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={row.name}
                    onChange={(e) =>
                      mutate((prev) => {
                        const next = [...prev.testimonials];
                        next[idx] = { ...next[idx]!, name: e.target.value };
                        return { ...prev, testimonials: next };
                      })
                    }
                    placeholder="Naam"
                    className="rounded-xl"
                  />
                  <Input
                    value={row.role}
                    onChange={(e) =>
                      mutate((prev) => {
                        const next = [...prev.testimonials];
                        next[idx] = { ...next[idx]!, role: e.target.value };
                        return { ...prev, testimonials: next };
                      })
                    }
                    placeholder="Rol / bedrijf"
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() =>
                    mutate((prev) => ({
                      ...prev,
                      testimonials: prev.testimonials.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  Verwijderen
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() =>
              mutate((prev) => ({
                ...prev,
                testimonials: [
                  ...prev.testimonials,
                  {
                    id: `t-${Date.now()}`,
                    quote: "",
                    name: "",
                    role: "",
                  },
                ],
              }))
            }
          >
            Testimonial toevoegen
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="cf-eyebrow text-[0.625rem]">Mijlpaal</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Checklist eerste klant
          </h2>
        </div>
        <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-muted/80 ring-1 ring-border/50 dark:ring-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
            style={{ width: `${firstDealProgress}%` }}
          />
        </div>
        <p className="mb-5 text-sm font-medium text-muted-foreground">
          {firstDealProgress}% klaar — ga zo door.
        </p>
        <div className="grid gap-3">
          {FIRST_DEAL.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                mutate((prev) => ({
                  ...prev,
                  checklist: {
                    ...prev.checklist,
                    [t.id]: !prev.checklist[t.id],
                  },
                }))
              }
              className={cn(
                "cf-transition flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium shadow-sm",
                data.checklist[t.id]
                  ? "border-primary/45 bg-primary/[0.12] ring-1 ring-primary/15 dark:bg-primary/[0.14]"
                  : "border-border/65 bg-card/60 hover:border-primary/20 hover:bg-muted/50 dark:bg-card/40",
              )}
            >
              {data.checklist[t.id] ? (
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
              ) : (
                <Circle className="size-5 shrink-0 text-muted-foreground" />
              )}
              {t.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
