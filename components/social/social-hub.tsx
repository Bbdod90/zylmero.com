"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Apple,
  CalendarDays,
  Building2,
  Camera,
  MessageCircle,
  Music2,
  Share2,
  Unplug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  connectAppleCalendarAction,
  disconnectSocialAction,
} from "@/actions/social-connections";
import type { CompanySocialConnection } from "@/lib/queries/social-connections";
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
}: {
  connections: CompanySocialConnection[];
  metaConfigured: boolean;
  googleCalendarConfigured: boolean;
  flashError?: string | null;
  flashOk?: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const meta = connections.find((c) => c.provider === "meta");
  const googleCalendar = connections.find((c) => c.provider === "google_calendar");
  const appleCalendar = connections.find((c) => c.provider === "apple_calendar");
  const [appleIcsUrl, setAppleIcsUrl] = useState(() => {
    const raw = appleCalendar?.metadata?.ics_url;
    return typeof raw === "string" ? raw : "";
  });
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

  useEffect(() => {
    const raw = appleCalendar?.metadata?.ics_url;
    setAppleIcsUrl(typeof raw === "string" ? raw : "");
  }, [appleCalendar?.metadata]);

  function disconnect(provider: "meta" | "google_calendar" | "apple_calendar") {
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
          Socials & kanalen
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Verbind je zichtbaarheid
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Facebook, Instagram (Meta) en later TikTok en LinkedIn — berichten kunnen straks
          in dezelfde inbox terechtkomen als WhatsApp en e-mail. Start met Meta; andere
          platforms volgen.
        </p>
        {!isOwner ? (
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200/90">
            Alleen de bedrijfseigenaar kan Meta koppelen of ontkoppelen. Je ziet hier wel de
            status als die al ingesteld is.
          </p>
        ) : null}
      </header>

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

        <CardShell className="opacity-85">
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

        <CardShell className="opacity-85">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-500/15 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300">
                <Apple className="size-6" strokeWidth={1.6} aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Apple Agenda (iCal)</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Koppel een iCal/ICS feed zodat afspraakchecks ook Apple-agenda bezetting zien.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Input
              placeholder="https://.../calendar.ics"
              value={appleIcsUrl}
              onChange={(e) => setAppleIcsUrl(e.target.value)}
              disabled={!isOwner || pending}
              className="h-10 rounded-lg"
            />
            <div className="flex flex-wrap items-center gap-2">
              {isOwner ? (
                <Button
                  type="button"
                  size="sm"
                  className="rounded-lg"
                  disabled={pending}
                  onClick={() => {
                    start(async () => {
                      const res = await connectAppleCalendarAction({
                        icsUrl: appleIcsUrl,
                        displayName: "Apple Calendar (iCal)",
                      });
                      if (!res.ok) {
                        toast.error(res.error || "Koppelen mislukt");
                        return;
                      }
                      toast.success("Apple agenda gekoppeld.");
                      router.refresh();
                    });
                  }}
                >
                  Opslaan iCal URL
                </Button>
              ) : null}
              {appleCalendar?.status === "connected" ? (
                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-100">
                  Gekoppeld
                </span>
              ) : null}
              {isOwner && appleCalendar?.status === "connected" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg"
                  disabled={pending}
                  onClick={() => disconnect("apple_calendar")}
                >
                  <Unplug className="size-3.5" aria-hidden />
                  Ontkoppelen
                </Button>
              ) : null}
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Gebruik een private iCal-feed URL uit Apple/Google/Outlook. Zylmero leest alleen bezette blokken voor
            beschikbaarheidschecks.
          </p>
        </CardShell>

        <CardShell className="opacity-85">
          <div className="flex items-start gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-foreground/5">
              <Music2 className="size-6 text-foreground/70" strokeWidth={1.6} aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">TikTok</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Business messaging en leads — gepland. Geen publieke DM-API zoals Meta;
                we koppelen straks aan jouw workflow (o.a. formulieren en notificaties).
              </p>
              <span className="mt-3 inline-block rounded-full border border-border/60 px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                Binnenkort
              </span>
            </div>
          </div>
        </CardShell>

        <CardShell className="opacity-85">
          <div className="flex items-start gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-600/10">
              <Building2 className="size-6 text-blue-700 dark:text-blue-300" aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">LinkedIn</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                B2B-berichten en pagina-updates — gepland met officiële partner-flows waar
                dat mag volgens LinkedIn.
              </p>
              <span className="mt-3 inline-block rounded-full border border-border/60 px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                Binnenkort
              </span>
            </div>
          </div>
        </CardShell>
      </div>

      <CardShell>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Share2 className="size-4 text-primary" aria-hidden />
          Handig om te weten
        </div>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>Socials vullen je zichtbaarheid aan naast WhatsApp en websitechat.</li>
          <li>Berichten komen straks bij dezelfde plek als je andere kanalen.</li>
          <li>Vragen over rechten of pagina&apos;s? Meta helpt je stap voor stap tijdens het koppelen.</li>
        </ul>
      </CardShell>
    </div>
  );
}
