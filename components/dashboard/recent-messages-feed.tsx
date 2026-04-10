"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type Item = {
  id: string;
  content: string;
  lead_name: string | null;
  created_at: string;
};

export function RecentMessagesFeed({ messages }: { messages: Item[] }) {
  const [pulse, setPulse] = useState(false);
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    if (messages.length === 0) return;
    const t = window.setInterval(() => {
      setHighlight((h) => (h + 1) % messages.length);
    }, 7000);
    return () => clearInterval(t);
  }, [messages.length]);

  useEffect(() => {
    const t = window.setInterval(() => setPulse(true), 38000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!pulse) return;
    const t = window.setTimeout(() => setPulse(false), 2400);
    return () => clearTimeout(t);
  }, [pulse]);

  if (messages.length === 0) {
    return (
      <p className="text-muted-foreground">
        Je AI staat klaar om nieuwe klanten op te vangen. Zodra er berichten
        binnenkomen, zie je ze hier in realtime.
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      {pulse ? (
        <div className="animate-in fade-in slide-in-from-top-1 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary duration-300">
          <Sparkles className="size-3.5 shrink-0 animate-pulse" />
          Nieuwe activiteit in je inbox — prioriteit bij hete leads
        </div>
      ) : null}
      {messages.map((msg, i) => (
        <div
          key={msg.id}
          className={`rounded-xl border px-4 py-3 transition-all duration-500 ${
            i === highlight
              ? "border-primary/25 bg-primary/[0.07] shadow-[0_0_20px_-8px_hsl(var(--primary)/0.4)]"
              : "border-white/[0.05] bg-background/30"
          }`}
        >
          <p className="text-[11px] font-medium text-foreground">
            {msg.lead_name || "Gesprek"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDateTime(msg.created_at)}
          </p>
          <p className="mt-2 line-clamp-2 text-muted-foreground">{msg.content}</p>
        </div>
      ))}
    </div>
  );
}
