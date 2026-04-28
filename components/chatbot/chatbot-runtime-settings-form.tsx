"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { updateChatbotRuntimeSettingsAction } from "@/actions/chatbot-builder";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ChatbotRecord = {
  id: string;
  settings: Record<string, unknown> | null;
};

function readSettingsString(settings: Record<string, unknown> | null, key: string, fallback: string) {
  const value = settings?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readRules(settings: Record<string, unknown> | null): string {
  const rules = settings?.automation_regels;
  if (!Array.isArray(rules)) return "";
  return rules.filter((r): r is string => typeof r === "string").join("\n");
}

export function ChatbotRuntimeSettingsForm({ chatbot }: { chatbot: ChatbotRecord }) {
  const [communicatiestijl, setCommunicatiestijl] = useState<"zakelijk" | "informeel">(
    readSettingsString(chatbot.settings, "communicatiestijl", "zakelijk") === "informeel"
      ? "informeel"
      : "zakelijk",
  );
  const [antwoordLengte, setAntwoordLengte] = useState<"kort" | "normaal" | "uitgebreid">(() => {
    const raw = readSettingsString(chatbot.settings, "antwoord_lengte", "kort");
    if (raw === "normaal" || raw === "uitgebreid") return raw;
    return "kort";
  });
  const [automationRegels, setAutomationRegels] = useState(readRules(chatbot.settings));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const previewText = useMemo(
    () =>
      `Stijl: ${communicatiestijl}\nAntwoordlengte: ${antwoordLengte}\nRegels: ${
        automationRegels.trim() ? "aangepast" : "standaard"
      }`,
    [communicatiestijl, antwoordLengte, automationRegels],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const res = await updateChatbotRuntimeSettingsAction({
      chatbotId: chatbot.id,
      communicatiestijl,
      antwoordLengte,
      automationRegels,
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Runtime instellingen</h2>
        <p className="mt-1 text-sm text-gray-600">
          Deze instellingen beïnvloeden de toon en structuur van je chatbot-antwoorden.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="communicatiestijl">Communicatiestijl</Label>
        <select
          id="communicatiestijl"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
          value={communicatiestijl}
          onChange={(e) => setCommunicatiestijl(e.target.value === "informeel" ? "informeel" : "zakelijk")}
        >
          <option value="zakelijk">Zakelijk</option>
          <option value="informeel">Informeel</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="antwoordLengte">Antwoord lengte</Label>
        <select
          id="antwoordLengte"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
          value={antwoordLengte}
          onChange={(e) => {
            const next = e.target.value;
            setAntwoordLengte(next === "normaal" || next === "uitgebreid" ? next : "kort");
          }}
        >
          <option value="kort">Kort</option>
          <option value="normaal">Normaal</option>
          <option value="uitgebreid">Uitgebreid</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="automationRegels">Automation regels</Label>
        <Textarea
          id="automationRegels"
          value={automationRegels}
          onChange={(e) => setAutomationRegels(e.target.value)}
          className="min-h-[130px]"
          placeholder="Elke regel is een extra interne richtlijn voor de chatbot."
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Preview intern</p>
        <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{previewText}</pre>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-700">Instellingen opgeslagen.</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Opslaan
      </Button>
    </form>
  );
}
