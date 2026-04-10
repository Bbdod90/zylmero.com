/** Nederlandse marketingmails — later uitbreidbaar naar WhatsApp. */

const baseStyle = `
  body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #0f172a; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 24px; }
  .btn { display: inline-block; padding: 12px 20px; border-radius: 12px; background: #0d9488; color: #fff !important; text-decoration: none; font-weight: 600; }
  .muted { color: #64748b; font-size: 14px; }
`;

function site() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://closerflow.app"
  );
}

function shell(title: string, inner: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyle}</style></head><body><div class="wrap"><h1 style="font-size:20px;">${title}</h1>${inner}<p class="muted">— Team CloserFlow</p></div></body></html>`;
}

export function getTemplate(templateKey: string): {
  subject: string;
  html: (payload: Record<string, unknown>) => string;
} | null {
  const s = site();
  switch (templateKey) {
    case "drip_1h":
      return {
        subject: "Je eerste klant vandaag nog?",
        html: () =>
          shell(
            "Even checken — je bent gestart",
            `<p>Je wilde klanten sneller vasthouden. Dat kan met CloserFlow: AI die antwoordt, offertes en afspraken opvolgt.</p>
            <p><a class="btn" href="${s}/signup">Ga verder met je account</a></p>
            <p class="muted">Tip: reageer binnen 2 minuten — de winnaar krijgt de afspraak.</p>`,
          ),
      };
    case "drip_1d":
      return {
        subject: "Hoeveel aanvragen laat je liggen?",
        html: () =>
          shell(
            "Dag 1 — omzet op het spel",
            `<p>Trage reacties kosten je omzet. CloserFlow bundelt berichten, scoort leads en helpt je offertes en afspraken te sluiten.</p>
            <p><a class="btn" href="${s}/dashboard">Open je dashboard</a></p>`,
          ),
      };
    case "drip_3d":
      return {
        subject: "Laatste duw: CloserFlow in 10 minuten live",
        html: () =>
          shell(
            "Dag 3 — mis geen klanten meer",
            `<p>Je concurrenten antwoorden wel binnen minuten. Zet je AI aan en koppel je kanaal — dan zie je pijplijn in euro’s.</p>
            <p><a class="btn" href="${s}/dashboard/upgrade">Bekijk plannen</a></p>
            <p class="muted">Later uitbreidbaar met WhatsApp-reminders.</p>`,
          ),
      };
    default:
      return null;
  }
}
