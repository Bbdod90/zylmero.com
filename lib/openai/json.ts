export function extractJsonObject<T>(raw: string): T {
  const t = raw.trim();
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a === -1 || b === -1 || b <= a) {
    throw new Error("Model output bevat geen JSON-object");
  }
  return JSON.parse(t.slice(a, b + 1)) as T;
}
