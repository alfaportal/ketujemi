/** First image URL from comma-separated listing image_url field. */
export function firstListingImageUrl(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  const first = raw.split(",")[0]?.trim();
  return first || null;
}

/** Normalize CDN URLs for equality (strip query, version folder). */
export function normalizeListingImageUrl(url: string): string {
  try {
    const u = new URL(url.trim().toLowerCase());
    const path = u.pathname.replace(/\/v\d+\//, "/");
    return `${u.hostname}${path}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

export function listingImagesMatch(a?: string | null, b?: string | null): boolean {
  const fa = firstListingImageUrl(a);
  const fb = firstListingImageUrl(b);
  if (!fa || !fb) return false;
  return normalizeListingImageUrl(fa) === normalizeListingImageUrl(fb);
}
