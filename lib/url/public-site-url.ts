/**
 * Maakt een publieke site-URL bruikbaar voor opslag en `type=url`-achtige checks:
 * `herofatbikes.nl` → `https://herofatbikes.nl`. Laat bestaande http(s)-URLs ongemoeid.
 */
export function normalizeKnowledgeWebsiteUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const candidate = `https://${s}`;
  try {
    const u = new URL(candidate);
    if (u.hostname.includes(".")) return candidate;
  } catch {
    /* ongeldig — geef origineel terug; server/actie kan desnoods fout geven */
  }
  return s;
}

/**
 * Detects localhost / loopback hosts — unsuitable as public business URL in AI knowledge.
 * In development you may still paste loopback URLs; callers decide whether to reject on save.
 */
export function isNonPublicKnowledgeHost(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  try {
    const normalized = normalizeKnowledgeWebsiteUrl(s);
    const u = new URL(normalized);
    const h = u.hostname.toLowerCase();
    return (
      h === "localhost" ||
      h === "127.0.0.1" ||
      h === "[::1]" ||
      h === "::1" ||
      h.endsWith(".local") ||
      h.endsWith(".localhost")
    );
  } catch {
    return false;
  }
}
