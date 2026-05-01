"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { CopyButton } from "@/components/growth/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  previewChatbotVisitorMessageAction,
  saveChatbotStudioAction,
  saveChatbotWidgetStudioAction,
} from "@/actions/settings";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircle,
  Palette,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WIDGET_STARTER_WELCOME_DEFAULT, WIDGET_STARTERS } from "@/lib/chatbot/widget-starters";
import { WIDGET_DEFAULT_PRIMARY } from "@/lib/chatbot/widget-public-config";
import type { WidgetContactPublic } from "@/lib/phone/widget-contact";

type ChatMessage = { role: "user" | "assistant"; content: string };

function shadeHex(hex: string, factor: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return hex;
  const c = (x: string) =>
    Math.round(Math.min(255, Math.max(0, parseInt(x, 16) * factor)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(m[1])}${c(m[2])}${c(m[3])}`;
}

function hexToRgbCss(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return "201, 162, 39";
  return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`;
}

function padStarterRows(rows: { label: string; prompt: string }[]): { label: string; prompt: string }[] {
  const base = WIDGET_STARTERS.map((s) => ({ label: s.label, prompt: s.prompt }));
  const clean = rows.filter((r) => r.label.trim() && r.prompt.trim());
  if (clean.length >= 3) return clean.slice(0, 5);
  const out = [...clean];
  let i = 0;
  while (out.length < 3 && i < base.length) {
    if (!out.some((o) => o.label === base[i].label)) out.push(base[i]);
    i += 1;
  }
  return out.slice(0, 5);
}

function SettingSwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            checked ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600",
          )}
        >
          {checked ? "Aan" : "Uit"}
        </span>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}

export function ChatbotStudio(props: {
  demoMode: boolean;
  companyName: string;
  initialBedrijfsOmschrijving: string;
  initialWebsiteUrl: string;
  initialExtraInfo: string;
  initialOpeningszin: string;
  initialDigest: string | null;
  initialScannedCount: number;
  initialKnowledgeUrls: { url: string; title: string }[];
  initialCrawlCapped: boolean;
  initialGoals: {
    contactAanvragenVerwerken: boolean;
  };
  initialVragenTerugStellen: boolean;
  initialAntwoordLengte: "short" | "normal";
  initialExtraGoals: {
    productadvies: boolean;
    faqUitleg: boolean;
    contactEscalatie: boolean;
    afspraakOpVerzoek: boolean;
  };
  embedChatbotId: string;
  initialWidgetPrimary: string;
  initialWidgetLogoUrl: string | null;
  initialWidgetTitle: string;
  initialWidgetShowStarters: boolean;
  initialWidgetStarters: { label: string; prompt: string }[];
  contactPreview: WidgetContactPublic;
  embedSnippet: string;
}) {
  const [bedrijfsOmschrijving, setBedrijfsOmschrijving] = useState(props.initialBedrijfsOmschrijving);
  const [websiteUrl, setWebsiteUrl] = useState(props.initialWebsiteUrl);
  const [extraInfo, setExtraInfo] = useState(props.initialExtraInfo);
  const [openingszin, setOpeningszin] = useState(props.initialOpeningszin);
  const [goals, setGoals] = useState(props.initialGoals);
  const [vragenTerugStellen, setVragenTerugStellen] = useState(
    props.initialVragenTerugStellen,
  );
  const [extraGoals, setExtraGoals] = useState(props.initialExtraGoals);
  const [antwoordLengte, setAntwoordLengte] = useState<"short" | "normal">(props.initialAntwoordLengte);
  const [saved, setSaved] = useState(props.initialScannedCount > 0 || props.initialExtraInfo.trim().length > 0);
  const [error, setError] = useState<string | null>(null);
  const [scannedCount, setScannedCount] = useState(props.initialScannedCount);
  const [scrapedUrls, setScrapedUrls] = useState(props.initialKnowledgeUrls);
  const [crawlCapped, setCrawlCapped] = useState(props.initialCrawlCapped);
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: props.initialOpeningszin?.trim() || WIDGET_STARTER_WELCOME_DEFAULT,
    },
  ]);
  const [saving, startSaving] = useTransition();
  const [replying, startReplying] = useTransition();
  const [chatHeight, setChatHeight] = useState(190);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(190);

  const [widgetPrimary, setWidgetPrimary] = useState(
    /^#[0-9A-Fa-f]{6}$/.test(props.initialWidgetPrimary)
      ? props.initialWidgetPrimary
      : WIDGET_DEFAULT_PRIMARY,
  );
  const [widgetLogoUrl, setWidgetLogoUrl] = useState(props.initialWidgetLogoUrl ?? "");
  const [widgetTitle, setWidgetTitle] = useState(props.initialWidgetTitle || "Chat");
  const [showStarterChoices, setShowStarterChoices] = useState(props.initialWidgetShowStarters);
  const [starterRows, setStarterRows] = useState(() => padStarterRows(props.initialWidgetStarters));
  const [widgetSavePending, startWidgetSave] = useTransition();
  const [widgetSaveMessage, setWidgetSaveMessage] = useState<string | null>(null);
  /** Preview: snelle opties inklapbaar (zelfde idee als de echte widget). */
  const [quickOptionsOpen, setQuickOptionsOpen] = useState(false);

  const canSave = bedrijfsOmschrijving.trim().length > 0 && !props.demoMode;

  const validPreviewStarters = starterRows.filter((s) => s.label.trim() && s.prompt.trim());
  const starterPreviewHint =
    validPreviewStarters.length > 0
      ? validPreviewStarters
          .slice(0, 2)
          .map((s) => s.label)
          .join(", ") + (validPreviewStarters.length > 2 ? "…" : "")
      : "";

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

  useEffect(() => {
    setChat((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [
          {
            role: "assistant",
            content: openingszin.trim() || WIDGET_STARTER_WELCOME_DEFAULT,
          },
        ];
      }
      return prev;
    });
  }, [openingszin]);

  const onSaveWidget = () => {
    if (props.demoMode) return;
    setWidgetSaveMessage(null);
    setError(null);
    startWidgetSave(async () => {
      const res = await saveChatbotWidgetStudioAction({
        openingLine: openingszin,
        widgetTitle,
        primaryColor: widgetPrimary,
        logoUrl: widgetLogoUrl,
        showStarters: showStarterChoices,
        starters: starterRows.filter((r) => r.label.trim() && r.prompt.trim()),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setWidgetSaveMessage(
        "Widget opgeslagen. Je embed op de website toont dit na een minuut (browsercache).",
      );
    });
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
        vragenTerugStellen,
        extraDoelen: extraGoals,
        antwoordLengte,
      });
      if (!res.ok) {
        setError(normalizePreviewError(res.error));
        return;
      }
      setSaved(true);
      setScannedCount(res.scanned_pages_count);
      setScrapedUrls(res.knowledge_urls);
      setCrawlCapped(res.crawl_capped);
    });
  };

  const runPreview = (apiMessage: string, displayForUser?: string) => {
    const text = apiMessage.trim();
    const display = (displayForUser ?? apiMessage).trim();
    if (!text || replying) return;
    setError(null);
    setChat((prev) => [...prev, { role: "user", content: display }]);
    startReplying(async () => {
      const historyForAi: Array<{ role: "user" | "assistant"; content: string }> = [
        ...chat
          .filter((m) => (m.role === "user" || m.role === "assistant") && m.content.trim())
          .slice(-7)
          .map((m): { role: "user" | "assistant"; content: string } => ({
            role: m.role,
            content: m.content,
          })),
        { role: "user" as const, content: text },
      ];
      const out = await previewChatbotVisitorMessageAction(
        text,
        historyForAi,
        {
          bedrijfsOmschrijving,
          websiteUrl,
          extraInfo,
          openingszin,
          doelen: goals,
          vragenTerugStellen,
          extraDoelen: extraGoals,
          antwoordLengte,
        },
      );
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
    <div className="mx-auto grid w-full max-w-[1500px] gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.45)]">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Chatbot studio</h2>
          <p className="text-sm text-gray-600">
            Personaliseer uiterlijk, openingszin en snelle keuzes. Train je kennis hieronder; rechts zie je live
            wat je bezoekers krijgen.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <section className="space-y-4 rounded-2xl border border-stone-200/90 bg-gradient-to-b from-stone-50/80 to-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white">
                  <Palette className="size-4" aria-hidden />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Widget & merk</h3>
                  <p className="text-xs text-gray-500">Zelfde look als op je site na embedden.</p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="rounded-xl bg-stone-900 text-white hover:bg-stone-800"
                disabled={props.demoMode || widgetSavePending}
                onClick={onSaveWidget}
              >
                {widgetSavePending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Widget opslaan
              </Button>
            </div>
            {widgetSaveMessage ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                {widgetSaveMessage}
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="widget-primary">Accentkleur</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="widget-primary"
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(widgetPrimary) ? widgetPrimary : WIDGET_DEFAULT_PRIMARY}
                    onChange={(e) => setWidgetPrimary(e.target.value)}
                    className="h-11 w-14 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
                    aria-label="Accentkleur"
                  />
                  <Input
                    value={widgetPrimary}
                    onChange={(e) => setWidgetPrimary(e.target.value)}
                    placeholder="#c9a227"
                    className={cn(textFieldClass, "h-11 flex-1 font-mono text-sm")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="widget-title">Titel in chatkop</Label>
                <Input
                  id="widget-title"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value.slice(0, 48))}
                  placeholder="Chat"
                  className={cn(textFieldClass, "h-11")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-logo">Logo (URL, https)</Label>
              <Input
                id="widget-logo"
                value={widgetLogoUrl}
                onChange={(e) => setWidgetLogoUrl(e.target.value)}
                placeholder="https://…"
                className={cn(textFieldClass, "h-11")}
              />
              <p className="text-xs text-gray-500">
                Publieke URL naar PNG/SVG/WebP. Verschijnt klein naast de titel op je widget.
              </p>
              <p className="text-xs text-stone-500">
                <span className="font-medium text-stone-700">Bellen & WhatsApp</span> onderin de widget komen uit
                je{" "}
                <Link href="/dashboard/settings?tab=business" className="font-medium text-primary underline-offset-2 hover:underline">
                  bedrijfstelefoon
                </Link>{" "}
                en je gekoppelde{" "}
                <Link href="/dashboard/settings?tab=whatsapp" className="font-medium text-primary underline-offset-2 hover:underline">
                  WhatsApp-nummer
                </Link>
                .
              </p>
            </div>
            <SettingSwitchRow
              title="Snelle keuzes tonen"
              description="Knoppen onder het eerste bericht — ideaal voor reparatie, prijzen, retour."
              checked={showStarterChoices}
              onCheckedChange={setShowStarterChoices}
            />
            {showStarterChoices ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm font-semibold text-gray-800">Snelle keuzes (max. 5)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={starterRows.length >= 5}
                    onClick={() =>
                      setStarterRows((r) => [...r, { label: "", prompt: "" }].slice(0, 5))
                    }
                  >
                    Rij toevoegen
                  </Button>
                </div>
                <div className="space-y-3">
                  {starterRows.map((row, idx) => (
                    <div
                      key={`starter-${idx}-${row.label.slice(0, 8)}`}
                      className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Keuze {idx + 1}
                        </span>
                        {starterRows.length > 1 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-600 hover:text-red-700"
                            onClick={() => setStarterRows((r) => r.filter((_, i) => i !== idx))}
                          >
                            Verwijderen
                          </Button>
                        ) : null}
                      </div>
                      <div className="mt-2 space-y-2">
                        <Input
                          value={row.label}
                          onChange={(e) =>
                            setStarterRows((r) =>
                              r.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                            )
                          }
                          placeholder="Label op de knop"
                          className={cn(textFieldClass, "h-9")}
                        />
                        <Textarea
                          value={row.prompt}
                          onChange={(e) =>
                            setStarterRows((r) =>
                              r.map((x, i) => (i === idx ? { ...x, prompt: e.target.value } : x)),
                            )
                          }
                          placeholder="Wat de AI precies moet weten (wordt naar de chat gestuurd)"
                          rows={2}
                          className={cn(textFieldClass, "min-h-[64px] text-sm")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="text-xs text-gray-500">
              Chat-ID voor je script:{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">
                {props.embedChatbotId}
              </code>
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Over je bedrijf</h3>
            <div className="space-y-2">
              <Label htmlFor="chatbot-bedrijfsomschrijving">Wat doet je bedrijf?</Label>
              <Textarea
                id="chatbot-bedrijfsomschrijving"
                value={bedrijfsOmschrijving}
                onChange={(e) => setBedrijfsOmschrijving(e.target.value)}
                placeholder="Bijv. Wij verkopen fatbikes en doen reparaties."
                rows={2}
                className={cn(textFieldClass, "min-h-[72px]")}
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
              {websiteUrl.trim().length > 0 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                  {scrapedUrls.length > 0 ? (
                    <>
                      <p className="font-semibold text-gray-900">
                        {scrapedUrls.length} pagina&apos;s meegenomen voor je kennis
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Bij opslaan crawlen we dit domein (sitemap + interne links) en slaan alle
                        gevonden pagina&apos;s gekoppeld aan je chatbot op.
                      </p>
                      {crawlCapped ? (
                        <p className="mt-2 text-xs font-medium text-amber-800">
                          Maximum pagina&apos;s bereikt — nog meer URL&apos;s bestaan op het domein.
                          Product- en collectiepagina&apos;s worden het eerst gebruikt voor antwoorden.
                        </p>
                      ) : null}
                      <details className="mt-2 rounded-lg border border-gray-200/80 bg-white px-2 py-1">
                        <summary className="cursor-pointer text-xs font-semibold text-gray-800">
                          Bekijk URL&apos;s ({scrapedUrls.length})
                        </summary>
                        <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto border-t border-gray-100 pt-2 text-[0.72rem] leading-snug">
                          {scrapedUrls.map((row) => (
                            <li key={row.url} className="break-all">
                              <span className="font-medium text-gray-900">{row.title || "—"}</span>
                              <div>
                                <a
                                  href={row.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 underline decoration-blue-700/35 underline-offset-2"
                                >
                                  {row.url}
                                </a>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </>
                  ) : (
                    <p className="text-xs text-gray-600">
                      Nog geen pagina&apos;s ingelezen voor deze sessie. Klik op{" "}
                      <span className="font-semibold text-gray-800">Maak mijn chatbot</span> — dan
                      worden automatisch alle bereikbare URL&apos;s van dit domein gescand en hier
                      getoond.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatbot-extra">Extra informatie (optioneel)</Label>
              <Textarea
                id="chatbot-extra"
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                placeholder="Bijv. openingstijden, prijzen, garantie en contactgegevens."
                rows={2}
                className={cn(textFieldClass, "min-h-[64px]")}
              />
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Wat moet je chatbot voor klanten doen?
            </h3>
            <SettingSwitchRow
              title="Contactverzoeken doorgeven"
              description="De chatbot stuurt klanten richting contact als dat nodig is."
              checked={goals.contactAanvragenVerwerken}
              onCheckedChange={(next) =>
                setGoals((p) => ({ ...p, contactAanvragenVerwerken: next }))
              }
            />
            <SettingSwitchRow
              title="Vragen terug stellen"
              description="Aan = de bot mag verduidelijkende vragen stellen. Uit (aanbevolen) = alleen antwoord geven, geen onnodige doorvragen — bijvoorbeeld bij prijs/product meteen modellen en prijzen uit je kennis noemen."
              checked={vragenTerugStellen}
              onCheckedChange={setVragenTerugStellen}
            />
          </section>

          <details className="rounded-xl border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold text-gray-700">
              Extra opties (aan/uit)
            </summary>
            <div className="space-y-2 border-t border-gray-200 px-3 py-3">
              <SettingSwitchRow
                title="Productadvies geven"
                description="De chatbot helpt klanten bij productkeuze."
                checked={extraGoals.productadvies}
                onCheckedChange={(next) => setExtraGoals((p) => ({ ...p, productadvies: next }))}
              />
              <SettingSwitchRow
                title="Veelgestelde vragen uitleggen"
                description="De chatbot geeft korte FAQ-uitleg als iemand vastloopt."
                checked={extraGoals.faqUitleg}
                onCheckedChange={(next) => setExtraGoals((p) => ({ ...p, faqUitleg: next }))}
              />
              <SettingSwitchRow
                title="Doorsturen naar contact"
                description="Bij complexe vraag verwijst de chatbot door naar contact."
                checked={extraGoals.contactEscalatie}
                onCheckedChange={(next) => setExtraGoals((p) => ({ ...p, contactEscalatie: next }))}
              />
              <SettingSwitchRow
                title="Alleen actie op verzoek"
                description="Geen offerte of afspraak pushen zonder expliciete vraag."
                checked={extraGoals.afspraakOpVerzoek}
                onCheckedChange={(next) => setExtraGoals((p) => ({ ...p, afspraakOpVerzoek: next }))}
              />
            </div>
          </details>

          <section className="space-y-2.5">
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
            <p className="text-xs leading-relaxed text-gray-500">
              <span className="font-semibold text-gray-700">Kort:</span> 1–3 zinnen; geen prijslijst tenzij de klant om prijzen/modellen vraagt.{" "}
              <span className="font-semibold text-gray-700">Normaal:</span> iets meer ruimte om uit te leggen (ongeveer 3–6 zinnen).
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Eerste bericht (optioneel)</h3>
            <Input
              value={openingszin}
              onChange={(e) => setOpeningszin(e.target.value)}
              placeholder={WIDGET_STARTER_WELCOME_DEFAULT}
              className={cn(textFieldClass, "h-11")}
            />
          </section>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <Button type="button" size="lg" onClick={onSave} disabled={!canSave || saving} className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800">
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Maak mijn chatbot
          </Button>

          {saved ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
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

      <div className="flex flex-col gap-3 lg:sticky lg:top-6">
        <div className="flex flex-col items-end gap-1.5 px-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Zo op je website (knop rechtsonder)
          </span>
          <div
            className="rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-lg"
            style={{
              background: `linear-gradient(145deg, ${widgetPrimary}, ${shadeHex(widgetPrimary, 0.38)})`,
              boxShadow: `0 12px 40px rgba(0,0,0,.35), 0 0 0 1px rgba(${hexToRgbCss(widgetPrimary)}, 0.35)`,
            }}
          >
            {(widgetTitle || "Chat").trim().slice(0, 18).toUpperCase() || "CHAT"}
          </div>
        </div>

        <section className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_28px_80px_rgba(15,15,20,0.12)]">
        <header
          className="border-b bg-gradient-to-b from-[#161618] to-[#0e0e10] px-5 py-3 text-zinc-100"
          style={{ borderBottomColor: `rgba(${hexToRgbCss(widgetPrimary)}, 0.35)` }}
        >
          <div className="flex items-start gap-3">
            {widgetLogoUrl.trim() && /^https?:\/\//i.test(widgetLogoUrl.trim()) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={widgetLogoUrl.trim()}
                alt=""
                className="mt-0.5 h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-0.5"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Live preview</p>
              <h3 className="mt-1 flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight">
                <span className="truncate">{widgetTitle || "Chat"}</span>
                <Sparkles className="size-4 shrink-0 text-amber-200/90" aria-hidden />
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Zelfde thema als je widget. {scannedCount > 0 ? `${scannedCount} pagina's ingeladen.` : ""}
              </p>
            </div>
          </div>
        </header>

        <div
          className="space-y-2.5 overflow-y-auto bg-gradient-to-b from-[#f9f7f4] to-[#f3f0eb] px-5 py-3"
          style={{ height: chatHeight }}
        >
          {chat.map((m, i) => (
            <div
              key={`${i}-${m.role}`}
              className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-sm"
                    : "border border-white/10 bg-gradient-to-br from-zinc-700 to-zinc-900 text-white shadow-lg",
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

        <div className="border-t border-gray-200 px-5 py-2">
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
          <p className="mb-1.5 text-center text-[11px] text-gray-500">Sleep omhoog/omlaag om meer chat te zien</p>
        </div>
        <div className="space-y-2.5 border-t border-stone-200/80 bg-white/95 px-5 py-3 backdrop-blur-sm">
          {props.contactPreview.tel_href || props.contactPreview.whatsapp_href ? (
            <div className="flex flex-wrap gap-2 border-b border-stone-100 pb-3">
              {props.contactPreview.tel_href ? (
                <a
                  href={props.contactPreview.tel_href}
                  className="flex min-h-[52px] min-w-[min(100%,160px)] flex-1 items-center gap-2.5 rounded-xl border bg-white px-3 py-2 text-left shadow-sm transition hover:bg-stone-50 hover:shadow-md"
                  style={{
                    borderColor: `rgba(${hexToRgbCss(widgetPrimary)}, 0.28)`,
                  }}
                >
                  <span className="text-lg leading-none text-stone-700" aria-hidden>
                    ☎
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[12px] font-semibold text-stone-900">Bellen</span>
                    <span className="truncate text-[10px] font-medium text-stone-500">
                      {props.contactPreview.phone_display || "Direct bellen"}
                    </span>
                  </span>
                </a>
              ) : null}
              {props.contactPreview.whatsapp_href ? (
                <a
                  href={props.contactPreview.whatsapp_href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[52px] min-w-[min(100%,160px)] flex-1 items-center gap-2.5 rounded-xl border border-emerald-600/25 bg-emerald-50/60 px-3 py-2 text-left shadow-sm transition hover:border-emerald-600/40 hover:bg-emerald-50"
                >
                  <span className="text-lg leading-none" aria-hidden>
                    💬
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[12px] font-semibold text-emerald-900">WhatsApp</span>
                    <span className="text-[10px] font-medium text-emerald-800/90">Opent de app</span>
                  </span>
                </a>
              ) : null}
            </div>
          ) : (
            <p className="border-b border-stone-100 pb-3 text-[11px] leading-relaxed text-stone-500">
              Nummers voor bellen/WhatsApp komen uit je{" "}
              <Link href="/dashboard/settings?tab=business" className="font-medium text-primary underline-offset-2 hover:underline">
                bedrijfsinstellingen
              </Link>
              .
            </p>
          )}
          {showStarterChoices ? (
            <>
              {validPreviewStarters.length === 0 ? (
                <p className="text-center text-xs text-amber-800">
                  Vul labels en uitleg in bij snelle keuzes — of zet de schakelaar uit.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    aria-expanded={quickOptionsOpen}
                    onClick={() => setQuickOptionsOpen((o) => !o)}
                    className="flex w-full flex-col gap-1 rounded-2xl border border-stone-300/80 bg-white px-3.5 py-2.5 text-left shadow-sm transition hover:border-stone-400 hover:bg-stone-50"
                    style={{
                      borderColor: `rgba(${hexToRgbCss(widgetPrimary)}, 0.22)`,
                    }}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-stone-900">
                        {quickOptionsOpen
                          ? "Opties verbergen"
                          : validPreviewStarters.length === 1
                            ? "1 snelle optie beschikbaar"
                            : `${validPreviewStarters.length} snelle opties beschikbaar`}
                      </span>
                      {quickOptionsOpen ? (
                        <ChevronUp className="size-4 shrink-0 text-stone-600" aria-hidden />
                      ) : (
                        <ChevronDown className="size-4 shrink-0 text-stone-600" aria-hidden />
                      )}
                    </span>
                    <span className="text-[11px] leading-snug text-stone-500">
                      {quickOptionsOpen
                        ? "Tik om de lijst kleiner te maken"
                        : starterPreviewHint
                          ? `o.a. ${starterPreviewHint} — tik om te openen`
                          : "Tik om opties te tonen"}
                    </span>
                  </button>
                  {quickOptionsOpen ? (
                    <div className="flex flex-col gap-2 pt-1">
                      <p className="text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                        Kies een optie
                      </p>
                      {validPreviewStarters.map((s, idx) => (
                        <button
                          key={`pv-${idx}-${s.label.slice(0, 24)}`}
                          type="button"
                          disabled={replying}
                          onClick={() => runPreview(s.prompt, s.label)}
                          className="flex w-full flex-col items-start gap-0.5 rounded-2xl border border-stone-300/60 bg-white/90 px-3.5 py-2.5 text-left shadow-sm transition hover:bg-white hover:shadow-md disabled:opacity-50"
                          style={{
                            borderColor: "rgba(120, 113, 108, 0.35)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `rgba(${hexToRgbCss(widgetPrimary)}, 0.55)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(120, 113, 108, 0.35)";
                          }}
                        >
                          <span className="text-[13px] font-semibold text-stone-900">{s.label}</span>
                          <span className="text-[11px] font-medium text-stone-400">Meer informatie</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <p className="text-center text-xs text-stone-500">Snelle keuzes staan uit — alleen vrije invoer.</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Of typ je eigen vraag…"
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
              className="shrink-0 border text-white shadow-sm hover:opacity-95"
              style={{
                background: `linear-gradient(165deg, ${shadeHex(widgetPrimary, 0.72)}, ${shadeHex(widgetPrimary, 0.38)})`,
                borderColor: `rgba(${hexToRgbCss(widgetPrimary)}, 0.35)`,
              }}
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
    </div>
  );
}
