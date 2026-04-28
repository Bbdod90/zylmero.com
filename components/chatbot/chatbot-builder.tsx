"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import { saveChatbotBuilderAction } from "@/actions/chatbot-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ChatbotRecord = {
  id: string;
  bedrijfs_omschrijving: string;
  website_url: string | null;
  extra_info: string | null;
  openingszin: string | null;
  settings: Record<string, unknown> | null;
  is_active: boolean;
};

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
};

function boolFromSettings(obj: Record<string, unknown> | null, key: string, fallback = true): boolean {
  const doelen = obj?.doelen;
  if (!doelen || typeof doelen !== "object") return fallback;
  const value = (doelen as Record<string, unknown>)[key];
  return typeof value === "boolean" ? value : fallback;
}

export function ChatbotBuilder({ chatbot }: { chatbot: ChatbotRecord }) {
  const [bedrijfsOmschrijving, setBedrijfsOmschrijving] = useState(chatbot.bedrijfs_omschrijving || "");
  const [websiteUrl, setWebsiteUrl] = useState(chatbot.website_url || "");
  const [extraInfo, setExtraInfo] = useState(chatbot.extra_info || "");
  const [openingszin, setOpeningszin] = useState(chatbot.openingszin || "Hallo! Waarmee kan ik je helpen?");
  const [doelen, setDoelen] = useState({
    vragenBeantwoorden: boolFromSettings(chatbot.settings, "vragen_beantwoorden", true),
    klantenHelpen: boolFromSettings(chatbot.settings, "klanten_helpen", true),
    contactAanvragenVerwerken: boolFromSettings(chatbot.settings, "contactaanvragen_verwerken", true),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(chatbot.is_active);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "bot",
      content: chatbot.openingszin?.trim() || "Hallo! Waarmee kan ik je helpen?",
    },
  ]);
  const [previewInput, setPreviewInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [gesprekId, setGesprekId] = useState<string | null>(null);

  const widgetSnippet = useMemo(
    () => `<script src="https://zylmero.com/widget.js" data-id="${chatbot.id}"></script>`,
    [chatbot.id],
  );

  async function onSaveBuilder(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);
    const result = await saveChatbotBuilderAction({
      chatbotId: chatbot.id,
      bedrijfsOmschrijving,
      websiteUrl,
      extraInfo,
      openingszin,
      doelen,
    });
    setIsSaving(false);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    setIsReady(true);
  }

  async function sendPreviewMessage(e: FormEvent) {
    e.preventDefault();
    const text = previewInput.trim();
    if (!text || isReplying) return;
    setPreviewInput("");
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const botMessageId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMessage, { id: botMessageId, role: "bot", content: "" }]);
    setIsReplying(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          chatbot_id: chatbot.id,
          gesprek_id: gesprekId,
          kanaal: "web",
          stream: true,
          preview_context: {
            bedrijfs_omschrijving: bedrijfsOmschrijving,
            website_url: websiteUrl || null,
            extra_info: extraInfo || null,
            openingszin: openingszin || null,
            settings: {
              doelen: {
                vragen_beantwoorden: doelen.vragenBeantwoorden,
                klanten_helpen: doelen.klantenHelpen,
                contactaanvragen_verwerken: doelen.contactAanvragenVerwerken,
              },
            },
          },
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Preview antwoord kon niet worden opgehaald.");
      }

      const nextGesprekId = response.headers.get("x-chat-gesprek-id");
      if (nextGesprekId) setGesprekId(nextGesprekId);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const next = await reader.read();
        done = next.done;
        const chunk = decoder.decode(next.value || new Uint8Array(), { stream: !done });
        if (!chunk) continue;
        setMessages((prev) =>
          prev.map((m) => (m.id === botMessageId ? { ...m, content: `${m.content}${chunk}` } : m)),
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Er ging iets mis met de preview.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMessageId ? { ...m, content: `Sorry, er ging iets mis. ${msg}` } : m,
        ),
      );
    } finally {
      setIsReplying(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {!isReady ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-900">Bouw je chatbot</h2>
            <p className="mt-2 text-sm text-gray-600">
              Vul alleen de basis in. Daarna is je chatbot direct klaar om te koppelen.
            </p>

            <form className="mt-8 space-y-8" onSubmit={onSaveBuilder}>
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Bedrijf</h3>
                <div className="space-y-2">
                  <Label htmlFor="bedrijfsOmschrijving">Bedrijfsomschrijving</Label>
                  <Textarea
                    id="bedrijfsOmschrijving"
                    value={bedrijfsOmschrijving}
                    onChange={(e) => setBedrijfsOmschrijving(e.target.value)}
                    placeholder="Wij verkopen fatbikes en doen reparaties"
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL (optioneel)</Label>
                  <Input
                    id="websiteUrl"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://jouwbedrijf.nl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extraInfo">Extra info (optioneel)</Label>
                  <Textarea
                    id="extraInfo"
                    value={extraInfo}
                    onChange={(e) => setExtraInfo(e.target.value)}
                    placeholder="Bijvoorbeeld levertijden, garantie, vestigingen of contactinformatie."
                    className="min-h-[96px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Wat moet je chatbot doen?</h3>
                <label className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={doelen.vragenBeantwoorden}
                    onChange={(e) =>
                      setDoelen((prev) => ({ ...prev, vragenBeantwoorden: e.target.checked }))
                    }
                  />
                  Vragen beantwoorden
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={doelen.klantenHelpen}
                    onChange={(e) => setDoelen((prev) => ({ ...prev, klantenHelpen: e.target.checked }))}
                  />
                  Klanten helpen
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={doelen.contactAanvragenVerwerken}
                    onChange={(e) =>
                      setDoelen((prev) => ({ ...prev, contactAanvragenVerwerken: e.target.checked }))
                    }
                  />
                  Contact aanvragen verwerken
                </label>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900">Openingszin (optioneel)</h3>
                <Input
                  value={openingszin}
                  onChange={(e) => setOpeningszin(e.target.value)}
                  placeholder="Hallo! Waarmee kan ik je helpen?"
                />
              </div>

              {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}

              <Button type="submit" size="lg" className="w-full" disabled={isSaving}>
                {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Maak mijn chatbot
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h2 className="text-xl font-semibold text-emerald-900">Je chatbot is klaar ✅</h2>
              <p className="mt-1 text-sm text-emerald-800">
                Koppel nu je kanalen. Je chatbot gebruikt direct de instellingen die je net hebt opgeslagen.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/settings?tab=whatsapp">WhatsApp activeren</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/settings?tab=email">E-mail activeren</Link>
              </Button>
              <Button asChild className="w-full justify-start">
                <Link href="/dashboard/settings?tab=widget">Website chat toevoegen</Link>
              </Button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">Embed script</p>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 text-xs text-gray-800 shadow-inner">
                {widgetSnippet}
              </pre>
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={() => void navigator.clipboard.writeText(widgetSnippet)}
              >
                Script kopiëren
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="flex min-h-[720px] flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircle className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-gray-900">Live preview</p>
              <p className="text-sm text-gray-500">Typ een vraag zoals je klant die stelt.</p>
            </div>
          </div>
          <Sparkles className="size-5 text-primary" />
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/50 p-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user" ? "bg-white text-gray-900 shadow-sm" : "bg-primary text-primary-foreground"
                }`}
              >
                {m.content || <span className="opacity-70">…</span>}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendPreviewMessage} className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Input
              value={previewInput}
              onChange={(e) => setPreviewInput(e.target.value)}
              placeholder="Typ je vraag..."
              disabled={isReplying}
            />
            <Button type="submit" size="icon" disabled={isReplying || !previewInput.trim()}>
              {isReplying ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
