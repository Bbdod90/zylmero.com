import Link from "next/link";
import { Bot, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Helpt klanten die denken dat dit scherm “de chatbot” is — de echte site-widget zit onder Website-chat. */
export function AiWebsiteChatCallout() {
  return (
    <Card className="mb-8 overflow-hidden border-primary/22 bg-gradient-to-r from-primary/[0.07] via-card to-card dark:from-primary/[0.12]">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Bot className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">Chat op je eigen website</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Deze pagina stuurt vooral <span className="font-medium text-foreground">toon &amp; stijl</span>. De zichtbare
              klant-chat op je site bouw je onder <span className="font-medium text-foreground">Website-chat</span> — met
              wizard, embed-code en live test.
            </p>
          </div>
        </div>
        <Button asChild className="h-11 shrink-0 rounded-xl px-5 shadow-sm">
          <Link href="/dashboard/chatbots/create">
            Naar Website-chat
            <ChevronRight className="ml-1 size-4 opacity-90" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
