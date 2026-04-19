"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import {
  AnonymousDemoForm,
  useDemoRole,
} from "@/components/landing/demo-role-context";
import { DemoSituationMenu } from "@/components/landing/demo-situation-menu";
import { getLandingChatHints } from "@/lib/demo/hero-mock-copy";
import { getNicheConfig, type NicheId } from "@/lib/niches";
import type { RdwVehicleSnapshot } from "@/lib/rdw/kenteken";

type ChatMsg =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      text: string;
      resultTitle: string;
      valueLine: string;
    };

/** Alleen begroeting → geen model-call; voorkomt “banden om 10:00” zonder context. */
function isGreetingOnly(raw: string): boolean {
  const t = raw.toLowerCase().trim().replace(/[!?.…]+$/g, "").trim();
  if (t.length > 55) return false;
  if (
    /\b(apk|band|banden|voorband|achterband|rem|lek|lekkage|lekkende|afspraak|offerte|montage|winter|zomer|kenteken|auto|reparatie|klus|storing|install|verwarm|boiler|dak|stuc|schilder|loodgieter|knip|knippen|kapper|salon|kleur|balayage|tand|tandarts|gebit|kies|controle|bleken|mond|vulling)\b/i.test(
      t,
    )
  ) {
    return false;
  }
  return /^(hoi|hi|hey|hallo|yo|dag|hee|hé|goedemorgen|goedemiddag|goedenavond|goededag)(\s+(hoi|hi|hey|hallo|dag|daar|team|allemaal|ff))*$/i.test(
    t,
  );
}

function greetingReply(nicheId: NicheId): {
  reply: string;
  resultTitle: string;
  valueLine: string;
} {
  const cfg = getNicheConfig(nicheId);
  return {
    reply: `Hoi! Je bekijkt de demo als ${cfg.label}. Waarmee kan ik je helpen — afspraak, vraag of spoed?`,
    resultTitle: "Intake",
    valueLine: "—",
  };
}

function evChargingIntent(t: string): boolean {
  return /\b(laadpaal|laadpalen|wallbox|opladen|oplaad|thuislader|ev\b|elektrisch\s+auto|elektrische\s+auto|lader\b)\b/i.test(
    t,
  );
}

function confirmationFollowUp(t: string): boolean {
  return /\b(doen\s+jullie|doen\s+jullie\s+dat|kunnen\s+jullie(\s+dat)?|kan\s+dat|is\s+dat\s+mogelijk|maken\s+jullie\s+dat|jullie\s+dat)\b/i.test(
    t,
  );
}

function hasServiceKeyword(full: string, service: string): boolean {
  const s = service.toLowerCase();
  if (s.length < 3) return false;
  return full.toLowerCase().includes(s);
}

/** Volledige thread (user + assistant) — nodig om vervolg op eerdere bot-vraag te herkennen in offline-fallback. */
function buildTranscriptForSimulation(
  prior: ChatMsg[],
  latestUserText: string,
): string {
  return [...prior.map((m) => m.text), latestUserText].join("\n");
}

/**
 * Salon/kapper: tweede bericht met bijv. alleen knippen + tijd — niet opnieuw dezelfde intake-vraag.
 * Vereist dat `full` ook assistent-tekst bevat (transcript, niet alleen user-berichten).
 */
function beautySalonRefinement(full: string, last: string): boolean {
  const l = last.toLowerCase();
  const f = full.toLowerCase();
  if (!/\b(knip|knippen|kleur|baard|highlights|balayage|kapper|salon)\b/i.test(l)) return false;
  const assistantAlreadyAsked =
    /welke behandeling|welke dag of tijdstip|passend slot|zoek ik een passend/i.test(f);
  const hasPreference =
    /\b\d{1,2}\s*[:.h]\s*\d{2}\b/.test(l) ||
    /\b\d{4}\b/.test(l) ||
    /\b(rond|ongeveer|liever|als dat kan|uur|u\.)\b/i.test(l) ||
    /\b(morgen|vandaag|middag|ochtend|avond|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\b/i.test(l) ||
    /\balleen\s+(knippen|knip)\b/i.test(l);
  return assistantAlreadyAsked && hasPreference;
}

function simulateResponse(
  fullConversationText: string,
  nicheId: NicheId,
  opts?: { lastUserMessage?: string },
): {
  reply: string;
  resultTitle: string;
  valueLine: string;
} {
  const last = (opts?.lastUserMessage || fullConversationText).trim();
  const t = last.toLowerCase();
  const full = fullConversationText.toLowerCase();
  const cfg = getNicheConfig(nicheId);
  if (isGreetingOnly(last)) {
    return greetingReply(nicheId);
  }

  /** Auto-onderdeel / schade — ook als demo-rol "algemeen" staat (fallback zonder API). */
  const autoPartOrDamage =
    /\b(achterlicht|achterlichten|koplamp|mistlamp|remlicht|stadslicht|verlichting|ruit|ruiten|glas|\blamp\b|lampje|bumper|deuk)\b/i.test(
      t,
    ) ||
    (/\b(kapot|kapotte|stuk|gebroken|defect)\b/i.test(t) &&
      /\b(auto|kenteken|voertuig|wagen)\b/i.test(t));
  if (
    autoPartOrDamage &&
    (nicheId === "garage" ||
      nicheId === "general_services" ||
      nicheId === "trade_contractor")
  ) {
    return {
      reply:
        "Och, dat is vervelend — dat maken we gewoon voor je. Mag ik je kenteken? Dan weten we welk type achterlicht erop hoort en plannen we montage of bestellen we het onderdeel.",
      resultTitle: "Reparatie / onderdeel",
      valueLine: "Op aanvraag na kenteken",
    };
  }

  /** Korte bevestiging na eerdere berichten — inhoudelijk antwoorden i.p.v. herhaling. */
  if (nicheId === "electrician" && confirmationFollowUp(t) && (evChargingIntent(full) || /\blaadpaal\b/i.test(full))) {
    const hasLaadpaalService = cfg.defaultServices.some((s) => /laadpaal/i.test(s));
    if (hasLaadpaalService) {
      return {
        reply:
          "Ja — laadpalen en wallboxen installeren doen we gewoon. We kunnen kort een inspectie/planning inplannen: welke week komt het beste uit, en gaat het om nieuwbouw of een bestaande meterkast?",
        resultTitle: "Laadpaal / installatie",
        valueLine: cfg.defaultPricingHints?.slice(0, 56) || "Op aanvraag",
      };
    }
  }

  if (nicheId === "electrician" && evChargingIntent(last)) {
    const diensten = cfg.defaultServices.slice(0, 4).join(", ");
    return {
      reply: `Top — een laadpaal thuis plannen doen we graag. Bij ons hoort o.a. ${diensten}. Ik plan het liefst een korte inspectie om de meterkast en het gewenste vermogen (bijv. 11 of 22 kW) mee te nemen — welke week past ongeveer?`,
      resultTitle: "Laadpaal",
      valueLine: cfg.defaultPricingHints?.slice(0, 56) || "Op aanvraag",
    };
  }
  if (/\b(tand|tandarts|gebit|kies|vulling|controle|bleken|mond)\b/i.test(t)) {
    return {
      reply:
        "Dat kan ik je helpen plannen. Is het spoed (pijn) of een reguliere controle? Welke dag of week komt het beste uit?",
      resultTitle: "Praktijk",
      valueLine: "€85 – €220",
    };
  }
  if (beautySalonRefinement(full, last)) {
    return {
      reply:
        "Helder — ik noteer dit zo en zoek een passend slot in de agenda. Ik bevestig het zo bij je; mag ik nog je voor- en achternaam voor de afspraak?",
      resultTitle: "Salon",
      valueLine: "€35 – €195",
    };
  }
  if (/\b(knip|knippen|kapper|salon|kleur|balayage|baard|highlights)\b/i.test(t)) {
    return {
      reply:
        "Top — welke behandeling wil je precies, en welke dag of tijdstip komt het beste uit? Dan zoek ik een passend slot.",
      resultTitle: "Salon",
      valueLine: "€35 – €195",
    };
  }
  if (/apk|keuring|mot|periodiek/i.test(t)) {
    return {
      reply: "Morgen 09:00 of 15:00 — wat past?",
      resultTitle: "Afspraak",
      valueLine: "€120 – €200",
    };
  }
  if (/lek|lekkage|lekkende/i.test(t) && /band|voorband|achterband|wiel/i.test(t)) {
    return {
      reply:
        "Dat is vervelend — een lek aan de band lossen we het liefst vandaag nog. Mag ik je kenteken? Dan koppelen we het goede wiel en plannen we korte inspectie of reparatie.",
      resultTitle: "Band / lek",
      valueLine: "€35 – €180",
    };
  }
  if (
    /\b(lekkage|loodgieter|douche|badkamer|keuken|riool|sanitair|langskomen|langskom)\b/i.test(t) ||
    (/\blekkage\b/i.test(t) && /\b(douche|bad|wc|keuken|goot|kraan)\b/i.test(t))
  ) {
    return {
      reply:
        "Helder — een lekkage pakken we liever vandaag nog aan. Morgenochtend kan ik een monteur tussen 08:00–12:00 inplannen, of wil je liever een kort belmoment straks? Mag ik je postcode of wijk voor de route?",
      resultTitle: "Spoed monteur",
      valueLine: "€95 – €340",
    };
  }
  if (/band|winter|zomer|profiel|montage/i.test(t)) {
    return {
      reply:
        "Prima — voor montage of bandwissel hebben we je kenteken nodig (dan weten we maat en type). Welke dag komt het beste uit?",
      resultTitle: "Afspraak",
      valueLine: "€280 – €420",
    };
  }
  if (/rem|remmen|tik|geluid|blok/i.test(t)) {
    return {
      reply: "Vandaag 15:00 vrij. Zal ik die vastzetten?",
      resultTitle: "Afspraak",
      valueLine: "€150 – €340",
    };
  }
  if (/airco|koeling|klimaat/i.test(t)) {
    return {
      reply: "Dinsdag of woensdag? Dan plan ik een check.",
      resultTitle: "Afspraak",
      valueLine: "€95 – €210",
    };
  }

  if (confirmationFollowUp(t) && cfg.defaultServices.some((s) => hasServiceKeyword(full, s))) {
    const hit = cfg.defaultServices.find((s) => hasServiceKeyword(full, s));
    return {
      reply: `Ja — ${hit ? `${hit.toLowerCase()} doen we` : "dat doen we"} graag. Zullen we een kort moment plannen of bel ik je zo terug met een voorstel?`,
      resultTitle: cfg.label,
      valueLine: cfg.defaultPricingHints?.slice(0, 56) || "Op aanvraag",
    };
  }

  const diensten =
    cfg.defaultServices.length > 0
      ? ` We doen o.a. ${cfg.defaultServices.slice(0, 4).join(", ")}.`
      : "";
  const q = cfg.ai.qualifyingQuestions;
  const variant = (fullConversationText.length + last.length) % 2;
  const followQ =
    variant === 0
      ? q.slice(0, 2).join(" ")
      : q.length > 1
        ? `${q[0]} ${q[q.length - 1]}`
        : q[0] || "Wat is handig qua planning?";
  return {
    reply: `Dank je!${diensten} ${followQ} Zo kunnen we snel iets passends inplannen.`,
    resultTitle: cfg.label,
    valueLine: cfg.defaultPricingHints?.slice(0, 56) || "Op aanvraag",
  };
}

let idSeq = 0;
function nid() {
  idSeq += 1;
  return `m-${idSeq}`;
}

export function LandingInteractiveChat() {
  const { demoRole } = useDemoRole();
  const chatHints = getLandingChatHints(demoRole);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
  }, [demoRole]);

  /** Alleen binnen de chat-scroll — instant i.p.v. smooth (voorkomt scroll-anker/jank op de pagina). */
  const scrollMessagesToEnd = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
  }, []);

  useEffect(() => {
    scrollMessagesToEnd();
  }, [messages, busy, scrollMessagesToEnd]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const transcriptForSimulation = buildTranscriptForSimulation(messages, text);

    const userMsg: ChatMsg = { id: nid(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    let reply: string;
    let resultTitle: string;
    let valueLine: string;

    try {
        const chat_history = messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.text,
        }));

        const allUserText = [...messages.filter((m) => m.role === "user").map((m) => m.text), text].join(
          " ",
        );

        let vehicle: RdwVehicleSnapshot | undefined;
        try {
          const rv = await fetch("/api/rdw/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: allUserText }),
          });
          const rvData = (await rv.json()) as { vehicle?: RdwVehicleSnapshot };
          if (rv.ok && rvData.vehicle) vehicle = rvData.vehicle;
        } catch {
          /* RDW optioneel */
        }

        const tireLeak =
          /\b(lekkage|lek)\b/i.test(allUserText) &&
          /\b(band|wiel|voorband|achterband)\b/i.test(allUserText);
        const plumbingHint =
          !tireLeak &&
          (/\b(douche|badkamer|keuken|loodgieter|riool|sanitair|wasbak|wc\b|toilet|vocht)\b/i.test(
            allUserText,
          ) ||
            (/\blekkage\b/i.test(allUserText) &&
              !/\b(apk|kenteken|auto|voertuig)\b/i.test(allUserText)));

        const autoHint =
          (!plumbingHint &&
            (/\b(band|banden|apk|kenteken|auto|voorband|achterband|montage|winterband|zomerband|rechter|linker|voertuig|garage|wiel|achterlicht|koplamp|mistlamp|remlicht|stadslicht|verlichting|ruit|ruiten|glas|\blamp\b|lampje|bumper|deuk|carrosserie|motor|accu|uitlaat)\b/i.test(
              allUserText,
            ) ||
              Boolean(vehicle))) ||
          tireLeak;
        const dentalHint = /\b(tand|tandarts|gebit|kies|vulling|controle|bleken|mond)\b/i.test(
          allUserText,
        );
        const beautyHint =
          /\b(knip|knippen|kapper|salon|kleur|balayage|baard|highlights)\b/i.test(allUserText);

        const baseCfg = getNicheConfig(demoRole);
        let branche = `${baseCfg.label}: ${baseCfg.description}`;
        let prijsrange =
          baseCfg.defaultPricingHints?.slice(0, 140) || "€45–€650 (richting afhankelijk van dienst)";

        if (autoHint) {
          branche = "garage / banden / autotechniek (kenteken kan via RDW)";
          prijsrange = "€75–€550 (band/montage; exact na inspectie)";
        } else if (plumbingHint) {
          branche = "loodgieter / sanitair / service aan huis";
          prijsrange = "€95–€385 (spoed en werkbreedte)";
        } else if (dentalHint) {
          branche = "tandartspraktijk / mondhygiëne";
          prijsrange = "€85–€450 (afhankelijk van behandeling)";
        } else if (beautyHint) {
          branche = "kapsalon / barbershop";
          prijsrange = "€35–€220 (afhankelijk van behandeling)";
        }

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            landing_demo: true,
            demo_niche: demoRole,
            chat_history,
            context: {
              branche,
              prijsrange,
              vehicle,
            },
          }),
        });
        const data = (await res.json()) as {
          reply?: string;
          resultTitle?: string;
          valueLine?: string;
          error?: string;
          hint?: string;
        };
        const openAiMissing = res.status === 503 || data.error === "Geen AI";

        if (res.ok && data.reply && String(data.reply).trim()) {
          reply = data.reply;
          resultTitle = data.resultTitle || "Afspraak";
          valueLine = data.valueLine || "€120 – €600";
        } else if (openAiMissing) {
          reply = [
            "Op deze omgeving is nog geen OpenAI-koppeling actief, daarom kan de slimme demo niet op het model draaien.",
            data.hint ||
              "Voeg OPENAI_API_KEY toe aan je .env.local (zie .env.example), zet eventueel OPENAI_MODEL (bijv. gpt-4o-mini) en herstart de dev-server.",
            "Daarna reageert deze chat per gekozen branche — elektricien, tandarts, garage enz. — met echte vakcontext in plaats van vaste voorbeeldzinnen.",
          ].join(" ");
          resultTitle = "OpenAI vereist";
          valueLine = "—";
        } else {
          const s = simulateResponse(transcriptForSimulation, demoRole, { lastUserMessage: text });
          reply = s.reply;
          resultTitle = s.resultTitle;
          valueLine = s.valueLine;
        }
    } catch {
      const s = simulateResponse(transcriptForSimulation, demoRole, { lastUserMessage: text });
      reply = s.reply;
      resultTitle = s.resultTitle;
      valueLine = s.valueLine;
    }

    window.setTimeout(() => {
      const bot: ChatMsg = {
        id: nid(),
        role: "assistant",
        text: reply,
        resultTitle,
        valueLine,
      };
      setMessages((prev) => [...prev, bot]);
      setBusy(false);
    }, 45);
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/30 py-16 md:py-24 dark:border-white/[0.06]",
        "bg-gradient-to-b from-muted/25 via-muted/10 to-transparent dark:from-white/[0.035] dark:via-transparent dark:to-transparent",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(520px,70%)] bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.14),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.18),transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Live demo</p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {chatHints.sectionTitle}
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-muted-foreground md:text-lg">
            {chatHints.sectionSub}
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl scroll-mt-24">
          <div
            className="pointer-events-none absolute -inset-5 rounded-[1.65rem] bg-[radial-gradient(ellipse_at_45%_30%,hsl(var(--primary)/0.26),transparent_62%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_45%_28%,hsl(var(--primary)/0.32),transparent_65%)]"
            aria-hidden
          />
          <div
            className={cn(
              "relative overflow-hidden rounded-[1.35rem] border border-border/55 bg-card text-foreground shadow-[0_34px_100px_-44px_rgb(0_0_0/0.72)] ring-1 ring-black/[0.05]",
              "dark:border-white/[0.11] dark:bg-[hsl(228_26%_8%/0.96)] dark:shadow-black/60 dark:ring-white/[0.06]",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 border-b px-3 py-3 sm:gap-3 sm:px-4",
                "border-border/60 bg-gradient-to-b from-muted/50 to-muted/15",
                "dark:border-white/[0.08] dark:from-white/[0.06] dark:to-transparent",
              )}
            >
              <div className="flex gap-1.5 pl-0.5 opacity-70">
                <span className="size-2.5 rounded-full bg-red-500/80" aria-hidden />
                <span className="size-2.5 rounded-full bg-amber-400/90" aria-hidden />
                <span className="size-2.5 rounded-full bg-emerald-500/75" aria-hidden />
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-inner">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground dark:text-white">
                  {BRAND_NAME} · demo
                </p>
                <p className="text-xs text-muted-foreground dark:text-white/65">
                  Zo snel antwoord je straks ook op echte klanten
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-foreground dark:text-white">
                  Branche
                </span>
                <DemoSituationMenu variant="compact" align="end" />
              </div>
            </div>

            <div
              ref={messagesContainerRef}
              className={cn(
                "max-h-[min(420px,55vh)] space-y-3 overflow-y-auto overflow-x-hidden px-3 py-4 [overflow-anchor:none] sm:px-4",
                "bg-muted/10 dark:bg-transparent",
              )}
              role="log"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm leading-relaxed text-foreground dark:text-white">
                  {chatHints.emptyExamples}
                </p>
              ) : null}

              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="space-y-2">
                    <div className="flex justify-start">
                      <div
                        className={cn(
                          "max-w-[88%] rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-sm leading-relaxed",
                          "border-border/70 bg-background text-foreground shadow-sm",
                          "dark:border-white/[0.08] dark:bg-zinc-800/90 dark:text-white",
                        )}
                      >
                        {m.text}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div
                        className={cn(
                          "max-w-[88%] rounded-xl border px-3.5 py-2 text-xs",
                          "border-border/60 bg-muted/50 text-foreground",
                          "dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white",
                        )}
                      >
                        <span className="font-medium text-foreground dark:text-white">{m.resultTitle}</span>
                        <span className="mx-2 text-foreground dark:text-white">·</span>
                        <span className="tabular-nums text-foreground dark:text-white">~{m.valueLine}</span>
                      </div>
                    </div>
                  </div>
                ),
              )}

              {busy ? (
                <div className="flex justify-start pl-1">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs",
                      "border-border/60 bg-muted/40 text-foreground",
                      "dark:border-white/[0.06] dark:bg-zinc-800/60 dark:text-white",
                    )}
                  >
                    <Loader2 className="size-3.5 animate-spin" />
                    Even geduld…
                  </div>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={onSubmit}
              className={cn(
                "border-t p-3 sm:p-4",
                "border-border/60 bg-muted/25",
                "dark:border-white/[0.08] dark:bg-black/25",
              )}
            >
              <div className="mb-3 flex flex-wrap gap-2">
                {chatHints.quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={busy}
                    onClick={() => setInput(prompt)}
                    className={cn(
                      "rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-left text-[0.8125rem] leading-snug text-foreground transition-colors",
                      "hover:border-primary/35 hover:bg-primary/[0.06]",
                      "disabled:pointer-events-none disabled:opacity-50",
                      "dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:hover:border-primary/40",
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={chatHints.inputPlaceholder}
                  maxLength={400}
                  disabled={busy}
                  className={cn(
                    "h-14 min-h-[56px] flex-1 rounded-2xl text-base focus-visible:ring-primary/40",
                    "border-border/80 bg-background text-foreground placeholder:text-muted-foreground",
                    "dark:border-white/10 dark:bg-zinc-900/80 dark:text-white dark:placeholder:text-white",
                  )}
                  autoComplete="off"
                  aria-label="Bericht aan demo-assistent"
                />
                <Button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="h-14 min-w-[56px] shrink-0 rounded-2xl px-5 font-bold shadow-lg shadow-primary/25"
                  aria-label="Verstuur bericht"
                >
                  <Send className="size-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative mx-auto mt-12 flex max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base font-semibold sm:flex-1">
            <Link href="/signup">Start gratis</Link>
          </Button>
          <AnonymousDemoForm className="sm:flex-1">
            <Button type="submit" variant="demo" size="lg" className="h-12 w-full rounded-xl px-8 text-base font-semibold">
              Bekijk demo
            </Button>
          </AnonymousDemoForm>
        </div>
      </div>
    </section>
  );
}
