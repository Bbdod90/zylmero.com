"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type ChatMsg = { id: string; role: "user" | "assistant"; text: string };

const QUICK_PROMPTS = [
  "Ik wil een afspraak maken",
  "Wat kost het?",
  "Wanneer hebben jullie plek?",
] as const;

let seq = 0;
function nid() {
  seq += 1;
  return `cb-${seq}`;
}

function botReply(userText: string): string {
  const t = userText.toLowerCase().trim();
  if (/afspraak|afspreken|planning|inplannen|maken|moment/.test(t)) {
    return "Prima. Welke dag of tijdstip komt bij je uit — bijvoorbeeld deze week nog, of liever volgende week? Dan plak ik een voorstel vast of geef ik meteen twee opties.";
  }
  if (/kost|prijs|€|euro|tarief|hoe duur|bedrag/.test(t)) {
    return "Dat hangt af van wat je precies nodig hebt. Als je kort beschrijft wat je wilt (bijv. type klus of behandeling), geef ik een eerlijke bandbreedte — zonder kleine lettertjes.";
  }
  if (/plek|tijd|wanneer|beschikbaar|open|vrij/.test(t)) {
    return "Komende week hebben we nog plek op woensdag en vrijdag. Heeft je voorkeur voor ochtend (bijv. 09–12) of middag (13–17)? Dan check ik het direct.";
  }
  return "Bedankt voor je bericht. Waar kan ik je mee verder helpen — een afspraak plannen, een prijsindicatie, of een concrete vraag over wat we voor je doen?";
}

export function ChatDemo({ className }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, busy, scrollToBottom]);

  function submitText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMsg = { id: nid(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    window.setTimeout(() => {
      const bot: ChatMsg = {
        id: nid(),
        role: "assistant",
        text: botReply(trimmed),
      };
      setMessages((prev) => [...prev, bot]);
      setBusy(false);
    }, 380);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitText(input);
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-[1.25rem] border border-border/55 bg-card shadow-[0_28px_80px_-40px_rgb(0_0_0/0.65)] ring-1 ring-black/[0.04] dark:border-white/[0.11] dark:bg-[hsl(228_26%_9%/0.96)] dark:shadow-black/55 dark:ring-white/[0.06]", className)}>
      <div className="flex items-center gap-2 border-b border-border/50 px-3 py-3 dark:border-white/[0.08] sm:gap-3 sm:px-4">
        <div className="flex gap-1.5 opacity-75">
          <span className="size-2.5 rounded-full bg-red-500/75" aria-hidden />
          <span className="size-2.5 rounded-full bg-amber-400/85" aria-hidden />
          <span className="size-2.5 rounded-full bg-emerald-500/70" aria-hidden />
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {BRAND_LOGO_MONOGRAM}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{BRAND_NAME} · voorbeeld</p>
          <p className="text-xs text-muted-foreground">Zo reageert je eigen chatbot op de site</p>
        </div>
      </div>

      <div
        className="max-h-[min(340px,48vh)] space-y-3 overflow-y-auto px-3 py-4 sm:px-4"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm leading-relaxed text-muted-foreground">
            Tik een bericht of kies een voorbeeld — je ziet meteen hoe een echte klant wordt opgevangen.
          </p>
        ) : null}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[90%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-start">
              <div
                className={cn(
                  "max-w-[90%] rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                  "border-border/65 bg-muted/40 text-foreground dark:border-white/[0.09] dark:bg-white/[0.06] dark:text-white",
                )}
              >
                {m.text}
              </div>
            </div>
          ),
        )}

        {busy ? (
          <div className="flex justify-start pl-0.5">
            <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground dark:border-white/[0.07] dark:bg-zinc-800/70">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              Even geduld…
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-border/50 bg-muted/20 p-3 dark:border-white/[0.08] dark:bg-black/20 sm:p-4"
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={busy}
              onClick={() => submitText(prompt)}
              className={cn(
                "rounded-full border border-border/55 bg-background/90 px-3 py-1.5 text-left text-[0.8125rem] leading-snug transition-colors",
                "hover:border-primary/35 hover:bg-primary/[0.06] disabled:pointer-events-none disabled:opacity-50",
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
            placeholder="Stel je vraag…"
            maxLength={400}
            disabled={busy}
            className={cn(
              "h-11 flex-1 rounded-xl text-sm",
              "border-border/80 bg-background dark:border-white/10 dark:bg-zinc-900/85",
            )}
            autoComplete="off"
            aria-label="Bericht aan de voorbeeldchatbot"
          />
          <Button
            type="submit"
            disabled={busy || !input.trim()}
            className="h-11 shrink-0 rounded-xl px-4 font-semibold shadow-md shadow-primary/20"
            aria-label="Verstuur"
          >
            <Send className="size-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
