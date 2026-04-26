"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  Camera,
  MessageCircle,
  Music2,
  Share2,
  Unplug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { disconnectSocialAction } from "@/actions/social-connections";
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
  flashError,
  flashOk,
  isOwner,
}: {
  connections: CompanySocialConnection[];
  metaConfigured: boolean;
  flashError?: string | null;
  flashOk?: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const meta = connections.find((c) => c.provider === "meta");
  const flashed = useRef(false);

  useEffect(() => {
    if (flashed.current) return;
    if (flashOk) {
      flashed.current = true;
      toast.success("Meta succesvol gekoppeld.");
      router.replace("/dashboard/socials", { scroll: false });
      return;
    }
    if (flashError) {
      flashed.current = true;
      toast.error(decodeURIComponent(flashError));
      router.replace("/dashboard/socials", { scroll: false });
    }
  }, [flashError, flashOk, router]);

  function disconnect(provider: "meta") {
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
                <a href="/api/oauth/meta">Verbinden met Meta</a>
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
