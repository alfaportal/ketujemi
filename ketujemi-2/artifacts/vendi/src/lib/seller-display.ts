/** First name only for public seller display (matches API masking). */
export function sellerFirstName(raw: string): string {
  const name = raw.trim();
  if (!name) return "";
  return name.split(/\s+/)[0] ?? name;
}
