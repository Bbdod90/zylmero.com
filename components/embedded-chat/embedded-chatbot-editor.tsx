"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, Loader2, Trash2 } from "lucide-react";
import {
  addEmbeddedChatbotSource,
  deleteEmbeddedChatbot,
  deleteEmbeddedChatbotSource,
  updateEmbeddedChatbot,
} from "@/actions/embedded-chatbots";
import { WebsiteChatSetupGuide } from "@/components/embedded-chat/website-chat-setup-guide";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EmbeddedChatTone, EmbeddedChatbotSourceRow } from "@/lib/embedded-chat/types";
import { cn } from "@/lib/utils";

const TONE_OPTIONS: { value: EmbeddedChatTone; label: string }[] = [
  { value: "kort", label: "Kort en direct" },
  { value: "vriendelijk", label: "Vriendelijk" },
  { value: "zakelijk", label: "Zakelijk" },
];

type Props = {
  chatbot: {
    id: string;
    name: string;
    tone: EmbeddedChatTone;
    instructions: string;
  };
  sources: EmbeddedChatbotSourceRow[];
  widgetScriptUrl: string;
  companyName: string;
};

export function EmbeddedChatbotEditor({ chatbot, sources, widgetScriptUrl, companyName }: Props) {
  const router = useRouter();
  const [name, setName] = useState(chatbot.name);
  const [tone, setTone] = useState<EmbeddedChatTone>(chatbot.tone);
  const [instructions, setInstructions] = useState(chatbot.instructions);
  const [sourceType, setSourceType] = useState<"text" | "url">("text");
  const [sourceContent, setSourceContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const embedCode = `<script src="${widgetScriptUrl}" data-chatbot="${chatbot.id}" defer><\/script>`;

  const onSave = () => {
    setMessage(null);
    startTransition(async () => {
      const r = await updateEmbeddedChatbot({ id: chatbot.id, name, tone, instructions });
      setMessage(r.ok ? "Opgeslagen." : r.error);
    });
  };

  const onAddSource = () => {
    setMessage(null);
    setAdding(true);
    startTransition(async () => {
      const r = await addEmbeddedChatbotSource({
        chatbotId: chatbot.id,
        type: sourceType,
        content: sourceContent,
      });
      setAdding(false);
      if (r.ok) {
        setSourceContent("");
        setMessage("Bron toegevoegd.");
        router.refresh();
      } else {
        setMessage(r.error);
      }
    });
  };

  const onDeleteSource = (id: string) => {
    setMessage(null);
    setRemoving(id);
    startTransition(async () => {
      const r = await deleteEmbeddedChatbotSource(id, chatbot.id);
      setRemoving(null);
      if (r.ok) {
        setMessage("Bron verwijderd.");
        router.refresh();
      } else {
        setMessage(r.error);
      }
    });
  };

  const onDeleteBot = () => {
    if (!window.confirm("Deze website-chat verwijderen? Gespreksgeschiedenis voor bezoekers wordt ook gewist.")) return;
    startTransition(async () => {
      const r = await deleteEmbeddedChatbot(chatbot.id);
      if (r.ok) router.push("/dashboard/chatbots");
      else setMessage(r.error);
    });
  };

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setMessage("Embed-code gekopieerd.");
    } catch {
      setMessage("Kopiëren mislukt.");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-10">
      <div className="space-y-8">
        <WebsiteChatSetupGuide />

        <div
          id="website-chat-instellingen"
          className="scroll-mt-28 rounded-xl border border-border/60 bg-card p-6 dark:border-white/[0.09] dark:bg-card/80"
        >
          <h2 className="text-lg font-semibold text-foreground">Instellingen</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Naam en gedrag voor bezoekers op je site — geen ingewikkelde flows.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Naam</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 h-11 rounded-lg"
                placeholder="bijv. Planning & vragen"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Toon</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as EmbeddedChatTone)}
                className={cn(
                  "mt-1.5 flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Instructies voor de assistent</label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="mt-1.5 min-h-[120px] resize-y rounded-lg text-sm"
                placeholder="Wat moet hij vooral doen? bijv. prijsindicatie geven, spoed signaleren, afspraak voorstellen…"
              />
            </div>
            <Button type="button" onClick={onSave} disabled={pending} className="rounded-lg">
              {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Opslaan
            </Button>
          </div>
        </div>

        <div
          id="website-chat-kennis"
          className="scroll-mt-28 rounded-xl border border-border/60 bg-card p-6 dark:border-white/[0.09] dark:bg-card/80"
        >
          <h2 className="text-lg font-semibold text-foreground">Kennis</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Korte tekst of een URL (ook alleen <span className="font-medium text-foreground">domein.nl</span>) — we halen waar mogelijk de
            paginatekst op zodat de assistent producten en prijzen kan noemen die op je site staan.
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as "text" | "url")}
                className={cn(
                  "h-10 rounded-lg border border-input bg-background px-3 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <option value="text">Tekst</option>
                <option value="url">URL</option>
              </select>
            </div>
            <Textarea
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              className="min-h-[88px] resize-y rounded-lg text-sm"
              placeholder={
                sourceType === "url"
                  ? "https://jouwsite.nl of jouwsite.nl"
                  : "Openingstijden, tarieven vanaf, gebiedswerk…"
              }
            />
            <Button type="button" variant="secondary" onClick={onAddSource} disabled={adding || pending}>
              {adding ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Bron toevoegen
            </Button>
          </div>

          <ul className="mt-6 space-y-2">
            {sources.length === 0 ? (
              <li className="text-sm text-muted-foreground">Nog geen bronnen — optioneel, maar helpt bij betere antwoorden.</li>
            ) : null}
            {sources.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-sm dark:border-white/[0.07]"
              >
                <div className="min-w-0">
                  <span className="font-medium text-foreground">{s.type === "url" ? "URL" : "Tekst"}</span>
                  <p className="mt-1 break-words text-muted-foreground">{s.content}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onDeleteSource(s.id)}
                  disabled={removing === s.id}
                  aria-label="Bron verwijderen"
                >
                  {removing === s.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div
          id="website-chat-embed"
          className="scroll-mt-28 rounded-xl border border-border/60 bg-card p-6 dark:border-white/[0.09] dark:bg-card/80"
        >
          <h2 className="text-lg font-semibold text-foreground">Website embed</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Plak onderaan je site vóór <code className="rounded bg-muted px-1">&lt;/body&gt;</code>. Werkt op elke site zonder
            framework.
          </p>
          <pre
            className="mt-4 max-h-40 overflow-y-auto whitespace-pre-wrap break-all rounded-xl border border-border/50 bg-muted/35 p-4 font-mono text-[0.7rem] leading-relaxed text-foreground ring-1 ring-black/[0.04] dark:bg-black/35 dark:ring-white/[0.06] sm:text-xs"
            tabIndex={0}
          >
            {embedCode}
          </pre>
          <Button type="button" variant="outline" className="mt-4 rounded-lg" onClick={copyEmbed}>
            <Copy className="mr-2 size-4" />
            Code kopiëren
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Je widget gebruikt hetzelfde actieve abonnement als {companyName}. Zonder actief abonnement tonen we een nette melding aan bezoekers.
          </p>
        </div>

        <div className="flex justify-end border-t border-border/40 pt-6">
          <Button type="button" variant="destructive" className="rounded-lg" onClick={onDeleteBot} disabled={pending}>
            Chatbot verwijderen
          </Button>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>

      <div id="website-chat-live-test" className="scroll-mt-28 lg:sticky lg:top-24 lg:self-start">
        <ChatWidget
          chatbotId={chatbot.id}
          title="Live test"
          subtitle="Zo zien bezoekers het — zonder je site te publiceren. Werkt het niet? Open /api/health (zelfde domein) voor env- en netwerkcheck."
          placeholder="Typ wat een klant zou sturen…"
          className="min-h-[28rem] shadow-lg"
        />
      </div>
    </div>
  );
}
