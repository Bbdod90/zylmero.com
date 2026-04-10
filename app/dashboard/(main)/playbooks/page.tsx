import Link from "next/link";
import { BookOpen, Lightbulb, Sparkles, Target } from "lucide-react";
import { PageFrame } from "@/components/layout/page-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      subtitle="Korte werkwijzen — geen theorie, wel wat werkt in de praktijk."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {PLAYBOOKS.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title} className="rounded-2xl border-white/[0.06]">
              <CardHeader>
                <Icon className="size-8 text-primary" />
                <CardTitle className="text-base font-semibold leading-snug">{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-10 rounded-2xl border-primary/20 bg-primary/[0.04]">
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
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/dashboard/growth">Naar groei &amp; referrals</Link>
          </Button>
        </CardContent>
      </Card>
    </PageFrame>
  );
}
