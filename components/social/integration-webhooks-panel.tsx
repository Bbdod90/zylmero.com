"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  saveIntegrationWebhooksAction,
  regenerateWebhookSecretAction,
  testIntegrationWebhooksAction,
} from "@/actions/integration-webhooks";
import { INTEGRATION_WEBHOOK_MAX_URLS } from "@/lib/integrations/outbound-webhook-constants";
import { cn } from "@/lib/utils";

export type IntegrationWebhooksInitial = {
  enabled: boolean;
  urls: string[];
  hasSecret: boolean;
};

export function IntegrationWebhooksPanel({
  initial,
  isOwner,
}: {
  initial: IntegrationWebhooksInitial;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [urlsText, setUrlsText] = useState(initial.urls.join("\n"));
  const [hasSecret, setHasSecret] = useState(initial.hasSecret);

  const initialUrlsKey = initial.urls.join("\n");
  useEffect(() => {
    setEnabled(initial.enabled);
    setUrlsText(initialUrlsKey);
    setHasSecret(initial.hasSecret);
  }, [initial.enabled, initial.hasSecret, initialUrlsKey]);

  function parseUrls(): string[] {
    const lines = urlsText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const out: string[] = [];
    for (const line of lines) {
      out.push(line);
      if (out.length >= INTEGRATION_WEBHOOK_MAX_URLS) break;
    }
    return out;
  }

  function save() {
    start(async () => {
      const urls = parseUrls();
      const r = await saveIntegrationWebhooksAction({ enabled, urls });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      setHasSecret(Boolean(enabled && urls.length > 0 && (hasSecret || r.webhookSecret)));
      if (r.webhookSecret) {
        try {
          await navigator.clipboard.writeText(r.webhookSecret);
          toast.success(
            "Webhook-geheim gegenereerd en gekopieerd naar het klembord. Bewaar dit veilig — je ziet het zo niet terug.",
          );
        } catch {
          toast.success(
            "Webhook-geheim gegenereerd. Kopieer dit nu uit de melding — je ziet het zo niet terug.",
            { description: r.webhookSecret.slice(0, 24) + "…" },
          );
        }
      } else {
        toast.success("Opgeslagen.");
      }
      router.refresh();
    });
  }

  function regenerate() {
    start(async () => {
      const r = await regenerateWebhookSecretAction();
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      setHasSecret(true);
      try {
        await navigator.clipboard.writeText(r.secret);
        toast.success("Nieuw geheim gegenereerd en gekopieerd naar het klembord.");
      } catch {
        toast.success("Nieuw geheim gegenereerd.", {
          description: r.secret.slice(0, 28) + "…",
        });
      }
      router.refresh();
    });
  }

  function testPing() {
    start(async () => {
      const r = await testIntegrationWebhooksAction();
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      const failed = r.results.filter((x) => !x.ok);
      if (failed.length === 0) {
        toast.success(
          `Test gelukt voor ${r.results.length} endpoint${r.results.length === 1 ? "" : "s"}.`,
        );
      } else {
        toast.warning(`Test: ${failed.length} van ${r.results.length} mislukt.`, {
          description: failed.map((f) => `${f.url.slice(0, 48)}… → ${f.error ?? f.status}`).join(" · "),
        });
      }
    });
  }

  const urlsCount = parseUrls().length;

  return (
    <div className="flex items-start gap-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Webhook className="size-6" strokeWidth={1.6} aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Eigen integraties</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Koppel Zapier, Make, n8n of een eigen HTTPS-endpoint. Zylmero stuurt getekende JSON-webhooks
            (<span className="font-mono text-xs">X-Zylmero-Event</span>,{" "}
            <span className="font-mono text-xs">X-Zylmero-Signature</span>) zodat je downstream flows kunt bouwen.
          </p>
        </div>

        {!isOwner ? (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                initial.enabled
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                  : "border-border/60 bg-muted/40 text-muted-foreground",
              )}
            >
              {initial.enabled ? "Webhooks aan" : "Webhooks uit"}
            </span>
            <span className="text-sm text-muted-foreground">
              Alleen de eigenaar kan URLs en het geheim beheren.
            </span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="integration-webhooks-enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                  disabled={pending}
                />
                <Label htmlFor="integration-webhooks-enabled" className="cursor-pointer text-sm font-medium">
                  Uitgaande webhooks
                </Label>
              </div>
              <span className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
                max. {INTEGRATION_WEBHOOK_MAX_URLS} URLs · alleen https://
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-urls" className="text-sm">
                Webhook-URLs (één per regel)
              </Label>
              <Textarea
                id="webhook-urls"
                rows={4}
                placeholder={`https://hooks.zapier.com/hooks/catch/...\nhttps://hook.eu2.make.com/...`}
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
                disabled={pending}
                className="font-mono text-xs sm:text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Handtekening: HMAC-SHA256 hex van de exacte JSON-body, header{" "}
                <span className="font-mono">X-Zylmero-Signature: sha256=&lt;hex&gt;</span>. Test met de knop hieronder.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="rounded-lg"
                disabled={pending}
                onClick={save}
              >
                {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Opslaan
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={pending || !enabled || urlsCount === 0 || !hasSecret}
                onClick={testPing}
              >
                Test webhook
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={pending}
                onClick={regenerate}
              >
                Nieuw geheim
              </Button>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {hasSecret ? (
                <>
                  Er is een webhook-geheim ingesteld (niet zichtbaar in dit scherm). Gebruik{" "}
                  <strong>Nieuw geheim</strong> als je endpoint roteert — daarna moet je het overal bijwerken.
                </>
              ) : (
                <>Sla op met webhooks aan om automatisch een geheim te genereren (eenmalig zichtbaar / naar klembord).</>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
