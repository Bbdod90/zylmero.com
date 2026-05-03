import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { insertNotificationIfNew } from "@/lib/notifications/create";
import {
  fetchGoogleBusyRanges,
  refreshGoogleAccessToken,
  type GoogleTokenPayload,
} from "@/lib/oauth/google-calendar";
import { sealSocialToken, unsealSocialToken } from "@/lib/crypto/social-token";
import { fetchAppleCalendarBusyRanges } from "@/lib/integrations/apple-calendar";
import {
  APPOINTMENT_DEFAULT_MINUTES,
  buildUserTranscript,
  detectAppointmentIntentFromChat,
  extractRepairTags,
} from "@/lib/chatbot/appointment-intent";

function safeString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" ? (input as Record<string, unknown>) : {};
}

function formatNlDateTime(date: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function intersects(
  aStart: Date,
  aEnd: Date,
  bStartIso: string | null | undefined,
  bEndIso: string | null | undefined,
): boolean {
  if (!bStartIso) return false;
  const bStart = new Date(bStartIso);
  const bEnd = bEndIso ? new Date(bEndIso) : new Date(bStart.getTime() + APPOINTMENT_DEFAULT_MINUTES * 60_000);
  if (Number.isNaN(bStart.getTime()) || Number.isNaN(bEnd.getTime())) return false;
  return aStart < bEnd && bStart < aEnd;
}

function isTokenExpired(payload: GoogleTokenPayload): boolean {
  if (typeof payload.expiry_date !== "number") return false;
  return Date.now() + 30_000 >= payload.expiry_date;
}

async function fetchGoogleBusyRangesForCompany(input: {
  supabase: ReturnType<typeof createAdminClient>;
  companyId: string;
  timeMinIso: string;
  timeMaxIso: string;
}): Promise<Array<{ start: string; end: string }>> {
  const { data: row } = await input.supabase
    .from("company_social_connections")
    .select("id, encrypted_token, metadata")
    .eq("company_id", input.companyId)
    .eq("provider", "google_calendar")
    .eq("status", "connected")
    .maybeSingle();
  if (!row?.encrypted_token || typeof row.encrypted_token !== "string") return [];

  const raw = unsealSocialToken(row.encrypted_token);
  if (!raw) return [];
  let token: GoogleTokenPayload;
  try {
    token = JSON.parse(raw) as GoogleTokenPayload;
  } catch {
    return [];
  }
  if (!token.access_token) return [];

  if (isTokenExpired(token) && token.refresh_token) {
    try {
      const refreshed = await refreshGoogleAccessToken(token.refresh_token);
      token = refreshed;
      await input.supabase
        .from("company_social_connections")
        .update({
          encrypted_token: sealSocialToken(JSON.stringify(refreshed)),
          token_expires_at:
            typeof refreshed.expiry_date === "number"
              ? new Date(refreshed.expiry_date).toISOString()
              : null,
          updated_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", row.id);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "google_refresh_failed";
      await input.supabase
        .from("company_social_connections")
        .update({
          status: "error",
          last_error: errMsg.slice(0, 400),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      return [];
    }
  }

  const metadata = asRecord(row.metadata);
  const calendarId = safeString(metadata.calendar_id) || "primary";
  try {
    return await fetchGoogleBusyRanges({
      accessToken: token.access_token,
      timeMinIso: input.timeMinIso,
      timeMaxIso: input.timeMaxIso,
      calendarId,
    });
  } catch {
    return [];
  }
}

async function fetchAppleBusyRangesForCompany(input: {
  supabase: ReturnType<typeof createAdminClient>;
  companyId: string;
  timeMinIso: string;
  timeMaxIso: string;
}): Promise<Array<{ start: string; end: string }>> {
  const { data: row } = await input.supabase
    .from("company_social_connections")
    .select("metadata")
    .eq("company_id", input.companyId)
    .eq("provider", "apple_calendar")
    .eq("status", "connected")
    .maybeSingle();
  const metadata = asRecord(row?.metadata);
  const icsUrl = safeString(metadata.ics_url);
  if (!icsUrl) return [];
  try {
    return await fetchAppleCalendarBusyRanges({
      icsUrl,
      windowStartIso: input.timeMinIso,
      windowEndIso: input.timeMaxIso,
    });
  } catch {
    return [];
  }
}

export type ChatAppointmentBookingInput = {
  supabase: ReturnType<typeof createAdminClient>;
  companyId: string | null;
  companyName: string | null;
  conversationId: string;
  /** Volledige rol-geschiedenis vóór het huidige bericht (zoals in /api/chat). */
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
  companySettings: Record<string, unknown> | null;
  /** chatbot_web | chatbot_studio_preview */
  source: "chatbot_web" | "chatbot_studio_preview";
};

/**
 * Parseert dag+tijd over meerdere berichten, checkt agenda-bezetting, schrijft naar `appointments`.
 */
export async function tryChatAppointmentBooking(
  input: ChatAppointmentBookingInput,
): Promise<string | null> {
  if (!input.companyId) return null;

  const userTranscript = buildUserTranscript(input.history, input.message);
  const intent = detectAppointmentIntentFromChat(input.history, input.message);
  if (!intent.wantsAppointment) return null;

  if (!intent.requestedStart) {
    const repairish = /reparatie|werkplaats|kapot|defect|storing|onderhoud/.test(userTranscript.toLowerCase());
    if (repairish) {
      return [
        "Ik help je graag met een werkplaats-/reparatieafspraak.",
        "Noem je gewenste dag (bijv. morgen of vrijdag) en tijd — dat mag ook in twee berichten.",
        "Het verschijnt daarna meteen als voorstel in de agenda van het bedrijf.",
      ].join("\n");
    }
    return "Top, ik help je graag met een afspraak. Welke dag en tijd wil je (bijv. morgen 14:00 of vrijdag 10:00)?";
  }

  const requestedStart = intent.requestedStart;
  if (requestedStart.getTime() < Date.now() - 60_000) {
    return "Dat tijdstip ligt in het verleden. Kun je een nieuwe dag en tijd sturen?";
  }
  const requestedEnd = new Date(requestedStart.getTime() + APPOINTMENT_DEFAULT_MINUTES * 60_000);

  const [zylmeroRows, companyOwner] = await Promise.all([
    input.supabase
      .from("appointments")
      .select("starts_at, ends_at, status")
      .eq("company_id", input.companyId)
      .in("status", ["scheduled", "planned", "confirmed"])
      .gte("starts_at", new Date(requestedStart.getTime() - 24 * 60 * 60_000).toISOString())
      .lte("starts_at", new Date(requestedStart.getTime() + 24 * 60 * 60_000).toISOString()),
    input.supabase
      .from("companies")
      .select("id, name, contact_email")
      .eq("id", input.companyId)
      .maybeSingle(),
  ]);

  const zylmeroBusy = (zylmeroRows.data || []).some((row) =>
    intersects(requestedStart, requestedEnd, row.starts_at as string | null, row.ends_at as string | null),
  );

  const prefs = asRecord(input.companySettings?.automation_preferences);
  const googleBusy = await fetchGoogleBusyRangesForCompany({
    supabase: input.supabase,
    companyId: input.companyId,
    timeMinIso: new Date(requestedStart.getTime() - 24 * 60 * 60_000).toISOString(),
    timeMaxIso: new Date(requestedStart.getTime() + 24 * 60 * 60_000).toISOString(),
  });
  const googleBusyHit = googleBusy.some((row) =>
    intersects(requestedStart, requestedEnd, row.start, row.end),
  );
  const appleBusy = await fetchAppleBusyRangesForCompany({
    supabase: input.supabase,
    companyId: input.companyId,
    timeMinIso: new Date(requestedStart.getTime() - 24 * 60 * 60_000).toISOString(),
    timeMaxIso: new Date(requestedStart.getTime() + 24 * 60 * 60_000).toISOString(),
  });
  const appleBusyHit = appleBusy.some((row) =>
    intersects(requestedStart, requestedEnd, row.start, row.end),
  );
  const externalBusy = Array.isArray(prefs.calendar_busy_ranges)
    ? prefs.calendar_busy_ranges.some((row) => {
        const r = asRecord(row);
        return intersects(
          requestedStart,
          requestedEnd,
          safeString(r.start) || null,
          safeString(r.end) || null,
        );
      })
    : false;

  if (zylmeroBusy || externalBusy || googleBusyHit || appleBusyHit) {
    const alternatives: string[] = [];
    for (let i = 1; i <= 4 && alternatives.length < 3; i++) {
      const candidateStart = new Date(requestedStart.getTime() + i * 2 * 60 * 60_000);
      const candidateEnd = new Date(candidateStart.getTime() + APPOINTMENT_DEFAULT_MINUTES * 60_000);
      const collision = (zylmeroRows.data || []).some((row) =>
        intersects(candidateStart, candidateEnd, row.starts_at as string | null, row.ends_at as string | null),
      );
      if (!collision) alternatives.push(formatNlDateTime(candidateStart));
    }
    const altText = alternatives.length
      ? `Beschikbare alternatieven: ${alternatives.join(" / ")}.`
      : "Kun je een andere dag of tijd sturen?";
    return `Dit tijdstip lijkt al bezet in de agenda. ${altText}`;
  }

  const tags = extractRepairTags(userTranscript);
  const tagPart = tags.length ? ` Tags: ${tags.join(", ")}.` : "";
  const notesPrefix =
    input.source === "chatbot_studio_preview"
      ? `Chatbot studio preview (${input.conversationId}).`
      : `Chatbot afspraakverzoek (${input.conversationId}).`;
  const notes = `${notesPrefix}${tagPart} Klant (transcript): "${intent.rawTimeText || input.message}"`;

  const { error: createErr } = await input.supabase.from("appointments").insert({
    company_id: input.companyId,
    starts_at: requestedStart.toISOString(),
    ends_at: requestedEnd.toISOString(),
    status: "planned",
    notes,
  });
  if (createErr) return null;

  const companyTitle = safeString(companyOwner.data?.name) || safeString(input.companyName) || "het bedrijf";

  const dedupeScope =
    input.source === "chatbot_studio_preview" ? "studio-preview" : input.conversationId;
  await insertNotificationIfNew(input.supabase, {
    company_id: input.companyId,
    type: "new_lead",
    title: "Nieuwe afspraak-aanvraag te bevestigen",
    body: `Klant wil ${formatNlDateTime(requestedStart)}. Bevestig of stel alternatief voor.`,
    dedupe_key: `chatbot-appointment-request:${dedupeScope}:${requestedStart.toISOString()}`,
    metadata: {
      kind: "appointment_request",
      requested_start: requestedStart.toISOString(),
      requested_end: requestedEnd.toISOString(),
      source: input.source,
    },
  });

  if (input.source === "chatbot_studio_preview") {
    return `Je afspraak staat als voorstel in de agenda op ${formatNlDateTime(requestedStart)} (status: gepland). In de studio zie je ’m na vernieuwen onder Afspraken — het team kan dit nog bevestigen.`;
  }

  return `Top, ik heb je afspraakverzoek voor ${formatNlDateTime(requestedStart)} doorgestuurd naar ${companyTitle}. Je ziet ’m als voorstel in de agenda; je krijgt na bevestiging reactie.`;
}
