"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { enqueueNewsletterToAllLeads } from "@/actions/email-campaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type NewsletterCampaignRow = {
  id: string;
  subject: string;
  total_recipients: number;
  created_at: string;
  status: string;
};

export function NewsletterWorkspace({
  demoMode,
  leadsWithEmailCount,
  recentCampaigns,
}: {
  demoMode: boolean;
  leadsWithEmailCount: number;
  recentCampaigns: NewsletterCampaignRow[];
}) {
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState(
    "<p>Beste {{voornaam}},</p>\n\n<p></p>\n\n<p>Groet,</p>",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await enqueueNewsletterToAllLeads(subject, bodyHtml);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMessage(
        `${res.data.queued} e-mail(s) in de wachtrij. Ze worden automatisch verstuurd (in batches).`,
      );
      setSubject("");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <section
        className={cn(
          "rounded-2xl border border-border/60 bg-card/40 p-5 shadow-inner-soft backdrop-blur-sm sm:p-6",
          "dark:border-white/[0.08] dark:bg-black/20",
        )}
      >
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Nieuwsbrief naar al je klanten
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Iedere lead in <span className="font-medium text-foreground">Klanten</span> met een
          geldig e-mailadres ontvangt deze mail. Gebruik in je HTML{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{voornaam}}"}</code> of{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{naam}}"}</code> voor
          personalisatie.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Nu <span className="font-medium text-foreground">{leadsWithEmailCount}</span>{" "}
          ontvanger(s) met e-mail.
        </p>

        <p className="mt-3 text-xs text-muted-foreground">
          Technisch: verzending loopt via de bestaande wachtrij en cron{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
            /api/cron/marketing-drip
          </code>{" "}
          (met <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">CRON_SECRET</code>
          ). Zet <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
            RESEND_API_KEY
          </code>{" "}
          in productie.
        </p>

        {demoMode ? (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
            In demo-modus kun je geen campagnes versturen. Schakel demo uit om nieuwsbrieven te
            sturen.
          </p>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nl-subject">Onderwerp</Label>
              <Input
                id="nl-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Bijv. Nieuws van dit seizoen"
                maxLength={200}
                required
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nl-body">Bericht (HTML)</Label>
              <Textarea
                id="nl-body"
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={14}
                className="min-h-[220px] font-mono text-[13px] leading-relaxed"
                disabled={pending}
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                Je mag een volledige HTML-pagina plakken, of alleen de inhoud — dan zetten wij een
                nette omlijsting eromheen met jouw onderwerp als titel.
              </p>
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
                {message}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={pending || leadsWithEmailCount < 1}
              className="min-h-11 w-full sm:w-auto"
            >
              {pending ? "Bezig…" : "In wachtrij zetten"}
            </Button>
          </form>
        )}
      </section>

      {recentCampaigns.length > 0 ? (
        <section
          className={cn(
            "rounded-2xl border border-border/60 bg-card/30 p-5 sm:p-6",
            "dark:border-white/[0.08] dark:bg-black/15",
          )}
        >
          <h3 className="text-sm font-semibold text-foreground">Recente campagnes</h3>
          <ul className="mt-3 divide-y divide-border/60 dark:divide-white/[0.08]">
            {recentCampaigns.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0">
                <span className="min-w-0 font-medium text-foreground">{c.subject}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {c.total_recipients} ontvangers ·{" "}
                  {new Date(c.created_at).toLocaleString("nl-NL", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
