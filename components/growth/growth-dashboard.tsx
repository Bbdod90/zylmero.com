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
    <div className="space-y-14 lg:space-y-16">
      <Card className="cf-dashboard-panel overflow-hidden rounded-2xl border-primary/22 bg-gradient-to-br from-primary/[0.06] via-card to-card dark:from-primary/[0.09] dark:via-card dark:to-[hsl(222_26%_6%)]">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 border-b border-border/40 pb-6 sm:p-8 dark:border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/15">
              <Rocket className="size-5" />
            </div>
            <div>
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Modus
              </p>
              <CardTitle className="mt-0.5 text-xl font-semibold tracking-tight">
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

      <section className="border-b border-border/35 pb-14 dark:border-white/[0.06]">
        <div className="mb-6 flex items-end gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <Target className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Focus
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Acties voor vandaag
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Vink af wat je gedaan hebt — lokaal in je browser, niet op de server.
            </p>
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
                "cf-transition flex items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-sm font-medium shadow-sm transition-colors",
                data.dailyTasks[t.id]
                  ? "border-primary/40 bg-primary/[0.1] shadow-sm ring-1 ring-primary/12 dark:bg-primary/[0.12]"
                  : "border-border/60 bg-muted/[0.08] hover:border-primary/25 hover:bg-muted/25 dark:bg-card/50 dark:hover:bg-white/[0.04]",
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

      <section className="border-b border-border/35 pb-14 dark:border-white/[0.06]">
        <div className="mb-6">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Pipeline
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Pijplijn (handmatig)</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Tel je outreach bij — los van CRM-statussen. Handig tijdens acquisitiedagen.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_KEYS.map(({ key, label }) => (
            <Card key={key} className="cf-dashboard-panel rounded-xl">
              <CardHeader className="border-b border-border/35 pb-3 pt-5 dark:border-white/[0.06]">
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
              </CardHeader>
              <CardContent className="flex items-center gap-2 pt-4">
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
                <span className="flex-1 text-center text-3xl font-bold tabular-nums tracking-tight text-foreground">
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

      <section className="border-b border-border/35 pb-14 dark:border-white/[0.06]">
        <div className="mb-2">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Outreach
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Scripts</h2>
        </div>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Kopiëren, [haken] invullen, versturen. Blijf menselijk — één gesprek tegelijk.
        </p>
        <div className="space-y-5">
          {OUTREACH_SCRIPTS.map((s) => (
            <Card key={s.id} className="cf-dashboard-panel overflow-hidden rounded-xl">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 border-b border-border/40 pb-3 dark:border-white/[0.06]">
                <CardTitle className="text-base font-semibold">{s.label}</CardTitle>
                <CopyButton text={s.body} />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="rounded-lg border border-border/50 bg-[hsl(222_47%_6%/0.03)] px-4 py-4 font-mono text-[0.8125rem] leading-relaxed text-foreground/90 shadow-inner-soft dark:border-white/[0.07] dark:bg-black/25">
                  <div className="whitespace-pre-wrap text-muted-foreground">{s.body}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-b border-border/35 pb-14 dark:border-white/[0.06]">
        <div className="mb-6">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Acquisitie
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Hoe je klanten vindt
          </h2>
        </div>
        <Card className="cf-dashboard-panel overflow-hidden rounded-xl">
          <CardContent className="space-y-5 p-6 sm:p-7">
            <div>
              <p className="text-sm font-semibold text-foreground">Zoekwoorden</p>
              <p className="mt-2 flex flex-wrap gap-2">
                {LEAD_FINDER_KEYWORDS.map((k) => (
                  <span
                    key={k}
                    className="rounded-lg border border-border/55 bg-muted/25 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm dark:border-white/[0.08] dark:bg-white/[0.05]"
                  >
                    {k}
                  </span>
                ))}
              </p>
            </div>
            <Separator className="bg-border/50" />
            <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
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

      <section className="border-b border-border/35 pb-14 dark:border-white/[0.06]">
        <div className="mb-6">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Delen
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Demo-link generator
          </h2>
        </div>
        <Card className="cf-dashboard-panel overflow-hidden rounded-xl">
          <CardContent className="space-y-4 p-6 sm:p-7">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Deel deze link — opent het product in demo-modus (zonder login).
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-lg font-semibold"
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

      <section className="border-b border-border/35 pb-14 dark:border-white/[0.06]">
        <div className="mb-6">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Onboarding
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Snelle setup voor klanten
          </h2>
        </div>
        <Card className="cf-dashboard-panel overflow-hidden rounded-xl">
          <CardContent className="p-6 sm:p-7">
            <form onSubmit={submitInvite} className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="biz">Bedrijfsnaam</Label>
                <Input
                  id="biz"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Naam van hun bedrijf"
                  className="rounded-lg"
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
                  className="rounded-lg"
                  required
                />
              </div>
              <Button
                type="submit"
                className="rounded-lg font-semibold shadow-sm"
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

      <section className="border-b border-border/35 pb-14 dark:border-white/[0.06]">
        <div className="mb-6">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Impact
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Omzet-snapshot
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Snel rekenen op basis van volume en kluswaarde — geen garantie, wel richting.
          </p>
        </div>
        <Card className="cf-dashboard-panel overflow-hidden rounded-xl border-primary/22 bg-gradient-to-br from-primary/[0.06] via-card to-card dark:from-primary/[0.09]">
          <CardContent className="grid gap-6 p-6 sm:p-7 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Leads per maand (inbound)</Label>
              <Input
                type="number"
                min={1}
                value={leadsMo}
                onChange={(e) => setLeadsMo(Number(e.target.value) || 0)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gemiddelde kluswaarde (€)</Label>
              <Input
                type="number"
                min={1}
                value={avgJob}
                onChange={(e) => setAvgJob(Number(e.target.value) || 0)}
                className="rounded-lg"
              />
            </div>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
              <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-5 dark:border-primary/30 dark:bg-primary/[0.08]">
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-primary">
                  Potentieel
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-primary sm:text-3xl">
                  ~€{roi.gained.toLocaleString("nl-NL")}
                </p>
                <p className="mt-1 text-xs font-medium text-primary/80">per maand extra (model)</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Snellere antwoorden + opvolging → hogere conversie (~18% van leadwaarde in dit model).
                </p>
              </div>
              <div className="rounded-xl border border-destructive/20 bg-destructive/[0.04] p-5 dark:border-destructive/25">
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-destructive">
                  Risico
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-destructive sm:text-3xl">
                  ~€{roi.lost.toLocaleString("nl-NL")}
                </p>
                <p className="mt-1 text-xs font-medium text-destructive/80">per maand &quot;lek&quot; zonder tool</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Geschat verlies door trage eerste reactie (~10% van leadwaarde).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-b border-border/35 pb-14 dark:border-white/[0.06]">
        <div className="mb-2">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Social proof
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Testimonial-builder
          </h2>
        </div>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Demo-citaten voor pitches — vrij bewerken; opgeslagen in deze browser.
        </p>
        <div className="space-y-5">
          {data.testimonials.map((row, idx) => (
            <Card key={row.id} className="cf-dashboard-panel overflow-hidden rounded-xl">
              <CardContent className="space-y-4 p-6 sm:p-7">
                <Textarea
                  value={row.quote}
                  onChange={(e) =>
                    mutate((prev) => {
                      const next = [...prev.testimonials];
                      next[idx] = { ...next[idx]!, quote: e.target.value };
                      return { ...prev, testimonials: next };
                    })
                  }
                  className="min-h-[88px] rounded-lg"
                />
                <div className="grid gap-3 sm:grid-cols-2">
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
                    className="rounded-lg"
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
                    className="rounded-lg"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
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
            className="rounded-lg font-semibold"
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
        <div className="mb-6">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Mijlpaal
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Checklist eerste klant
          </h2>
        </div>
        <div className="mb-3 h-3 overflow-hidden rounded-full bg-muted/70 ring-1 ring-border/45 dark:ring-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/75 transition-all duration-500"
            style={{ width: `${firstDealProgress}%` }}
          />
        </div>
        <p className="mb-6 text-sm font-medium text-muted-foreground">
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
                "cf-transition flex items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-sm font-medium shadow-sm transition-colors",
                data.checklist[t.id]
                  ? "border-primary/40 bg-primary/[0.1] ring-1 ring-primary/12 dark:bg-primary/[0.12]"
                  : "border-border/60 bg-muted/[0.08] hover:border-primary/25 hover:bg-muted/25 dark:bg-card/50 dark:hover:bg-white/[0.04]",
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
