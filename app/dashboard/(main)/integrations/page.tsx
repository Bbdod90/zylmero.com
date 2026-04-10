import Link from "next/link";
import { Code2, Plug, Settings } from "lucide-react";
import { getAuth } from "@/lib/auth";
import { PageFrame } from "@/components/layout/page-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WidgetSettings } from "@/components/settings/widget-settings";
import { resolveSiteUrl } from "@/lib/site-url";

export default async function IntegrationsPage() {
  const auth = await getAuth();
  if (!auth.company) return null;

  const siteUrl = resolveSiteUrl();
  const token = auth.company.widget_embed_token;

  return (
    <PageFrame
      title="Integraties"
      subtitle="Website-widget en toekomstige koppelingen — alles op één plek."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {token ? (
            <WidgetSettings siteOrigin={siteUrl} embedToken={token} />
          ) : (
            <Card className="rounded-2xl border-amber-500/20 bg-amber-500/[0.04]">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Widget-token ontbreekt</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Voer de migratie uit die <code className="rounded bg-muted px-1">widget_embed_token</code>{" "}
                  op companies zet, of open instellingen om te verversen.
                </p>
                <Button className="mt-4 rounded-xl" asChild>
                  <Link href="/dashboard/settings?tab=widget">
                    <Settings className="mr-2 size-4" />
                    Instellingen
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-white/[0.06]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plug className="size-4 text-primary" />
                <CardTitle className="text-base font-semibold">API</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Leads via widget gaan naar <code className="rounded bg-muted px-1">/api/widget/lead</code>{" "}
                (POST, token in URL).
              </p>
              {token ? (
                <Button variant="outline" size="sm" className="rounded-xl" asChild>
                  <a
                    href={`${siteUrl.replace(/\/$/, "")}/api/embed/widget?token=${encodeURIComponent(token)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Code2 className="mr-2 size-4" />
                    Open embed-URL
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Stripe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Facturatie en abonnementen lopen via Stripe-webhooks (
                <code className="rounded bg-muted px-1">/api/stripe/webhook</code>
                ). Zet <code className="rounded bg-muted px-1">STRIPE_SECRET_KEY</code>{" "}
                en prijs-ID&apos;s in je omgeving.
              </p>
              <Button variant="outline" size="sm" className="rounded-xl" asChild>
                <Link href="/dashboard/settings?tab=billing">Naar facturatie</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Google Agenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Geplande koppeling: tweerichtingssync van afspraken (OAuth, alleen
                lees/schrijf op gekozen agenda). Configureer hier straks client-ID
                en redirect.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-base font-semibold">E-mail (Resend)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Transactionele e-mail en herinneringen gebruiken Resend wanneer{" "}
                <code className="rounded bg-muted px-1">RESEND_API_KEY</code> en{" "}
                <code className="rounded bg-muted px-1">RESEND_FROM_EMAIL</code> gezet zijn.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-dashed border-white/[0.12] bg-muted/5">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Roadmap</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-inside list-disc space-y-2">
                <li>WhatsApp Business Cloud (Meta) na goedkeuring</li>
                <li>Webhooks voor CRM-export</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageFrame>
  );
}
