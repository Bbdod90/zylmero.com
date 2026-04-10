"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { enterAnonymousDemo } from "@/actions/demo";

type ChatMsg =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      text: string;
      resultTitle: string;
      valueLine: string;
    };

function simulateResponse(userText: string): {
  reply: string;
  resultTitle: string;
  valueLine: string;
} {
  const t = userText.toLowerCase();
  if (/apk|keuring|mot|periodiek/i.test(t)) {
    return {
      reply: "Morgen 09:00 of 15:00 — wat past?",
      resultTitle: "Afspraak",
      valueLine: "€120 – €200",
    };
  }
  if (/band|winter|zomer|profiel|montage/i.test(t)) {
    return {
      reply: "Kunnen we donderdag inplannen? Stuur even je kenteken.",
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
  return {
    reply: "Dank je. Morgen 10:00 of 14:30 — wat wil je?",
    resultTitle: "Afspraak",
    valueLine: "€120 – €350",
  };
}

let idSeq = 0;
function nid() {
  idSeq += 1;
  return `m-${idSeq}`;
}

export function LandingInteractiveChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

    const userMsg: ChatMsg = { id: nid(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    let reply: string;
    let resultTitle: string;
    let valueLine: string;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: { branche: "lokaal servicebedrijf", prijsrange: "€120–€600" },
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        resultTitle?: string;
        valueLine?: string;
      };
      if (data.reply) {
        reply = data.reply;
        resultTitle = data.resultTitle || "Afspraak";
        valueLine = data.valueLine || "€120 – €600";
      } else {
        const s = simulateResponse(text);
        reply = s.reply;
        resultTitle = s.resultTitle;
        valueLine = s.valueLine;
      }
    } catch {
      const s = simulateResponse(text);
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
    }, 380);
  }

  return (
    <section className="border-b border-border/40 py-16 dark:border-white/[0.06] md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Demo</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Van bericht naar afspraak
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Stuur een korte aanvraag — zo zou je klant het sturen.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-lg scroll-mt-24">
          <div className="overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#0c0f14] shadow-[0_24px_56px_-28px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.06] dark:bg-[#080a0d]">
            <div className="flex items-center gap-3 border-b border-white/[0.08] bg-white/[0.04] px-4 py-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-inner">
                CF
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  CloserFlow · demo
                </p>
                <p className="text-xs text-muted-foreground">Antwoord binnen seconden</p>
              </div>
            </div>

            <div
              ref={messagesContainerRef}
              className="max-h-[min(420px,55vh)] space-y-3 overflow-y-auto overflow-x-hidden px-3 py-4 [overflow-anchor:none] sm:px-4"
              role="log"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-zinc-500">
                  Bijv.: &ldquo;Kunnen jullie morgen nog komen voor een lekkage?&rdquo;
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
                      <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-white/[0.08] bg-zinc-800/90 px-3.5 py-2.5 text-sm leading-relaxed text-zinc-100">
                        {m.text}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[88%] rounded-xl border border-white/[0.1] bg-white/[0.06] px-3.5 py-2 text-xs text-zinc-200">
                        <span className="font-medium text-primary">{m.resultTitle}</span>
                        <span className="mx-2 text-zinc-500">·</span>
                        <span className="tabular-nums text-zinc-300">~{m.valueLine}</span>
                      </div>
                    </div>
                  </div>
                ),
              )}

              {busy ? (
                <div className="flex justify-start pl-1">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-zinc-800/60 px-3 py-2 text-xs text-zinc-400">
                    <Loader2 className="size-3.5 animate-spin" />
                    Even geduld…
                  </div>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={onSubmit}
              className="border-t border-white/[0.08] bg-black/20 p-3 sm:p-4"
            >
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Typ een korte aanvraag…"
                  maxLength={400}
                  disabled={busy}
                  className={cn(
                    "h-12 min-h-[48px] flex-1 rounded-2xl border-white/10 bg-zinc-900/80 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-primary/40",
                  )}
                  autoComplete="off"
                  aria-label="Bericht aan demo-assistent"
                />
                <Button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="h-12 min-w-[52px] shrink-0 rounded-2xl px-4 font-bold shadow-lg shadow-primary/25"
                  aria-label="Verstuur bericht"
                >
                  <Send className="size-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base font-semibold sm:flex-1">
            <Link href="/signup">Start gratis proefperiode</Link>
          </Button>
          <form action={enterAnonymousDemo} className="sm:flex-1">
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-xl border-border/80 px-8 text-base font-semibold"
            >
              Bekijk hoe het werkt
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
