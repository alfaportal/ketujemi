/** Listing video URL validation (optional field). */

const VIDEO_URL_MAX_LEN = 2048;

export function sanitizeListingVideoUrl(value: unknown): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.length > VIDEO_URL_MAX_LEN) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return trimmed;
  } catch {
    return null;
  }
}
