/**
 * Detects localhost / loopback hosts — unsuitable as public business URL in AI knowledge.
 * In development you may still paste loopback URLs; callers decide whether to reject on save.
 */
export function isNonPublicKnowledgeHost(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  try {
    const normalized = /^https?:\/\//i.test(s) ? s : `https://${s}`;
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
