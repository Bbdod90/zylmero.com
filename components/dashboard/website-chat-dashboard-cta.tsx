import Link from "next/link";
import { ArrowRight, Bot, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function WebsiteChatDashboardCta({
  hasEmbeddedBot,
  firstChatbotId,
}: {
  hasEmbeddedBot: boolean;
  firstChatbotId?: string;
}) {
  const detailHref = firstChatbotId ? `/dashboard/chatbots/${firstChatbotId}` : "/dashboard/chatbots/create";

  return (
    <Card className="cf-dashboard-panel overflow-hidden rounded-2xl border-primary/20 bg-gradient-to-r from-primary/[0.07] via-card to-card dark:from-primary/[0.12] dark:via-card dark:to-card">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div className="flex min-w-0 gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-inner-soft ring-1 ring-primary/15">
            <Bot className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">Website-chat op je eigen site</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {hasEmbeddedBot ? (
                <>
                  Je chatbot staat klaar — vul kennis aan, kopieer de embed-code onderaan de pagina{" "}
                  <span className="font-medium text-foreground">Website-chat</span>, en test met{" "}
                  <span className="font-medium text-foreground">Live test</span>.
                </>
              ) : (
                <>
                  Maak een bot aan onder <span className="font-medium text-foreground">Website-chat</span>, plak één regel code op je
                  website, en vang klanten ook af als je aan het werk bent.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end lg:flex-row">
          <Button asChild className="rounded-lg px-5 font-semibold shadow-sm">
            <Link href={detailHref}>
              {hasEmbeddedBot ? (
                <>
                  <Code2 className="mr-2 size-4" aria-hidden />
                  Embed-code &amp; test
                </>
              ) : (
                <>
                  Chatbot aanmaken
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </>
              )}
            </Link>
          </Button>
          {!hasEmbeddedBot ? (
            <Button asChild variant="outline" className="rounded-lg border-primary/25 bg-background/70">
              <Link href="/dashboard/chatbots">Overzicht Website-chat</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
