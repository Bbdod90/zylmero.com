import Link from "next/link";
import { Bot, ClipboardPaste, Sparkles, TestTube2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  {
    icon: Sparkles,
    title: "Instellingen",
    body: "Naam, toon en instructies bepalen hoe de bot op je site klinkt en wat hij mag doen.",
    anchor: "#website-chat-instellingen",
  },
  {
    icon: Bot,
    title: "Kennis (optioneel)",
    body: "Tekst of een URL (ook domein.nl): de server haalt waar mogelijk paginatekst op — zo kan de bot producten en prijzen noemen die op je site staan.",
    anchor: "#website-chat-kennis",
  },
  {
    icon: ClipboardPaste,
    title: "Embed op je website",
    body: "Kopieer één regel script en plak die vóór </body>. Daarna staat de chat op elke pagina.",
    anchor: "#website-chat-embed",
  },
  {
    icon: TestTube2,
    title: "Live test",
    body: "Probeer hiernaast een echte klantvraag — zo weet je zeker dat alles werkt vóór je live gaat.",
    anchor: "#website-chat-live-test",
  },
] as const;

export function WebsiteChatSetupGuide({ variant = "full" }: { variant?: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      <Card className="border-border/55 bg-muted/15 dark:border-white/[0.08] dark:bg-card/40">
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Volgorde:</span> Maak een bot aan ↓ pas instellingen aan ↓ voeg optioneel kennis toe ↓ kopieer de
            embed-code ↓ test met <span className="font-medium text-foreground">Live test</span>. Open een bestaande chatbot om verder te gaan.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card shadow-sm ring-1 ring-black/[0.03] dark:border-white/[0.09] dark:bg-card/90 dark:ring-white/[0.04]">
      <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/[0.06] via-transparent to-teal-500/[0.04] pb-4 pt-6 dark:border-white/[0.07] dark:from-primary/[0.1] dark:to-transparent sm:pt-7">
        <CardTitle className="text-base text-foreground sm:text-lg">Zo zet je je website-chat live</CardTitle>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          Vier korte stappen — van teksten tot de regel code op je site. Alles staat op één pagina; scroll of tik op een stap.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6 sm:pb-7">
        <ol className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.anchor}>
                <Link
                  href={step.anchor}
                  className="flex gap-3 rounded-xl border border-border/50 bg-background/80 p-3.5 transition-colors hover:border-primary/35 hover:bg-muted/40 dark:border-white/[0.08] dark:hover:bg-white/[0.04]"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Icon className="size-3.5 shrink-0 text-primary opacity-90" aria-hidden />
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
