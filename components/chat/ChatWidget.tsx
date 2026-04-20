"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ChatWidgetBubble = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function nid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export type ChatWidgetProps = {
  chatbotId: string;
  /** Persistent sessie (bijv. widget op externe site). */
  storageKey?: string;
  apiPath?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  className?: string;
  /** Op dashboard: niet persistent tussen refreshes tenzij je een key zet */
  initialSessionId?: string | null;
};

export function ChatWidget({
  chatbotId,
  storageKey,
  apiPath = "/api/chat",
  title = "Preview",
  subtitle,
  placeholder = "Typ een bericht…",
  className,
  initialSessionId,
}: ChatWidgetProps) {
  const panelId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatWidgetBubble[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setSessionId(raw);
    } catch {
      /* private mode */
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !storageKey || !sessionId) return;
    try {
      window.localStorage.setItem(storageKey, sessionId);
    } catch {
      /* */
    }
  }, [storageKey, sessionId]);

  const scrollToEnd = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, busy, scrollToEnd]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || busy) return;
      setInput("");
      setError(null);
      setBusy(true);
      const userMsg: ChatWidgetBubble = { id: nid(), role: "user", content: text };
      setMessages((m) => [...m, userMsg]);

      try {
        const res = await fetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatbotId,
            message: text,
            sessionId: sessionId || undefined,
          }),
        });
        const data = (await res.json()) as { reply?: string; sessionId?: string; error?: string };
        if (!res.ok) {
          setError(data.error || "Versturen mislukt");
          setBusy(false);
          return;
        }
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
        const answer = String(data.reply || "").trim();
        if (answer) {
          setMessages((m) => [...m, { id: nid(), role: "assistant", content: answer }]);
        }
      } catch {
        setError("Netwerkfout — probeer opnieuw.");
      } finally {
        setBusy(false);
      }
    },
    [apiPath, busy, chatbotId, input, sessionId],
  );

  return (
    <div
      className={cn(
        "flex min-h-[22rem] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-foreground shadow-sm",
        "dark:border-white/[0.1] dark:bg-zinc-900/80",
        className,
      )}
    >
      <div
        className="border-b border-border/50 bg-muted/30 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.04]"
        id={panelId}
      >
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div
        ref={scrollRef}
        className="min-h-[12rem] flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4"
        role="log"
        aria-live="polite"
        aria-labelledby={panelId}
      >
        {messages.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted-foreground">
            Nog geen berichten — stel een vraag om de assistent te testen.
          </p>
        ) : null}
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[90%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-start">
              <div
                className={cn(
                  "max-w-[90%] rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-sm leading-relaxed",
                  "border-border/60 bg-background dark:border-white/[0.1] dark:bg-zinc-800/90",
                )}
              >
                {m.content}
              </div>
            </div>
          ),
        )}
        {busy ? (
          <div className="flex items-center gap-2 pl-1 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Bezig…
          </div>
        ) : null}
        {error ? (
          <div className="space-y-2 rounded-xl border border-destructive/25 bg-destructive/[0.06] px-3 py-2.5">
            <p className="text-sm leading-relaxed text-destructive">{error}</p>
            {/OPENAI_API_KEY|niet gekoppeld|op de server|OpenAI-plan|OpenAI-account|Billing|rate limit|api\/health/i.test(
              error,
            ) ? (
              <p className="text-2xs leading-relaxed text-muted-foreground">
                Voor beheerders: zet <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.65rem]">OPENAI_API_KEY</code> in
                je productie-omgeving (bijv. Vercel) en deploy opnieuw. Controleer ook{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.65rem]">/api/health</code> (OpenAI + uitgaand HTTPS).
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <form
        onSubmit={onSubmit}
        className="border-t border-border/50 bg-muted/20 p-3 dark:border-white/[0.08] dark:bg-black/20"
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="h-12 min-h-12 flex-1 rounded-xl border-border/60 bg-background text-base dark:bg-zinc-950/60"
            autoComplete="off"
            disabled={busy}
            maxLength={8000}
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 shrink-0 rounded-xl px-5"
            disabled={busy || !input.trim()}
          >
            <Send className="size-4" aria-hidden />
            <span className="sr-only">Verstuur</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
