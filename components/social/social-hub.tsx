"use client";

import Link from "next/link";
import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  Cable,
  LayoutGrid,
  Mail,
  MessageCircle,
  Share2,
  Smartphone,
  Unplug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { disconnectSocialAction } from "@/actions/social-connections";
import type { CompanySocialConnection } from "@/lib/queries/social-connections";
import {
  IntegrationWebhooksPanel,
  type IntegrationWebhooksInitial,
} from "@/components/social/integration-webhooks-panel";
import { cn } from "@/lib/utils";

function CardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "cf-dashboard-panel relative overflow-hidden p-6 sm:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SocialHub({
  connections,
  metaConfigured,
  googleCalendarConfigured,
  flashError,
  flashOk,
  isOwner,
  integrationWebhooks,
}: {
  connections: CompanySocialConnection[];
  metaConfigured: boolean;
  googleCalendarConfigured: boolean;
  flashError?: string | null;
  flashOk?: boolean;
  isOwner: boolean;
  integrationWebhooks: IntegrationWebhooksInitial;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const meta = connections.find((c) => c.provider === "meta");
  const googleCalendar = connections.find((c) => c.provider === "google_calendar");
  const flashed = useRef(false);

  useEffect(() => {
    if (flashed.current) return;
    if (flashOk) {
      flashed.current = true;
      toast.success("Koppeling succesvol opgeslagen.");
      router.replace("/dashboard/socials", { scroll: false });
      return;
    }
    if (flashError) {
      flashed.current = true;
      toast.error(decodeURIComponent(flashError));
      router.replace("/dashboard/socials", { scroll: false });
    }
  }, [flashError, flashOk, router]);

  function disconnect(provider: "meta" | "google_calendar") {
    start(async () => {
      const r = await disconnectSocialAction(provider);
      if (r.ok) toast.success("Koppeling verwijderd.");
      else toast.error(r.error ?? "Mislukt");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Integraties
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Al je koppelingen op één plek
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          WhatsApp, Gmail of Outlook, websitechat, Facebook/Instagram, agenda én Zapier/Make —
          configured hier of via de gekoppelde schermen. Zo blijft alles onder één dak bij Zylmero.
        </p>
        {!isOwner ? (
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200/90">
            Alleen de eigenaar kan nieuwe accounts koppelen of verbreken. Je ziet wel de status van
            bestaande koppelingen.
          </p>
        ) : null}
      </header>

      <CardShell className="border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Cable className="size-6" strokeWidth={1.6} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold tracking-tight">Inbox & klantcontact</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              WhatsApp Business, inkomende mail (Gmail/Microsoft) en je website-widget — straks dezelfde
              inbox. Start bij Kanalen of stel direct een kanaal in onder Instellingen.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Button
            asChild
            variant="default"
            className="h-auto min-h-[4.25rem] justify-start gap-3 rounded-xl px-4 py-3 text-left shadow-sm"
          >
            <Link href="/dashboard/ai-koppelingen" className="flex items-start">
              <LayoutGrid className="mt-0.5 size-5 shrink-0 opacity-90" aria-hidden />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1 font-semibold leading-tight">
                  Kanalen & inbox
                  <ArrowUpRight className="size-3.5 shrink-0 opacity-70" aria-hidden />
                </span>
                <span className="text-xs font-normal leading-snug text-primary-foreground/85">
                  Overzicht: WhatsApp, widget, mail — status en volgende stappen
                </span>
              </span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto min-h-[4.25rem] justify-start gap-3 rounded-xl px-4 py-3 text-left"
          >
            <Link href="/dashboard/settings?tab=whatsapp" className="flex items-start">
              <Smartphone className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold leading-tight text-foreground">WhatsApp</span>
                <span className="text-xs font-normal leading-snug text-muted-foreground">
                  Business-nummer en widget-knop instellen
                </span>
              </span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto min-h-[4.25rem] justify-start gap-3 rounded-xl px-4 py-3 text-left"
          >
            <Link href="/dashboard/settings?tab=email" className="flex items-start">
              <Mail className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold leading-tight text-foreground">Gmail & Outlook</span>
                <span className="text-xs font-normal leading-snug text-muted-foreground">
                  Google of Microsoft voor inkomende klantmail
                </span>
              </span>
            </Link>
          </Button>
        </div>
      </CardShell>

      <div className="grid gap-5 lg:grid-cols-2">
        <CardShell>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300">
                <MessageCircle className="size-6" strokeWidth={1.6} aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Meta (Facebook + Instagram)
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pages, Messenger en Instagram DM via één login.
                </p>
              </div>
            </div>
            <Camera className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {meta?.status === "connected" ? (
              <>
                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-100">
                  Gekoppeld
                  {meta.display_name ? ` · ${meta.display_name}` : ""}
                </span>
                {isOwner ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-lg"
                    disabled={pending}
                    onClick={() => disconnect("meta")}
                  >
                    <Unplug className="size-3.5" aria-hidden />
                    Ontkoppelen
                  </Button>
                ) : null}
              </>
            ) : meta?.status === "error" ? (
              <>
                <span className="text-sm text-destructive">
                  {meta.last_error ?? "Koppeling mislukt"}
                </span>
                {isOwner ? (
                  <Button asChild size="sm" className="rounded-lg" disabled={!metaConfigured}>
                    <a href="/api/oauth/meta">Opnieuw proberen</a>
                  </Button>
                ) : null}
              </>
            ) : isOwner ? (
              <Button asChild size="sm" className="rounded-lg" disabled={!metaConfigured}>
                <a href="/api/oauth/meta?next=socials">Verbinden met Meta</a>
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">Nog niet gekoppeld.</span>
            )}
          </div>

          {!metaConfigured ? (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Deze koppeling is op dit account nog niet vrijgegeven. Neem contact op met support als je Facebook of
              Instagram gekoppeld wilt hebben.
            </p>
          ) : (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Je gaat naar Meta om toestemming te geven. Daarna kun je berichten vanaf je pagina&apos;s laten
              binnenlopen bij je team.
            </p>
          )}
        </CardShell>

        <CardShell>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                <CalendarDays className="size-6" strokeWidth={1.6} aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Google Agenda</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vrij/bezet-check voor afspraakverzoeken vanuit chatbot en inbox.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {googleCalendar?.status === "connected" ? (
              <>
                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-100">
                  Gekoppeld
                  {googleCalendar.display_name ? ` · ${googleCalendar.display_name}` : ""}
                </span>
                {isOwner ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-lg"
                    disabled={pending}
                    onClick={() => disconnect("google_calendar")}
                  >
                    <Unplug className="size-3.5" aria-hidden />
                    Ontkoppelen
                  </Button>
                ) : null}
              </>
            ) : googleCalendar?.status === "error" ? (
              <>
                <span className="text-sm text-destructive">
                  {googleCalendar.last_error ?? "Koppeling mislukt"}
                </span>
                {isOwner ? (
                  <Button asChild size="sm" className="rounded-lg" disabled={!googleCalendarConfigured}>
                    <a href="/api/oauth/google-calendar">Opnieuw proberen</a>
                  </Button>
                ) : null}
              </>
            ) : isOwner ? (
              <Button asChild size="sm" className="rounded-lg" disabled={!googleCalendarConfigured}>
                <a href="/api/oauth/google-calendar">Koppel Google Agenda</a>
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">Nog niet gekoppeld.</span>
            )}
          </div>

          {!googleCalendarConfigured ? (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Zet eerst `GOOGLE_OAUTH_CLIENT_ID` en `GOOGLE_OAUTH_CLIENT_SECRET` om deze koppeling vrij te geven.
            </p>
          ) : (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Zylmero checkt bij afspraakverzoeken automatisch of het gewenste tijdslot bezet is in je Google Agenda.
            </p>
          )}
        </CardShell>

        <CardShell className="lg:col-span-2">
          <IntegrationWebhooksPanel initial={integrationWebhooks} isOwner={isOwner} />
        </CardShell>
      </div>

      <CardShell>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Share2 className="size-4 text-primary" aria-hidden />
          Handig om te weten
        </div>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="font-medium text-foreground">Inbox</strong> (WhatsApp, mail, widget):{" "}
            <Link href="/dashboard/ai-koppelingen" className="font-medium text-primary underline-offset-4 hover:underline">
              Kanalen & inbox
            </Link>
            .
          </li>
          <li>
            <strong className="font-medium text-foreground">Social</strong>: Meta voor Facebook/Instagram — berichten richting je team.
          </li>
          <li>
            <strong className="font-medium text-foreground">Rest van je stack</strong>: gebruik webhooks + Zapier/Make om Gmail-notities, databases of duizenden andere apps aan Zylmero te hangen.
          </li>
        </ul>
      </CardShell>
    </div>
  );
}
