export function extractJsonObject<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return a JSON object");
  }
  const slice = trimmed.slice(start, end + 1);
  return JSON.parse(slice) as T;
}
