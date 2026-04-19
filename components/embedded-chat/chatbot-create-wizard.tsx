"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  ChevronRight,
  Headphones,
  Loader2,
  Sprout,
  Sparkles,
  Tag,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { createEmbeddedChatbot, createEmbeddedChatbotFromWizard } from "@/actions/embedded-chatbots";
import type { WizardGoalId } from "@/lib/embedded-chat/wizard-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Phase = "choose" | "goal" | "website";

const GOALS: {
  id: WizardGoalId;
  title: string;
  hint: string;
  icon: typeof Headphones;
}[] = [
  {
    id: "support",
    title: "Klantenservice",
    hint: "Helpt bij vragen en problemen — menselijk en duidelijk.",
    icon: Headphones,
  },
  {
    id: "assistant",
    title: "Merkbuddy",
    hint: "Alles over je bedrijf: diensten, prijzen, bereikbaarheid.",
    icon: Bot,
  },
  {
    id: "sales",
    title: "Verkoop",
    hint: "Klanten helpen kiezen en naar een afspraak werken.",
    icon: Tag,
  },
  {
    id: "custom",
    title: "Eigen invulling",
    hint: "Je verfijnt daarna zelf de instructies.",
    icon: Layers,
  },
];

/** Subtiele dot-grid zoals bij flow-builders */
function DotCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-[calc(100dvh-9rem)] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950 sm:min-h-[calc(100dvh-8rem)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)`,
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-[inherit] max-w-lg flex-col px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
        {children}
      </div>
    </div>
  );
}

export function ChatbotCreateWizard() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("choose");
  const [goal, setGoal] = useState<WizardGoalId | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const goBack = useCallback(() => {
    setError(null);
    if (phase === "website") setPhase("goal");
    else if (phase === "goal") setPhase("choose");
  }, [phase]);

  const onScratch = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const r = await createEmbeddedChatbot();
      if (r.ok) router.push(`/dashboard/chatbots/${r.id}`);
      else setError(r.error);
    });
  }, [router]);

  const onWizardFinish = useCallback(() => {
    if (!goal) return;
    setError(null);
    startTransition(async () => {
      const r = await createEmbeddedChatbotFromWizard({
        goal,
        websiteUrl: websiteUrl.trim() || null,
      });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      const q = new URLSearchParams();
      q.set("wizard", "1");
      if (r.warning) q.set("note", "url");
      router.push(`/dashboard/chatbots/${r.id}?${q.toString()}`);
    });
  }, [goal, router, websiteUrl]);

  const progressDots =
    phase === "goal" ? [true, false] : phase === "website" ? [true, true] : [false, false];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl text-muted-foreground" asChild>
          <Link href="/dashboard/chatbots">
            <ArrowLeft className="size-4" aria-hidden />
            Alle chatbots
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground" asChild>
          <Link href="/dashboard/chatbots">Overslaan</Link>
        </Button>
      </div>

      <DotCanvas>
        {phase !== "choose" ? (
          <div className="mb-8 flex justify-center gap-2">
            {progressDots.map((on, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  on ? "bg-primary shadow-[0_0_12px_theme(colors.primary)]" : "bg-white/15",
                )}
              />
            ))}
          </div>
        ) : null}

        {phase === "choose" ? (
          <>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Kies een optie
            </h1>
            <p className="mt-2 text-center text-sm leading-relaxed text-zinc-400">
              Begeleide opstart is het snelst. Zelf instellen geeft je meteen een lege bot om te tweaken.
            </p>

            <div className="mt-10 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setPhase("goal")}
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.08] bg-zinc-900/80 p-5 text-left shadow-lg transition-all hover:border-primary/35 hover:bg-zinc-900"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                  <Sparkles className="size-6" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">Begeleide opstart</span>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-emerald-400">
                      Aanbevolen
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-zinc-400">Snel klaar — doel kiezen, website toevoegen, bot live.</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-zinc-300" />
              </button>

              <button
                type="button"
                onClick={() => !pending && onScratch()}
                disabled={pending}
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 text-left transition-all hover:border-white/15 hover:bg-zinc-900/90 disabled:opacity-60"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-300 ring-1 ring-white/[0.08]">
                  {pending ? <Loader2 className="size-6 animate-spin" /> : <Sprout className="size-6" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold text-white">Zelf instellen</span>
                  <span className="mt-1 block text-sm text-zinc-400">Lege bot met standaardteksten — jij past alles aan.</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-zinc-500 group-hover:translate-x-0.5 group-hover:text-zinc-300" />
              </button>
            </div>
          </>
        ) : null}

        {phase === "goal" ? (
          <>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Wat moet je bot doen?
            </h1>
            <p className="mt-2 text-center text-sm text-zinc-400">We zetten goede startteksten voor je klaar — je kunt alles later aanpassen.</p>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const selected = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={cn(
                      "flex flex-col rounded-2xl border p-4 text-left transition-all",
                      selected
                        ? "border-primary/50 bg-primary/[0.12] shadow-[0_0_0_1px_theme(colors.primary/0.35)]"
                        : "border-white/[0.08] bg-zinc-900/70 hover:border-white/18",
                    )}
                  >
                    <Icon className={cn("mb-3 size-6", selected ? "text-primary" : "text-zinc-400")} aria-hidden />
                    <span className="font-semibold text-white">{g.title}</span>
                    <span className="mt-1 text-xs leading-relaxed text-zinc-400">{g.hint}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="outline" className="rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10" onClick={goBack}>
                Vorige
              </Button>
              <Button
                type="button"
                className="rounded-xl px-6"
                disabled={!goal}
                onClick={() => goal && setPhase("website")}
              >
                Volgende
              </Button>
            </div>
          </>
        ) : null}

        {phase === "website" ? (
          <>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Heb je een website?
            </h1>
            <p className="mt-2 text-center text-sm leading-relaxed text-zinc-400">
              We slaan je URL op als kennisbron — zo kan de bot beter antwoorden over jouw bedrijf. Optioneel.
            </p>

            <div className="mt-10 space-y-3">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">Website</label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://jouwdomein.nl"
                className="h-12 rounded-xl border-white/15 bg-zinc-900/90 text-base text-white placeholder:text-zinc-600"
              />
              <button
                type="button"
                className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
                onClick={() => setWebsiteUrl("")}
              >
                Ik heb geen website / liever niet
              </button>
            </div>

            {error ? <p className="mt-4 text-center text-sm text-red-400">{error}</p> : null}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="outline" className="rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10" onClick={goBack}>
                Vorige
              </Button>
              <Button type="button" className="rounded-xl px-6" disabled={pending || !goal} onClick={onWizardFinish}>
                {pending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    Bezig…
                  </>
                ) : (
                  "Bot aanmaken"
                )}
              </Button>
            </div>
          </>
        ) : null}

        {phase === "choose" && error ? <p className="mt-8 text-center text-sm text-red-400">{error}</p> : null}
      </DotCanvas>
    </div>
  );
}
