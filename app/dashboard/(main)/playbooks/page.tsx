import { BookOpen, Lightbulb, Sparkles, Target } from "lucide-react";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLAYBOOKS = [
  {
    icon: Target,
    title: "Binnen 2 minuten reageren",
    body: "Zet een vaste plek voor de inbox (tablet of telefoon). Eerste antwoord hoeft niet compleet — alleen bevestiging en volgende stap.",
  },
  {
    icon: Lightbulb,
    title: "Van vraag naar prijs",
    body: "Vraag eerst om kenteken, datum, of type klus — dan voelt de klant serieus genomen. Daarna pas offerte of range.",
  },
  {
    icon: Sparkles,
    title: "AI als voorstel, niet als robot",
    body: "Laat AI een eerste concept sturen en pas aan met jouw toon. Zo blijft het menselijk én snel.",
  },
];

export default function PlaybooksPage() {
  return (
    <PageFrame
      title="Playbooks"
      subtitle="Korte werkwijzen, premium uitgevoerd — direct toepasbaar in je dagelijkse flow."
    >
      <DashboardWorkSurface>
        <div className="grid gap-5 md:grid-cols-3">
          {PLAYBOOKS.map((p) => {
            const Icon = p.icon;
            return (
              <Card
                key={p.title}
                className="cf-dashboard-panel overflow-hidden border-border/60 bg-gradient-to-br from-card to-card/80 shadow-none dark:border-white/[0.1]"
              >
                <CardHeader>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="text-base font-semibold leading-snug">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="cf-dashboard-panel mt-10 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/[0.08] via-card to-card shadow-none dark:from-primary/[0.13]">
          <CardHeader className="flex flex-row items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            <CardTitle className="text-base font-semibold">Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Klanttevredenheid (NPS)</strong> na
              afspraken — korte pulse zodat je weet of je snelheid ook als kwaliteit voelt.
            </p>
            <p>
              <strong className="text-foreground">Bronnen-attributie</strong> — zie welk
              kanaal (widget, WhatsApp, handmatig) de meeste waarde levert.
            </p>
            <p className="text-xs text-muted-foreground">
              Nieuwe playbooks volgen binnenkort in dit overzicht.
            </p>
          </CardContent>
        </Card>
      </DashboardWorkSurface>
    </PageFrame>
  );
}
