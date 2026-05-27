/** Server-side listing image_url normalization (matches vendi listing-images rules). */

const BLOCKED_IMAGE_HOST_SUFFIXES = [
  "unsplash.com",
  "pexels.com",
  "placehold.co",
  "placeholder.com",
  "picsum.photos",
];

export function isUserUploadedListingImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    for (const blocked of BLOCKED_IMAGE_HOST_SUFFIXES) {
      if (host === blocked || host.endsWith(`.${blocked}`)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function parseListingImageUrls(imageUrl: string | null | undefined): string[] {
  if (!imageUrl?.trim()) return [];
  return imageUrl
    .split(",")
    .map((s) => s.trim())
    .filter((s) => isUserUploadedListingImageUrl(s));
}

export function primaryListingImageUrl(imageUrl: string | null | undefined): string | null {
  return parseListingImageUrls(imageUrl)[0] ?? null;
}

export function sanitizeListingImageUrlField(raw: string | null | undefined): string | null {
  const urls = parseListingImageUrls(raw);
  return urls.length > 0 ? urls.join(",") : null;
}
