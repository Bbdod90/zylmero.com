import { BRAND_NAME } from "@/lib/brand";

export type OutreachChannel =
  | "instagram_dm"
  | "whatsapp"
  | "email"
  | "follow_up"
  | "closing";

export interface OutreachScript {
  id: OutreachChannel;
  label: string;
  body: string;
}

export const OUTREACH_SCRIPTS: OutreachScript[] = [
  {
    id: "instagram_dm",
    label: "Instagram (DM)",
    body: `Hey! Korte vraag — mis je soms berichten van klanten als je druk bent in de werkplaats?

Ik heb een kleine tool gebouwd die direct antwoordt en meer werk uit DM’s haalt. Ik kan je in 2 min laten zien hoe het werkt, als je wilt.`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    body: `Hi — ik ben [Jouw naam]. Ik help lokale garages WhatsApp om te zetten in geboekte afspraken (zonder iemand extra aan de balie).

Zin in een kort gesprek deze week?`,
  },
  {
    id: "email",
    label: "E-mail outreach",
    body: `Onderwerp: Snel idee voor [Bedrijfsnaam]

Hoi,

Ik zie dat jullie klanten via telefoon/WhatsApp benaderen. Veel garages verliezen werk simpelweg omdat er niet binnen een uur wordt geantwoord.

Ik bouwde ${BRAND_NAME} — het antwoordt in jullie toon en stuurt mensen richting een boeking. Heb je 10 minuten om te kijken?

Groet,
[Jouw naam]`,
  },
  {
    id: "follow_up",
    label: "Opvolging",
    body: `Hey — even een duwtje. Snap helemaal dat je het druk hebt.

Als je ooit wilt zien hoe werkplaatsen in seconden antwoorden (en de agenda vullen), kan ik een demo-link sturen. Geen druk.`,
  },
  {
    id: "closing",
    label: "Afsluiten",
    body: `Helder. Mijn voorstel: start met 14 dagen proberen — je richt WhatsApp/inbox erop en kijkt of er meer werk binnenkomt.

Als het niet bevalt, stop je. Zal ik dat voor je klaarzetten?`,
  },
];
