"use client";

import { useMemo, useState, useTransition } from "react";
import { completeOnboardingAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { NICHE_SELECT_OPTIONS, type NicheId } from "@/lib/niches";
import { CheckCircle2 } from "lucide-react";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "mail", label: "Mail" },
  { id: "website", label: "Website" },
  { id: "instagram", label: "Instagram" },
] as const;

const RESPONSE = [
  { id: "direct", label: "Direct" },
  { id: "hours", label: "Uren" },
  { id: "day", label: "Een dag" },
] as const;

function monthlyLeak(avg: number, response: string) {
  const m = response === "day" ? 0.55 : response === "hours" ? 0.35 : 0.2;
  const raw = Math.round(avg * 18 * m);
  return Math.min(5000, Math.max(2000, raw));
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [niche, setNiche] = useState<NicheId>("garage");
  const [nicheCustom, setNicheCustom] = useState("");
  const [channels, setChannels] = useState<Set<string>>(new Set(["whatsapp"]));
  const [avgOrder, setAvgOrder] = useState("250");
  const [response, setResponse] = useState("hours");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="w-full max-w-xl space-y-8">
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Dit levert jou direct geld op</p>
            <p className="mt-1">In 5 stappen zie je hoeveel omzet je nu laat liggen — en activeer je CloserFlow.</p>
          </div>
        </div>
      </div>

      <Card className="border-border/70 bg-card/80 shadow-xl">
        <CardHeader className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Stap {step + 1} van {steps}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
              style={{ width: `${((step + 1) / steps) * 100}%` }}
            />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">CloserFlow activeren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="co">Bedrijfsnaam</Label>
                <Input
                  id="co"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <Label>Type bedrijf</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {NICHE_SELECT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNiche(opt.id)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                      niche === opt.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    {opt.uiLabel}
                  </button>
                ))}
              </div>
              {niche === "other" ? (
                <div className="space-y-2">
                  <Label htmlFor="nc">Kort je branche</Label>
                  <Input
                    id="nc"
                    value={nicheCustom}
                    onChange={(e) => setNicheCustom(e.target.value)}
                    className="rounded-xl"
                    placeholder="Bijv. schilder"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-3">
              <Label>Kanalen</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {CHANNELS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleChannel(c.id)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                      channels.has(c.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-2">
              <Label htmlFor="avg">Gemiddelde orderwaarde (€)</Label>
              <Input
                id="avg"
                type="number"
                min={1}
                inputMode="numeric"
                value={avgOrder}
                onChange={(e) => setAvgOrder(e.target.value)}
                className="h-12 rounded-xl text-lg font-semibold tabular-nums"
              />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <Label>Huidige responstijd</Label>
              <div className="grid gap-2">
                {RESPONSE.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setResponse(r.id)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                      response === r.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4 rounded-2xl border border-primary/25 bg-primary/[0.07] p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">Je laat ongeveer</p>
              <p className="text-4xl font-extrabold tabular-nums text-primary">€{leak.toLocaleString("nl-NL")}</p>
              <p className="text-sm font-semibold text-foreground">per maand liggen</p>
              <p className="text-xs text-muted-foreground">Op basis van je orderwaarde en reactietijd — conservatieve schatting.</p>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex gap-3 pt-2">
            {step > 0 ? (
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setStep((s) => s - 1)} disabled={pending}>
                Terug
              </Button>
            ) : (
              <div className="flex-1" />
            )}
            {step < 4 ? (
              <Button
                type="button"
                className="flex-1 rounded-xl"
                disabled={
                  (step === 0 && (!companyName.trim() || (niche === "other" && !nicheCustom.trim()))) ||
                  pending
                }
                onClick={() => setStep((s) => Math.min(4, s + 1))}
              >
                Verder
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1 rounded-xl font-bold"
                disabled={pending || !companyName.trim() || (niche === "other" && !nicheCustom.trim())}
                onClick={submit}
              >
                {pending ? "Activeren…" : "Activeer CloserFlow"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
