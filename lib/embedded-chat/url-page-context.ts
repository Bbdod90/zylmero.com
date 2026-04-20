import { isNonPublicKnowledgeHost, normalizeKnowledgeWebsiteUrl } from "@/lib/url/public-site-url";

const CACHE_MS = 15 * 60 * 1000;
const fetchCache = new Map<string, { at: number; text: string | null }>();

function isPrivateOrReservedHostname(host: string): boolean {
  const h = host.toLowerCase();
  if (isNonPublicKnowledgeHost(`https://${h}`)) return true;
  if (h.endsWith(".internal")) return true;

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 127) return true;
    if (a === 0) return true;
  }
  return false;
}

function decodeBasicHtmlEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (full, n) => {
      const code = Number(n);
      return Number.isFinite(code) && code > 0 && code < 0x11_000 ? String.fromCodePoint(code) : full;
    })
    .replace(/&#x([0-9a-f]+);/gi, (full, h) => {
      const code = parseInt(h, 16);
      return Number.isFinite(code) && code > 0 && code < 0x11_000 ? String.fromCodePoint(code) : full;
    })
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/g, "'");
}

function htmlToPlainText(html: string): string {
  let t = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  t = t.replace(/<style[\s\S]*?<\/style>/gi, " ");
  t = t.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  t = t.replace(/<[^>]+>/g, " ");
  t = decodeBasicHtmlEntities(t);
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

function bodyLooksLikeHtml(raw: string): boolean {
  const head = raw.trimStart().slice(0, 4000).toLowerCase();
  return head.includes("<!doctype html") || head.includes("<html") || head.includes("<head");
}

/**
 * Haalt platte tekst van een publieke http(s)-URL op (server-side) voor embedded-chat RAG-light.
 * Mislukt netjes bij timeouts, 403, of niet-HTML — callers vallen dan terug op alleen de URL in de prompt.
 */
export async function fetchUrlPlainTextForChatKnowledge(rawUrl: string): Promise<string | null> {
  const normalized = normalizeKnowledgeWebsiteUrl(rawUrl.trim());
  if (!normalized || !/^https?:\/\//i.test(normalized)) return null;

  let hostname: string;
  try {
    const u = new URL(normalized);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    hostname = u.hostname;
    if (!hostname || !hostname.includes(".")) return null;
    if (isPrivateOrReservedHostname(hostname)) return null;
  } catch {
    return null;
  }

  const hit = fetchCache.get(normalized);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return hit.text;
  }

  let result: string | null = null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(normalized, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "ZylmeroEmbeddedChat/1.0 (+https://zylmero.com)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
      },
    });

    if (!res.ok) {
      fetchCache.set(normalized, { at: Date.now(), text: null });
      return null;
    }

    const raw = await res.text();
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const ctOk =
      ct.includes("text/html") || ct.includes("text/plain") || ct.includes("application/xhtml");
    if (!ctOk && !bodyLooksLikeHtml(raw)) {
      fetchCache.set(normalized, { at: Date.now(), text: null });
      return null;
    }

    const plain = htmlToPlainText(raw).slice(0, 16_000);
    /* Shopify e.d.: na strip vaak nog veel menu-ruis, maar genoeg voor productnavigatie */
    result = plain.length > 220 ? plain : null;
    fetchCache.set(normalized, { at: Date.now(), text: result });
    return result;
  } catch {
    fetchCache.set(normalized, { at: Date.now(), text: null });
    return result;
  } finally {
    clearTimeout(timer);
  }
}
