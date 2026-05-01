import type { AiKnowledgePage } from "@/lib/types";
import {
  AI_KNOWLEDGE_CRAWLED_DOC_STORE_MAX_CHARS,
  AI_KNOWLEDGE_PROMPT_CRAWLED_MAX_CHARS,
} from "@/lib/ai/knowledge-crawl-config";

/** Max. platte tekst per pagina vóór opslag (incl. JSON-LD regels). */
export const AI_KNOWLEDGE_TEXT_PER_PAGE = 6000;

export function truncateCrawledDocForPrompt(raw: string): string {
  if (raw.length <= AI_KNOWLEDGE_PROMPT_CRAWLED_MAX_CHARS) return raw;
  return `${raw.slice(0, AI_KNOWLEDGE_PROMPT_CRAWLED_MAX_CHARS)}\n\n[…ingekort voor modelcontext]`;
}

/** Haal product/prijsregels uit JSON-LD vóór script-stripping (Shopify e.d.). */
export function extractJsonLdPlainLines(html: string): string {
  const re =
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const lines: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      collectStructuredLines(parsed, lines, 0);
    } catch {
      continue;
    }
  }
  return Array.from(new Set(lines.map((s) => s.trim()).filter(Boolean))).join("\n");
}

function collectStructuredLines(node: unknown, out: string[], depth: number): void {
  if (depth > 40 || node == null) return;
  if (Array.isArray(node)) {
    for (const n of node) collectStructuredLines(n, out, depth + 1);
    return;
  }
  if (typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  const typesRaw = o["@type"];
  const typeStr = Array.isArray(typesRaw)
    ? typesRaw.map((t) => String(t)).join(",")
    : String(typesRaw ?? "");

  const name = String(o.name || "").trim();
  const offers = o.offers;

  const tryProduct = () => {
    if (!name) return;
    const parts: string[] = [name];
    const sku = String(o.sku || "").trim();
    if (sku) parts.push(`SKU ${sku}`);
    const priceBits: string[] = [];
    const readOffer = (off: Record<string, unknown>) => {
      const price = off.price ?? off.lowPrice ?? off.highPrice;
      const cur = off.priceCurrency ? String(off.priceCurrency) : "";
      if (price != null && String(price).trim()) {
        priceBits.push(
          `${String(price)}${cur ? ` ${cur}` : ""}`,
        );
      }
    };
    if (offers && typeof offers === "object") {
      if (Array.isArray(offers)) {
        for (const x of offers.slice(0, 8)) {
          if (x && typeof x === "object") readOffer(x as Record<string, unknown>);
        }
      } else {
        readOffer(offers as Record<string, unknown>);
      }
    }
    if (priceBits.length) parts.push(`Prijzen: ${priceBits.join("; ")}`);
    out.push(`[Structured data] ${parts.join(" — ")}`);
  };

  if (typeStr.toLowerCase().includes("product") || (name && offers)) {
    tryProduct();
  }

  if (Array.isArray(o.itemListElement)) {
    for (const it of o.itemListElement as unknown[]) {
      collectStructuredLines(it, out, depth + 1);
    }
  }

  if (o["@graph"]) collectStructuredLines(o["@graph"], out, depth + 1);

  for (const k of Object.keys(o)) {
    if (k === "@context" || k === "@type") continue;
    collectStructuredLines(o[k], out, depth + 1);
  }
}

/** Product-/collectiepagina’s eerder in het document = betere prijsdekking bij limiet. */
export function sortPagesForKnowledge(pages: AiKnowledgePage[]): AiKnowledgePage[] {
  const score = (url: string) => {
    const u = url.toLowerCase();
    let s = 0;
    if (u.includes("/products/")) s += 6;
    if (u.includes("/collections/")) s += 5;
    if (u.includes("/collection/")) s += 4;
    if (u.includes("fatbike") || u.includes("/fiets") || u.includes("e-bike")) s += 5;
    if (u.includes("/product")) s += 3;
    if (u.includes("product")) s += 2;
    if (u.includes("shop") || u.includes("winkel") || u.includes("aanbieding")) s += 1;
    return s;
  };
  return [...pages].sort((a, b) => score(b.url) - score(a.url));
}

/**
 * Bouwt één lang document voor AI + DB. Houdt totaal onder maxChars (product-URL’s eerst).
 */
export function buildCrawledKnowledgeDocument(
  pages: AiKnowledgePage[],
  maxChars = AI_KNOWLEDGE_CRAWLED_DOC_STORE_MAX_CHARS,
): string {
  const sorted = sortPagesForKnowledge(pages);
  let out = "";
  for (const p of sorted) {
    const body = (p.content ?? p.excerpt ?? "").trim();
    if (!body) continue;
    const header = `URL: ${p.url}\nTitel: ${p.title}\nInhoud:\n`;
    const sep = out ? "\n\n---\n\n" : "";
    const budget = maxChars - out.length - sep.length - header.length;
    if (budget < 200) break;
    const slice = body.slice(0, budget);
    const truncated = body.length > slice.length ? `${slice}\n[…pagina ingekort]` : slice;
    out += sep + header + truncated;
  }
  return out;
}
