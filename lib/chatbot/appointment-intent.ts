/**
 * Parser voor chatbot-afspraken — geen Node-only imports (veilig voor bundling).
 */

export const APPOINTMENT_DEFAULT_MINUTES = 60;

export type AppointmentIntent = {
  wantsAppointment: boolean;
  requestedStart: Date | null;
  rawTimeText: string | null;
};

/** Alleen klantregels + huidig bericht = robuust bij meerdere korte berichten ("morgen" → "14:00"). */
export function buildUserTranscript(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  currentMessage: string,
): string {
  const cur = currentMessage.trim();
  const userLines = history
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean);
  if (cur && userLines[userLines.length - 1] !== cur) {
    userLines.push(cur);
  }
  return userLines.join("\n");
}

/** Alle rollen + huidig bericht — nodig om tijden uit bot-antwoorden te parsen en "ja" na een voorstel te boeken. */
export function buildFullConversationText(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  currentMessage: string,
): string {
  const cur = currentMessage.trim();
  const lines: string[] = [];
  for (const m of history) {
    const t = m.content?.trim();
    if (t) lines.push(t);
  }
  if (cur && lines[lines.length - 1] !== cur) {
    lines.push(cur);
  }
  return lines.join("\n");
}

export function isShortConfirmation(message: string): boolean {
  const t = message.trim().toLowerCase();
  if (t.length > 48) return false;
  return /^(ja|jazeker|akkoord|ok(e)?|prima|top|deal|instem|yes|yep)\b/.test(t);
}

export function extractRepairTags(text: string): string[] {
  const t = text.toLowerCase();
  const defs: [RegExp, string][] = [
    [/rem|brems/, "Remmen"],
    [/accu|batterij/, "Accu"],
    [/band/, "Band(en)"],
    [/ketting/, "Ketting"],
    [/motor/, "Motor"],
    [/display|scherm/, "Display"],
    [/licht|verlichting|lamp/, "Verlichting"],
    [/software|update|firmware/, "Software/update"],
    [/lader|oplad/, "Laden"],
    [/stuurbekrachtiging|besturing/, "Besturing"],
  ];
  const out: string[] = [];
  for (const [re, label] of defs) {
    if (re.test(t) && !out.includes(label)) out.push(label);
  }
  return out.slice(0, 8);
}

/** Bepaal starttijd uit volledige transcript (meerdere berichten). Laatste HH:mm wint. */
export function resolveAppointmentStart(transcript: string, now = new Date()): Date | null {
  const text = transcript.toLowerCase().trim();
  if (!text) return null;

  const base = new Date(now);
  base.setSeconds(0, 0);

  let hour = 10;
  let minute = 0;
  const colonTimes: RegExpExecArray[] = [];
  const timeRe = /\b(\d{1,2}):(\d{2})\b/g;
  let tm: RegExpExecArray | null;
  while ((tm = timeRe.exec(transcript)) !== null) {
    colonTimes.push(tm);
  }
  if (colonTimes.length > 0) {
    const last = colonTimes[colonTimes.length - 1];
    hour = Number(last[1]);
    minute = Number(last[2]);
  } else {
    const uur = text.match(/\b(\d{1,2})\s*uur\b/);
    if (uur) {
      hour = Number(uur[1]);
      minute = 0;
    }
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  const timeExplicit = colonTimes.length > 0 || /\b\d{1,2}\s*uur\b/.test(text);

  const dayMap: Record<string, number> = {
    zondag: 0,
    maandag: 1,
    dinsdag: 2,
    woensdag: 3,
    donderdag: 4,
    vrijdag: 5,
    zaterdag: 6,
  };

  const hasRelativeDay =
    text.includes("vandaag") ||
    text.includes("morgen") ||
    Object.keys(dayMap).some((n) => text.includes(n));

  // Geen automatische 10:00 bij alleen "morgen" / weekdag — eerst expliciet tijd (of bevestiging met tijd in chat).
  if (hasRelativeDay && !timeExplicit) {
    return null;
  }

  if (text.includes("vandaag")) {
    const d = new Date(base);
    d.setHours(hour, minute, 0, 0);
    return d;
  }
  if (text.includes("morgen")) {
    const d = new Date(base);
    d.setDate(d.getDate() + 1);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  for (const [name, dayIdx] of Object.entries(dayMap)) {
    if (!text.includes(name)) continue;
    const d = new Date(base);
    const diff = (dayIdx - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  const explicit = transcript.match(/(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?/);
  if (explicit) {
    if (!timeExplicit) return null;
    const day = Number(explicit[1]);
    const month = Number(explicit[2]) - 1;
    const yearRaw = explicit[3] ? Number(explicit[3]) : now.getFullYear();
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
    const d = new Date(year, month, day, hour, minute, 0, 0);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const hasTimeHint = colonTimes.length > 0 || /\b\d{1,2}\s*uur\b/.test(text);
  const hasDayHint =
    text.includes("vandaag") ||
    text.includes("morgen") ||
    Object.keys(dayMap).some((n) => text.includes(n)) ||
    /\d{1,2}[-/]\d{1,2}/.test(transcript);
  if (hasTimeHint && !hasDayHint) return null;

  return null;
}

function wantsAppointmentHeuristic(transcript: string): boolean {
  const t = transcript.toLowerCase();
  return (
    /(afspraak|inplannen|plan|boeken|boek|vrijdag|morgen|vandaag|reparatie|werkplaats|service|storing|kapot|defect|onderhoud)/.test(
      t,
    ) || /\b\d{1,2}:\d{2}\b/.test(transcript)
  );
}

export function detectAppointmentIntent(transcript: string): AppointmentIntent {
  const wantsAppointment = wantsAppointmentHeuristic(transcript);
  const requestedStart = wantsAppointment ? resolveAppointmentStart(transcript) : null;
  return {
    wantsAppointment,
    requestedStart,
    rawTimeText: requestedStart ? transcript.trim().slice(0, 280) : null,
  };
}

function slotHintsForConfirmation(fullTranscript: string): boolean {
  const t = fullTranscript.toLowerCase();
  return (
    /\b\d{1,2}:\d{2}\b/.test(fullTranscript) ||
    /morgen|vandaag|afspraak|reparatie|werkplaats|langskomen|tijdstip/.test(t)
  );
}

/**
 * Productie + studio: gebruikt volledige chat (ook botregels met "morgen om 14:00") en korte bevestigingen ("ja").
 */
export function detectAppointmentIntentFromChat(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  currentMessage: string,
): AppointmentIntent {
  const full = buildFullConversationText(history, currentMessage);
  const userOnly = buildUserTranscript(history, currentMessage);
  const lastUser = currentMessage.trim();

  const requestedStart =
    resolveAppointmentStart(full) ?? resolveAppointmentStart(userOnly);

  const wantsAppointment =
    wantsAppointmentHeuristic(full) ||
    wantsAppointmentHeuristic(userOnly) ||
    (isShortConfirmation(lastUser) && slotHintsForConfirmation(full));

  return {
    wantsAppointment,
    requestedStart,
    rawTimeText: requestedStart ? full.trim().slice(0, 320) : null,
  };
}
