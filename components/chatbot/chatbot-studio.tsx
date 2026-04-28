"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CopyButton } from "@/components/growth/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  previewChatbotVisitorMessageAction,
  saveChatbotStudioAction,
} from "@/actions/settings";
import { CheckCircle2, Loader2, MessageCircle, SendHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function ChatbotStudio(props: {
  demoMode: boolean;
  companyName: string;
  initialBedrijfsOmschrijving: string;
  initialWebsiteUrl: string;
  initialExtraInfo: string;
  initialOpeningszin: string;
  initialDigest: string | null;
  initialScannedCount: number;
  initialGoals: {
    vragenBeantwoorden: boolean;
    klantenHelpen: boolean;
    contactAanvragenVerwerken: boolean;
  };
  embedSnippet: string;
}) {
  const [bedrijfsOmschrijving, setBedrijfsOmschrijving] = useState(props.initialBedrijfsOmschrijving);
  const [websiteUrl, setWebsiteUrl] = useState(props.initialWebsiteUrl);
  const [extraInfo, setExtraInfo] = useState(props.initialExtraInfo);
  const [openingszin, setOpeningszin] = useState(props.initialOpeningszin);
  const [goals, setGoals] = useState(props.initialGoals);
  const [extraGoals, setExtraGoals] = useState({
    productadvies: true,
    faqUitleg: true,
    contactEscalatie: true,
    afspraakOpVerzoek: true,
  });
  const [saved, setSaved] = useState(props.initialScannedCount > 0 || props.initialExtraInfo.trim().length > 0);
  const [error, setError] = useState<string | null>(null);
  const [digest, setDigest] = useState<string | null>(props.initialDigest);
  const [scannedCount, setScannedCount] = useState(props.initialScannedCount);
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    { role: "assistant", content: props.initialOpeningszin || "Hallo! Waarmee kan ik je helpen?" },
  ]);
  const [saving, startSaving] = useTransition();
  const [replying, startReplying] = useTransition();

  const canSave = bedrijfsOmschrijving.trim().length > 0 && !props.demoMode;
  const suggestionChips = useMemo(
    () => ["Wat doen jullie?", "Wat zijn jullie openingstijden?", "Hoe kan ik contact opnemen?"],
    [],
  );

  const normalizePreviewError = (msg: string): string => {
    const raw = msg.toLowerCase();
    if (raw.includes("429") || raw.includes("quota") || raw.includes("billing")) {
      return "OpenAI-tegoed of limiet is bereikt. Zet credits/billing aan in je OpenAI account, daarna werkt live preview direct weer.";
    }
    return msg;
  };

  const onSave = () => {
    if (!canSave) return;
    setError(null);
    startSaving(async () => {
      const res = await saveChatbotStudioAction({
        bedrijfsOmschrijving,
        websiteUrl,
        extraInfo,
        openingszin,
        doelen: goals,
        extraDoelen: extraGoals,
      });
      if (!res.ok) {
        setError(normalizePreviewError(res.error));
        return;
      }
      setSaved(true);
      setDigest(res.digest_nl);
      setScannedCount(res.scanned_pages_count);
    });
  };

  const runPreview = (raw: string) => {
    const text = raw.trim();
    if (!text || replying) return;
    setError(null);
    setChat((prev) => [...prev, { role: "user", content: text }]);
    startReplying(async () => {
      const out = await previewChatbotVisitorMessageAction(text, {
        bedrijfsOmschrijving,
        websiteUrl,
        extraInfo,
        openingszin,
        doelen: goals,
        extraDoelen: extraGoals,
      });
      if (out.ok) {
        setChat((prev) => [...prev, { role: "assistant", content: out.reply }]);
      } else {
        const friendly = normalizePreviewError(out.error);
        setError(friendly);
        setChat((prev) => [
          ...prev,
          { role: "assistant", content: `Dat lukte nu niet: ${friendly}` },
        ]);
      }
    });
  };

  return (
    <div className="mx-auto grid w-full max-w-[1520px] gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
      <section className="rounded-2xl border border-gray-200/90 bg-white p-8 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.45)]">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Je chatbot instellen</h2>
          <p className="text-sm text-gray-600">
            Vul dit in zoals bij Botpress: kort, duidelijk, klaar. Daarna direct testen en koppelen.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Bedrijf</h3>
            <div className="space-y-2">
              <Label htmlFor="chatbot-bedrijfsomschrijving">Bedrijfsomschrijving</Label>
              <Textarea
                id="chatbot-bedrijfsomschrijving"
                value={bedrijfsOmschrijving}
                onChange={(e) => setBedrijfsOmschrijving(e.target.value)}
                placeholder="Wij verkopen fatbikes en doen reparaties"
                rows={5}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatbot-website">Website URL (optioneel)</Label>
              <Input
                id="chatbot-website"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://jouwdomein.nl"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatbot-extra">Extra info (optioneel)</Label>
              <Textarea
                id="chatbot-extra"
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                placeholder="Bijv. openingstijden, prijzen, garantie, contactgegevens."
                rows={4}
                className="rounded-xl"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Wat moet je chatbot doen?
            </h3>
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
              <input
                type="checkbox"
                checked={goals.vragenBeantwoorden}
                onChange={(e) => setGoals((p) => ({ ...p, vragenBeantwoorden: e.target.checked }))}
              />
              <span className="text-sm text-gray-800">Vragen beantwoorden</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
              <input
                type="checkbox"
                checked={goals.klantenHelpen}
                onChange={(e) => setGoals((p) => ({ ...p, klantenHelpen: e.target.checked }))}
              />
              <span className="text-sm text-gray-800">Klanten helpen</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
              <input
                type="checkbox"
                checked={goals.contactAanvragenVerwerken}
                onChange={(e) =>
                  setGoals((p) => ({ ...p, contactAanvragenVerwerken: e.target.checked }))
                }
              />
              <span className="text-sm text-gray-800">Contact aanvragen verwerken</span>
            </label>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Extra gedrag (aan/uit)
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant={extraGoals.productadvies ? "default" : "outline"}
                className="justify-start rounded-xl"
                onClick={() =>
                  setExtraGoals((p) => ({ ...p, productadvies: !p.productadvies }))
                }
              >
                Productadvies geven
              </Button>
              <Button
                type="button"
                variant={extraGoals.faqUitleg ? "default" : "outline"}
                className="justify-start rounded-xl"
                onClick={() => setExtraGoals((p) => ({ ...p, faqUitleg: !p.faqUitleg }))}
              >
                FAQ kort uitleggen
              </Button>
              <Button
                type="button"
                variant={extraGoals.contactEscalatie ? "default" : "outline"}
                className="justify-start rounded-xl"
                onClick={() =>
                  setExtraGoals((p) => ({ ...p, contactEscalatie: !p.contactEscalatie }))
                }
              >
                Doorzetten naar contact
              </Button>
              <Button
                type="button"
                variant={extraGoals.afspraakOpVerzoek ? "default" : "outline"}
                className="justify-start rounded-xl"
                onClick={() =>
                  setExtraGoals((p) => ({ ...p, afspraakOpVerzoek: !p.afspraakOpVerzoek }))
                }
              >
                Actie alleen op verzoek
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Openingszin (optioneel)</h3>
            <Input
              value={openingszin}
              onChange={(e) => setOpeningszin(e.target.value)}
              placeholder="Hallo! Waarmee kan ik je helpen?"
              className="rounded-xl"
            />
          </section>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <Button type="button" size="lg" onClick={onSave} disabled={!canSave || saving} className="w-full">
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Maak mijn chatbot
          </Button>

          {saved ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <CheckCircle2 className="size-4" /> Je chatbot is klaar
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href="/dashboard/settings?tab=whatsapp">WhatsApp activeren</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/settings?tab=email">E-mail activeren</Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/dashboard/settings?tab=widget">Website chat toevoegen</Link>
                </Button>
              </div>
            </div>
          ) : null}

          <details className="rounded-xl border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-800">
              Website script
            </summary>
            <div className="space-y-3 border-t border-gray-200 px-4 py-3">
              <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-800">
                {props.embedSnippet}
              </pre>
              <CopyButton text={props.embedSnippet} label="Script kopiëren" />
            </div>
          </details>
        </div>
      </section>

      <section className="flex min-h-[760px] flex-col rounded-2xl border border-gray-200/90 bg-white shadow-[0_20px_60px_-44px_rgba(15,23,42,0.45)]">
        <header className="border-b border-gray-200 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Live preview</p>
          <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
            Praat met je chatbot <Sparkles className="size-4 text-primary" />
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            De preview gebruikt dezelfde kennis als je echte bot. {scannedCount > 0 ? `${scannedCount} pagina's geladen.` : ""}
          </p>
        </header>

        {digest ? (
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs text-gray-600">
            <p className="font-semibold text-gray-700">Wat je bot heeft geleerd</p>
            <p className="mt-1 whitespace-pre-wrap">{digest}</p>
          </div>
        ) : null}

        <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/70 px-6 py-4">
          {chat.map((m, i) => (
            <div
              key={`${i}-${m.role}`}
              className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "border border-gray-200 bg-white text-gray-900"
                    : "bg-gray-900 text-white",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {replying ? (
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="size-3.5 animate-spin" />
              Antwoord wordt gemaakt...
            </p>
          ) : null}
        </div>

        <div className="space-y-3 border-t border-gray-200 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {suggestionChips.map((q) => (
              <Button key={q} type="button" size="sm" variant="secondary" onClick={() => runPreview(q)}>
                {q}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Typ je vraag..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const text = chatInput.trim();
                  if (!text) return;
                  setChatInput("");
                  runPreview(text);
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              onClick={() => {
                const text = chatInput.trim();
                if (!text) return;
                setChatInput("");
                runPreview(text);
              }}
              disabled={replying}
            >
              {replying ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
            </Button>
          </div>
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <MessageCircle className="size-3.5" />
            Geen technische instellingen nodig — invullen, testen, klaar.
          </p>
        </div>
      </section>
    </div>
  );
}
