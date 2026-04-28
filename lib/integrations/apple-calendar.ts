export type BusyRange = { start: string; end: string };

function unfoldIcsLines(ics: string): string[] {
  const raw = ics.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];
  for (const line of raw) {
    if (!lines.length) {
      lines.push(line);
      continue;
    }
    if (line.startsWith(" ") || line.startsWith("\t")) {
      lines[lines.length - 1] = `${lines[lines.length - 1]}${line.slice(1)}`;
      continue;
    }
    lines.push(line);
  }
  return lines;
}

function parseIcsDate(value: string): Date | null {
  const v = value.trim();
  if (!v) return null;
  if (/^\d{8}T\d{6}Z$/.test(v)) {
    const y = Number(v.slice(0, 4));
    const m = Number(v.slice(4, 6)) - 1;
    const d = Number(v.slice(6, 8));
    const hh = Number(v.slice(9, 11));
    const mm = Number(v.slice(11, 13));
    const ss = Number(v.slice(13, 15));
    const date = new Date(Date.UTC(y, m, d, hh, mm, ss));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (/^\d{8}T\d{6}$/.test(v)) {
    const y = Number(v.slice(0, 4));
    const m = Number(v.slice(4, 6)) - 1;
    const d = Number(v.slice(6, 8));
    const hh = Number(v.slice(9, 11));
    const mm = Number(v.slice(11, 13));
    const ss = Number(v.slice(13, 15));
    const date = new Date(y, m, d, hh, mm, ss);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (/^\d{8}$/.test(v)) {
    const y = Number(v.slice(0, 4));
    const m = Number(v.slice(4, 6)) - 1;
    const d = Number(v.slice(6, 8));
    const date = new Date(y, m, d, 0, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(v);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function fetchAppleCalendarBusyRanges(input: {
  icsUrl: string;
  windowStartIso: string;
  windowEndIso: string;
}): Promise<BusyRange[]> {
  const res = await fetch(input.icsUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`apple_ics_fetch_failed:${res.status}`);
  const body = await res.text();
  const lines = unfoldIcsLines(body);
  const out: BusyRange[] = [];
  const windowStart = new Date(input.windowStartIso);
  const windowEnd = new Date(input.windowEndIso);
  if (Number.isNaN(windowStart.getTime()) || Number.isNaN(windowEnd.getTime())) return [];

  let inEvent = false;
  let dtStart: Date | null = null;
  let dtEnd: Date | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      dtStart = null;
      dtEnd = null;
      continue;
    }
    if (line === "END:VEVENT") {
      if (inEvent && dtStart) {
        const effectiveEnd = dtEnd ?? new Date(dtStart.getTime() + 60 * 60 * 1000);
        if (dtStart < windowEnd && effectiveEnd > windowStart) {
          out.push({ start: dtStart.toISOString(), end: effectiveEnd.toISOString() });
        }
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;
    if (line.startsWith("DTSTART")) {
      const value = line.split(":").slice(1).join(":");
      dtStart = parseIcsDate(value);
      continue;
    }
    if (line.startsWith("DTEND")) {
      const value = line.split(":").slice(1).join(":");
      dtEnd = parseIcsDate(value);
      continue;
    }
  }
  return out;
}
