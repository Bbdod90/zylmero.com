/** Optionele koop-/redirectknoppen onder een botbericht (widget + preview). */
export type ChatAction = { label: string; url: string };

/** Leest geconfigureerde shop-/productlinks uit automation_preferences. */
export function parseShopLinksFromPrefs(prefs: Record<string, unknown>): ChatAction[] {
  const raw = prefs.chatbot_shop_links;
  if (!Array.isArray(raw)) return [];
  const out: ChatAction[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const label = String((row as Record<string, unknown>).label ?? "").trim().slice(0, 120);
    const url = String((row as Record<string, unknown>).url ?? "").trim();
    if (!label || !url) continue;
    out.push({ label, url });
    if (out.length >= 8) break;
  }
  return out;
}

const MAX_ACTIONS = 2;

function hostnameOf(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const u = new URL(s.includes("://") ? s : `https://${s}`);
    return u.hostname.replace(/^www\./i, "").toLowerCase() || null;
  } catch {
    return null;
  }
}

/** Bouwt een set toegestane hosts voor uitgaande links (https-only). */
export function allowedLinkHosts(input: {
  websiteUrl?: string | null;
  knowledgeWebsite?: string | null;
  bookingLink?: string | null;
  shopLinks?: ChatAction[];
}): Set<string> {
  const hosts = new Set<string>();
  const add = (u?: string | null) => {
    const h = hostnameOf(u || "");
    if (h) hosts.add(h);
  };
  add(input.websiteUrl);
  add(input.knowledgeWebsite);
  add(input.bookingLink);
  if (Array.isArray(input.shopLinks)) {
    for (const row of input.shopLinks) {
      add(row?.url);
    }
  }
  return hosts;
}

/** Pak hostnames uit alle https://… voorkomens (gebruikt om product-URL's uit kennis toe te staan). */
export function hostsFromKnowledgeText(text: string): Set<string> {
  const set = new Set<string>();
  const re = /https:\/\/([^/\s"'<>]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const h = m[1].replace(/^www\./i, "").toLowerCase();
    if (h) set.add(h);
  }
  return set;
}

export function sanitizeChatActions(
  raw: unknown,
  allowedHosts: Set<string>,
): ChatAction[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatAction[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const label = String((item as Record<string, unknown>).label ?? "").trim().slice(0, 80);
    const url = String((item as Record<string, unknown>).url ?? "").trim();
    if (!label || !url) continue;
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (parsed.protocol !== "https:") continue;
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (!allowedHosts.has(host)) continue;
    out.push({ label, url: parsed.toString() });
    if (out.length >= MAX_ACTIONS) break;
  }
  return out;
}
