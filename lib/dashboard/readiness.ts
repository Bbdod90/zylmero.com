/** Dashboard “klanten klaar” — taal voor ondernemers, geen techniek. */

export type ReadinessTone = "bad" | "warn" | "good";

export type ReadinessRow = {
  id: string;
  tone: ReadinessTone;
  label: string;
};

export type OnboardingStepUi = "done" | "current" | "upcoming";

export type CustomerReadiness = {
  rows: ReadinessRow[];
  percent: number;
  onboarding: {
    ai: OnboardingStepUi;
    channel: OnboardingStepUi;
    live: OnboardingStepUi;
  };
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function buildCustomerReadiness(input: {
  demoMode: boolean;
  needsAiSetup: boolean;
  knowledgeFilled: boolean;
  websiteLive: boolean;
  whatsappConnected: boolean;
  whatsappAutoReply: boolean;
  emailInboundEnabled: boolean;
  hasContactEmail: boolean;
}): CustomerReadiness {
  if (input.demoMode) {
    return {
      rows: [
        {
          id: "demo",
          tone: "good",
          label:
            "Dit is een demoomgeving. Met je eigen account vul je hier straks je echte kanalen en kennis in.",
        },
      ],
      percent: 72,
      onboarding: {
        ai: "done",
        channel: "current",
        live: "upcoming",
      },
    };
  }

  const aiDone = !input.needsAiSetup && input.knowledgeFilled;
  const aiPartial = !input.needsAiSetup && !input.knowledgeFilled;
  const waOk = input.whatsappConnected && input.whatsappAutoReply;
  const waPartial =
    (input.whatsappConnected || input.whatsappAutoReply) && !waOk;
  const mailOk = input.emailInboundEnabled && input.hasContactEmail;
  const mailPartial =
    (input.emailInboundEnabled || input.hasContactEmail) && !mailOk;

  const rows: ReadinessRow[] = [];

  rows.push({
    id: "web",
    tone: input.websiteLive ? "good" : "bad",
    label: input.websiteLive
      ? "Websitechat staat live — bezoekers kunnen je direct een vraag stellen."
      : "Websitechat staat nog uit — bezoekers op je site missen een snelle weg naar jou.",
  });

  rows.push({
    id: "wa",
    tone: waOk ? "good" : waPartial ? "warn" : "bad",
    label: waOk
      ? "WhatsApp is gekoppeld en je assistent mag automatisch een eerste antwoord sturen."
      : waPartial
        ? "WhatsApp is deels ingesteld — rond dit af bij Instellingen zodat niemand blijft wachten."
        : "WhatsApp is nog niet gekoppeld — veel klanten stappen hier juist op in.",
  });

  rows.push({
    id: "mail",
    tone: mailOk ? "good" : mailPartial ? "warn" : "bad",
    label: mailOk
      ? "E-mail loopt binnen in je berichten, zodat je niets mist in je inbox."
      : mailPartial
        ? "E-mail is deels klaar — nog één kleine stap bij Instellingen."
        : "E-mail is nog niet gekoppeld — offerteaanvragen blijven dan buiten je overzicht.",
  });

  rows.push({
    id: "ai",
    tone: aiDone ? "good" : aiPartial ? "warn" : "bad",
    label: aiDone
      ? "Je assistent kent je bedrijf — antwoorden sluiten aan op wat jij aanbiedt."
      : aiPartial
        ? "Je assistent staat aan — vul nog je kennis aan voor nóg betere antwoorden."
        : "Je assistent wacht op je input — begin met je aanbod en veelgestelde vragen.",
  });

  let score = 0;
  if (input.websiteLive) score += 28;
  if (waOk) score += 26;
  else if (waPartial) score += 12;
  if (mailOk) score += 23;
  else if (mailPartial) score += 11;
  if (aiDone) score += 23;
  else if (aiPartial) score += 11;

  const percent = clamp(Math.round(score), 0, 100);

  const channelDone = input.websiteLive || waOk || mailOk;
  const liveDone = percent >= 78;

  const onboarding = {
    ai: (aiDone ? "done" : "current") as OnboardingStepUi,
    channel: (channelDone ? "done" : aiDone ? "current" : "upcoming") as OnboardingStepUi,
    live: (liveDone ? "done" : channelDone ? "current" : "upcoming") as OnboardingStepUi,
  };

  return { rows, percent, onboarding };
}
