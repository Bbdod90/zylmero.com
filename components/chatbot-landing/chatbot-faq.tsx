"use client";

import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Is dit moeilijk om te installeren?",
    a: "Nee. Je krijgt een stukje code dat je op je website plakt — of we helpen je kort welke knop je waar klikt. Geen programmeerwerk nodig.",
  },
  {
    q: "Werkt dit op mijn website?",
    a: "Ja. Of je nu WordPress, Wix, Squarespace of een maatwerk-site hebt: de chatbot verschijnt als een widget op je pagina.",
  },
  {
    q: "Wat als klanten rare vragen stellen?",
    a: "De chatbot antwoordt netjes en haalt jou erbij als het te specifiek wordt. Jij bepaalt wat hij wel en niet mag beloven.",
  },
  {
    q: "Kan ik stoppen?",
    a: "Ja. Geen jaarcontract — maandelijks opzegbaar. Eerst uitproberen kan ook zonder betaaldata.",
  },
] as const;

export function ChatbotFaq() {
  return (
    <div className="mt-10 space-y-3">
      {ITEMS.map((item) => (
        <details
          key={item.q}
          className="group cf-landing-pro-card open:shadow-[0_26px_70px_-42px_rgb(0_0_0/0.55)] [&[open]]:ring-1 [&[open]]:ring-primary/15"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[0.9375rem] font-medium text-foreground md:px-6">
            {item.q}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <p className="border-t border-border/35 px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground dark:border-white/[0.07] md:px-6">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
