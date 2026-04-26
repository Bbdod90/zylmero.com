/** Dashboard “klanten klaar” — geen technische termen naar de UI. */

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
        { id: "demo", tone: "good", label: "Demo: zo ziet je overzicht eruit met een echt account." },
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
      ? "Websitechat staat aan — bezoekers kunnen je bereiken"
      : "Websitechat nog niet actief",
  });

  rows.push({
    id: "wa",
    tone: waOk ? "good" : waPartial ? "warn" : "bad",
    label: waOk
      ? "WhatsApp staat gekoppeld met automatische antwoorden"
      : waPartial
        ? "WhatsApp deels ingesteld — rond dit af in Instellingen"
        : "WhatsApp nog niet gekoppeld",
  });

  rows.push({
    id: "mail",
    tone: mailOk ? "good" : mailPartial ? "warn" : "bad",
    label: mailOk
      ? "E-mail komt binnen in je berichten"
      : mailPartial
        ? "E-mail deels ingesteld — nog één stap"
        : "E-mail nog niet gekoppeld",
  });

  rows.push({
    id: "ai",
    tone: aiDone ? "good" : aiPartial ? "warn" : "bad",
    label: aiDone
      ? "Je assistent is getraind op jouw bedrijf"
      : aiPartial
        ? "Assistent staat aan — vul nog kennis aan voor betere antwoorden"
        : "Assistent nog niet klaar — start met trainen",
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
