"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
  initialAntwoordLengte: "short" | "normal";
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
  const [antwoordLengte, setAntwoordLengte] = useState<"short" | "normal">(props.initialAntwoordLengte);
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
  const [chatHeight, setChatHeight] = useState(190);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(190);

  const canSave = bedrijfsOmschrijving.trim().length > 0 && !props.demoMode;
  const suggestionChips = useMemo(
    () => ["Wat doen jullie?", "Wat zijn jullie openingstijden?", "Hoe kan ik contact opnemen?"],
    [],
  );
  const textFieldClass =
    "rounded-xl border-gray-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] focus-visible:ring-primary/20";

  const normalizePreviewError = (msg: string): string => {
    const raw = msg.toLowerCase();
    if (raw.includes("429") || raw.includes("quota") || raw.includes("billing")) {
      return "OpenAI-tegoed of limiet is bereikt. Zet credits/billing aan in je OpenAI account, daarna werkt live preview direct weer.";
    }
    return msg;
  };

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = event.clientY - dragStartYRef.current;
      const next = Math.max(120, Math.min(420, dragStartHeightRef.current + delta));
      setChatHeight(next);
    };
    const onUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

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
        antwoordLengte,
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
        antwoordLengte,
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
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Maak je chatbot in 1 minuut</h2>
          <p className="text-sm text-gray-600">
            Vul hieronder kort je bedrijfsinfo in. Daarna kun je direct testen en koppelen.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Over je bedrijf</h3>
            <div className="space-y-2">
              <Label htmlFor="chatbot-bedrijfsomschrijving">Wat doet je bedrijf?</Label>
              <Textarea
                id="chatbot-bedrijfsomschrijving"
                value={bedrijfsOmschrijving}
                onChange={(e) => setBedrijfsOmschrijving(e.target.value)}
                placeholder="Bijv. Wij verkopen fatbikes en doen reparaties."
                rows={3}
                className={cn(textFieldClass, "min-h-[96px]")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatbot-website">Website (optioneel)</Label>
              <Input
                id="chatbot-website"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="Bijv. https://jouwbedrijf.nl"
                className={cn(textFieldClass, "h-11")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatbot-extra">Extra informatie (optioneel)</Label>
              <Textarea
                id="chatbot-extra"
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                placeholder="Bijv. openingstijden, prijzen, garantie en contactgegevens."
                rows={2}
                className={cn(textFieldClass, "min-h-[72px]")}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Wat moet je chatbot voor klanten doen?
            </h3>
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <input
                type="checkbox"
                checked={goals.vragenBeantwoorden}
                onChange={(e) => setGoals((p) => ({ ...p, vragenBeantwoorden: e.target.checked }))}
              />
              <span className="text-sm text-gray-800">Algemene vragen beantwoorden</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <input
                type="checkbox"
                checked={goals.klantenHelpen}
                onChange={(e) => setGoals((p) => ({ ...p, klantenHelpen: e.target.checked }))}
              />
              <span className="text-sm text-gray-800">Klanten vriendelijk helpen</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <input
                type="checkbox"
                checked={goals.contactAanvragenVerwerken}
                onChange={(e) =>
                  setGoals((p) => ({ ...p, contactAanvragenVerwerken: e.target.checked }))
                }
              />
              <span className="text-sm text-gray-800">Contactverzoeken doorgeven</span>
            </label>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Extra opties (aan/uit)
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant={extraGoals.productadvies ? "secondary" : "outline"}
                className={cn(
                  "justify-start rounded-xl border text-sm font-medium",
                  extraGoals.productadvies
                    ? "border-gray-300 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                )}
                onClick={() =>
                  setExtraGoals((p) => ({ ...p, productadvies: !p.productadvies }))
                }
              >
                Productadvies geven
              </Button>
              <Button
                type="button"
                variant={extraGoals.faqUitleg ? "secondary" : "outline"}
                className={cn(
                  "justify-start rounded-xl border text-sm font-medium",
                  extraGoals.faqUitleg
                    ? "border-gray-300 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setExtraGoals((p) => ({ ...p, faqUitleg: !p.faqUitleg }))}
              >
                Veelgestelde vragen uitleggen
              </Button>
              <Button
                type="button"
                variant={extraGoals.contactEscalatie ? "secondary" : "outline"}
                className={cn(
                  "justify-start rounded-xl border text-sm font-medium",
                  extraGoals.contactEscalatie
                    ? "border-gray-300 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                )}
                onClick={() =>
                  setExtraGoals((p) => ({ ...p, contactEscalatie: !p.contactEscalatie }))
                }
              >
                Doorsturen naar contact
              </Button>
              <Button
                type="button"
                variant={extraGoals.afspraakOpVerzoek ? "secondary" : "outline"}
                className={cn(
                  "justify-start rounded-xl border text-sm font-medium",
                  extraGoals.afspraakOpVerzoek
                    ? "border-gray-300 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                )}
                onClick={() =>
                  setExtraGoals((p) => ({ ...p, afspraakOpVerzoek: !p.afspraakOpVerzoek }))
                }
              >
                Alleen actie op verzoek
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Antwoordlengte
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant={antwoordLengte === "short" ? "secondary" : "outline"}
                className={cn(
                  "justify-start rounded-xl border text-sm font-medium",
                  antwoordLengte === "short"
                    ? "border-gray-300 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setAntwoordLengte("short")}
              >
                Kort (aanbevolen)
              </Button>
              <Button
                type="button"
                variant={antwoordLengte === "normal" ? "secondary" : "outline"}
                className={cn(
                  "justify-start rounded-xl border text-sm font-medium",
                  antwoordLengte === "normal"
                    ? "border-gray-300 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setAntwoordLengte("normal")}
              >
                Normaal
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Eerste bericht (optioneel)</h3>
            <Input
              value={openingszin}
              onChange={(e) => setOpeningszin(e.target.value)}
              placeholder="Bijv. Hallo! Waarmee kan ik je helpen?"
              className={cn(textFieldClass, "h-11")}
            />
          </section>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <Button
            type="button"
            size="lg"
            onClick={onSave}
            disabled={!canSave || saving}
            className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800"
          >
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Maak mijn chatbot
          </Button>

          {saved ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <CheckCircle2 className="size-4" /> Klaar! Je chatbot staat aan
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" className="rounded-lg bg-gray-900 text-white hover:bg-gray-800">
                  <Link href="/dashboard/settings?tab=whatsapp">WhatsApp activeren</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-lg border-gray-200 bg-white text-gray-700">
                  <Link href="/dashboard/settings?tab=email">E-mail activeren</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-lg border-gray-200 bg-white text-gray-700">
                  <Link href="/dashboard/settings?tab=widget">Chat op je website zetten</Link>
                </Button>
              </div>
            </div>
          ) : null}

          <details className="rounded-xl border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-800">
              Website code (voor je webbouwer)
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

      <section className="flex min-h-[360px] flex-col rounded-2xl border border-gray-200/90 bg-white shadow-[0_20px_60px_-44px_rgba(15,23,42,0.45)]">
        <header className="border-b border-gray-200 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Live preview</p>
          <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
            Test je chatbot <Sparkles className="size-4 text-primary" />
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Stel een vraag zoals je klant dat zou doen. {scannedCount > 0 ? `${scannedCount} pagina's ingeladen.` : ""}
          </p>
        </header>

        {digest ? (
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs text-gray-600">
            <p className="font-semibold text-gray-700">Samenvatting van je kennis</p>
            <p className="mt-1 whitespace-pre-wrap">{digest}</p>
          </div>
        ) : null}

        <div className="space-y-3 overflow-y-auto bg-gray-50/70 px-6 py-4" style={{ height: chatHeight }}>
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

        <div className="border-t border-gray-200 px-6 py-2.5">
          <button
            type="button"
            className="group mx-auto flex h-5 w-full cursor-row-resize items-center justify-center"
            onMouseDown={(event) => {
              isDraggingRef.current = true;
              dragStartYRef.current = event.clientY;
              dragStartHeightRef.current = chatHeight;
            }}
            aria-label="Preview chathoogte aanpassen"
            title="Sleep omhoog of omlaag voor meer chat"
          >
            <span className="h-1.5 w-14 rounded-full bg-gray-300 transition-colors group-hover:bg-gray-500" />
          </button>
          <p className="mb-2 text-center text-[11px] text-gray-500">Sleep omhoog/omlaag om meer chat te zien</p>
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
              placeholder="Typ hier een klantvraag..."
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
            Simpel: invullen, testen, klaar. Geen technische kennis nodig.
          </p>
        </div>
      </section>
    </div>
  );
}
