"use client";

import { useMemo, useState, useTransition } from "react";
import {
  completeOnboardingAction,
  skipOnboardingWizardAction,
} from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { NICHE_SELECT_OPTIONS, type NicheId } from "@/lib/niches";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Euro,
  Hourglass,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", hint: "Meest gebruikt voor snelle vragen" },
  { id: "mail", label: "E-mail", hint: "Offertes & formele aanvragen" },
  { id: "website", label: "Website", hint: "Contactformulier of chat" },
  { id: "instagram", label: "Instagram", hint: "DM’s en story-replies" },
] as const;

const WEEKLY_LEADS = [
  { id: "1-5", label: "1 – 5", sub: "Rustig tempo" },
  { id: "6-15", label: "6 – 15", sub: "Regelmatig" },
  { id: "16-30", label: "16 – 30", sub: "Druk" },
  { id: "30+", label: "30+", sub: "Heel druk" },
] as const;

const TEAM_SIZES = [
  { id: "solo", label: "Alleen ik", sub: "ZZP / eenmanszaak" },
  { id: "2-5", label: "2 – 5", sub: "Klein team" },
  { id: "6+", label: "6+", sub: "Groter team" },
] as const;

const RESPONSE = [
  {
    id: "direct",
    label: "Meestal dezelfde dag",
    sub: "Je reageert binnen een paar uur",
    icon: Zap,
  },
  {
    id: "hours",
    label: "Binnen een dag",
    sub: "Soms dezelfde dag, vaak volgende werkdag",
    icon: Hourglass,
  },
  {
    id: "day",
    label: "Vaak later",
    sub: "Meerdere dagen of bij gelegenheid",
    icon: CalendarDays,
  },
] as const;

function monthlyLeak(avg: number, response: string) {
  const m = response === "day" ? 0.55 : response === "hours" ? 0.35 : 0.2;
  const raw = Math.round(avg * 18 * m);
  return Math.min(5000, Math.max(2000, raw));
}

const STEP_HEADINGS = [
  "Je bedrijf",
  "Je kanalen",
  "Omzet & drukte",
  "Reactiesnelheid",
  "Jouw kans",
] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [niche, setNiche] = useState<NicheId>("garage");
  const [nicheCustom, setNicheCustom] = useState("");
  const [channels, setChannels] = useState<Set<string>>(new Set(["whatsapp"]));
  const [avgOrder, setAvgOrder] = useState("250");
  const [weeklyBand, setWeeklyBand] = useState<(typeof WEEKLY_LEADS)[number]["id"]>("6-15");
  const [teamSize, setTeamSize] = useState<(typeof TEAM_SIZES)[number]["id"]>("solo");
  const [painNote, setPainNote] = useState("");
  const [response, setResponse] = useState("hours");
  const [pending, start] = useTransition();
  const [skipPending, startSkip] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [skipError, setSkipError] = useState<string | null>(null);

  const leak = useMemo(
    () => monthlyLeak(Number(avgOrder) || 0, response),
    [avgOrder, response],
  );

  const steps = 5;

  function toggleChannel(id: string) {
    setChannels((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function submit() {
    setError(null);
    const fd = new FormData();
    fd.set("onboarding_flow", "conversion_v5");
    fd.set("company_name", companyName.trim());
    fd.set("niche_key", niche);
    if (niche === "other") fd.set("niche_custom", nicheCustom.trim());
    fd.set("avg_order_eur", String(Number(avgOrder) || 0));
    fd.set("response_time", response);
    fd.set("intake_weekly_leads_band", weeklyBand);
    fd.set("intake_team_size", teamSize);
    fd.set("intake_pain_note", painNote.trim().slice(0, 400));
    for (const c of CHANNELS) {
      if (channels.has(c.id)) fd.set(`channel_${c.id}`, "on");
    }
    fd.set("services", "");
    fd.set("faq", "");
    fd.set("pricing_hints", "");
    fd.set("business_hours", "");
    fd.set("tone", "");
    fd.set("reply_style", "");
    fd.set("booking_link", "");
    fd.set("contact_email", "");
    fd.set("contact_phone", "");
    start(async () => {
      const res = await completeOnboardingAction({}, fd);
      if (res?.error) setError(res.error);
    });
  }

  function skipWizard() {
    setSkipError(null);
    startSkip(async () => {
      const res = await skipOnboardingWizardAction();
      if (res?.error) setSkipError(res.error);
    });
  }

  const canStep0 = companyName.trim() && (niche !== "other" || nicheCustom.trim());
  const canStep2 = Number(avgOrder) > 0;
  const canStep1 = channels.size > 0;

  return (
    <div className="w-full max-w-xl space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-primary/[0.05] to-transparent p-5 shadow-sm">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Dit levert jou direct geld op</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              In vijf korte stappen zie je waar je omzet blijft liggen — daarna richten we {BRAND_NAME} voor je
              in.
            </p>
            <div className="mt-4 flex flex-col gap-2 border-t border-primary/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Liever direct verder? Je vult bedrijfsgegevens later in bij Instellingen.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 rounded-lg border-border/80"
                disabled={pending || skipPending}
                onClick={skipWizard}
              >
                {skipPending ? "Bezig…" : "Overslaan — naar dashboard"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {skipError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {skipError}
        </div>
      ) : null}

      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-2xl shadow-black/20">
        <CardHeader className="space-y-4 border-b border-border/50 bg-muted/20 px-6 pb-5 pt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Stap {step + 1} / {steps}
            </p>
            <p className="text-xs font-medium text-primary">{STEP_HEADINGS[step]}</p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / steps) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-7">
          {step === 0 ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="co" className="text-base">
                  Bedrijfsnaam
                </Label>
                <Input
                  id="co"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-12 rounded-xl border-border/80 text-base"
                  placeholder="Bijv. De Schildershoek"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Wat voor bedrijf run je?</Label>
                <p className="text-xs text-muted-foreground">Zo passen we voorbeelden en taal aan.</p>
                <div className="grid max-h-[min(52vh,420px)] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {NICHE_SELECT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNiche(opt.id)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all",
                        niche === opt.id
                          ? "border-primary bg-primary/12 text-primary shadow-sm ring-1 ring-primary/20"
                          : "border-border/70 text-muted-foreground hover:border-border hover:bg-muted/50",
                      )}
                    >
                      {opt.uiLabel}
                    </button>
                  ))}
                </div>
              </div>
              {niche === "other" ? (
                <div className="space-y-2">
                  <Label htmlFor="nc">Jouw branche (kort)</Label>
                  <Input
                    id="nc"
                    value={nicheCustom}
                    onChange={(e) => setNicheCustom(e.target.value)}
                    className="rounded-xl"
                    placeholder="Bijv. stukadoor, schoonmaak, coach"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-3">
              <div>
                <Label className="text-base">Waar komen aanvragen binnen?</Label>
                <p className="mt-1 text-sm text-muted-foreground">Meerdere opties mogelijk.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {CHANNELS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleChannel(c.id)}
                    className={cn(
                      "flex flex-col gap-1 rounded-2xl border px-4 py-4 text-left transition-all",
                      channels.has(c.id)
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/25"
                        : "border-border/70 hover:bg-muted/40",
                    )}
                  >
                    <span className="font-semibold text-foreground">{c.label}</span>
                    <span className="text-xs text-muted-foreground">{c.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Euro className="size-4" />
                  </div>
                  <div>
                    <Label htmlFor="avg" className="text-base">
                      Gemiddelde orderwaarde
                    </Label>
                    <p className="text-xs text-muted-foreground">Typische factuur of opdracht (€).</p>
                  </div>
                </div>
                <Input
                  id="avg"
                  type="number"
                  min={1}
                  inputMode="decimal"
                  value={avgOrder}
                  onChange={(e) => setAvgOrder(e.target.value)}
                  className="h-14 rounded-2xl border-border/80 text-2xl font-bold tabular-nums tracking-tight"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <Label className="text-base">Hoeveel aanvragen per week?</Label>
                    <p className="text-xs text-muted-foreground">Schatting is genoeg — voor je omzet-inschatting.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {WEEKLY_LEADS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWeeklyBand(w.id)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-left transition-all",
                        weeklyBand === w.id
                          ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                          : "border-border/70 hover:bg-muted/40",
                      )}
                    >
                      <p className="text-sm font-bold tabular-nums">{w.label}</p>
                      <p className="text-[11px] text-muted-foreground">{w.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <Label className="text-base">Hoe groot is je team?</Label>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {TEAM_SIZES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTeamSize(t.id)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-left transition-all",
                        teamSize === t.id
                          ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                          : "border-border/70 hover:bg-muted/40",
                      )}
                    >
                      <p className="text-sm font-semibold">{t.label}</p>
                      <p className="text-[11px] text-muted-foreground">{t.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pain">Waar loop je nu tegenaan? (optioneel)</Label>
                <Textarea
                  id="pain"
                  value={painNote}
                  onChange={(e) => setPainNote(e.target.value)}
                  maxLength={400}
                  rows={3}
                  placeholder="Bijv. te laat antwoorden ’s avonds, offertes die blijven liggen…"
                  className="min-h-[88px] resize-none rounded-xl border-border/80 text-sm"
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Clock className="size-5" />
                </div>
                <div>
                  <Label className="text-base">Hoe snel reageer jij nu op nieuwe aanvragen?</Label>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Geen oordeel — we gebruiken dit om je <strong className="font-medium text-foreground">winstlek</strong>{" "}
                    te berekenen en later tips te geven.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {RESPONSE.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setResponse(r.id)}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-all sm:px-5 sm:py-5",
                        response === r.id
                          ? "border-primary bg-primary/[0.09] shadow-md ring-2 ring-primary/25"
                          : "border-border/70 hover:border-border hover:bg-muted/30",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl",
                          response === r.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="font-semibold text-foreground">{r.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{r.sub}</p>
                      </div>
                      {response === r.id ? (
                        <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/[0.14] to-transparent px-6 py-8 text-center">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.2),transparent_55%)]" />
                <p className="relative text-sm font-medium text-muted-foreground">Geschat omzet dat nu blijft liggen</p>
                <p className="relative mt-2 text-5xl font-black tabular-nums tracking-tight text-primary">
                  €{leak.toLocaleString("nl-NL")}
                </p>
                <p className="relative mt-1 text-sm font-medium text-foreground">per maand</p>
                <p className="relative mx-auto mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  Conservatieve inschatting op basis van je orderwaarde en reactietijd — veel ondernemers pakken
                  sneller terug met {BRAND_NAME}.
                </p>
              </div>
              <ul className="space-y-2 rounded-xl border border-border/60 bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>
                    Order ~€{Number(avgOrder) || 0} · {WEEKLY_LEADS.find((w) => w.id === weeklyBand)?.label}{" "}
                    aanvragen/wk
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Reactie: {RESPONSE.find((r) => r.id === response)?.label}</span>
                </li>
              </ul>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl border-border/80"
                onClick={() => setStep((s) => s - 1)}
                disabled={pending}
              >
                Terug
              </Button>
            ) : (
              <div className="hidden flex-1 sm:block" />
            )}
            {step < 4 ? (
              <Button
                type="button"
                className="flex-1 rounded-xl font-semibold shadow-lg shadow-primary/20"
                disabled={
                  pending ||
                  (step === 0 && !canStep0) ||
                  (step === 1 && !canStep1) ||
                  (step === 2 && !canStep2)
                }
                onClick={() => setStep((s) => Math.min(4, s + 1))}
              >
                Verder
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/25"
                disabled={pending || !canStep0}
                onClick={submit}
              >
                {pending ? "Account aanmaken…" : `${BRAND_NAME} activeren`}
              </Button>
            )}
          </div>
          {step >= 1 && step <= 3 ? (
            <div className="text-center">
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                disabled={pending || !canStep0}
                onClick={() => setStep(4)}
              >
                Stappen 2–4 overslaan — gebruik standaardwaarden
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
