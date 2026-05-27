/**
 * Listing photos: only user uploads (Cloudinary / B2). Never stock or external placeholders.
 */

const BLOCKED_IMAGE_HOST_SUFFIXES = [
  "unsplash.com",
  "pexels.com",
  "placehold.co",
  "placeholder.com",
  "picsum.photos",
  "loremflickr.com",
  "placekitten.com",
  "dummyimage.com",
  "via.placeholder.com",
  "wikimedia.org",
  "wikipedia.org",
  "imgur.com",
  "pinimg.com",
  "freepik.com",
  "shutterstock.com",
  "gettyimages.com",
  "istockphoto.com",
  "dreamstime.com",
  "alamy.com",
  "depositphotos.com",
  "123rf.com",
  "raw.githubusercontent.com",
  "googleusercontent.com",
  "gstatic.com",
  "bing.net",
];

function extraAllowedHostsFromEnv(): string[] {
  const hosts: string[] = [];
  const b2 = process.env.B2_PUBLIC_URL_BASE?.trim();
  if (b2) {
    try {
      hosts.push(new URL(b2).hostname.toLowerCase());
    } catch {
      /* ignore */
    }
  }
  return hosts;
}

function isBlockedImageHost(host: string): boolean {
  const h = host.toLowerCase();
  for (const blocked of BLOCKED_IMAGE_HOST_SUFFIXES) {
    if (h === blocked || h.endsWith(`.${blocked}`)) return true;
  }
  return false;
}

function isAllowedListingImageHost(host: string): boolean {
  const h = host.toLowerCase();
  if (isBlockedImageHost(h)) return false;
  if (h === "res.cloudinary.com" || h.endsWith(".cloudinary.com")) return true;
  if (h.endsWith(".backblazeb2.com")) return true;
  for (const allowed of extraAllowedHostsFromEnv()) {
    if (h === allowed || h.endsWith(`.${allowed}`)) return true;
  }
  return false;
}

/** True only for https URLs on Cloudinary, Backblaze B2, or configured B2 CDN host. */
export function isUserUploadedListingImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:") return false;
    return isAllowedListingImageHost(u.hostname);
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

export function joinListingImageUrls(urls: string[]): string | null {
  const valid = urls.filter((u) => isUserUploadedListingImageUrl(u));
  return valid.length > 0 ? valid.join(",") : null;
}

/** Raw field contains stock/external URLs or no valid upload URLs. */
export function listingImageUrlNeedsPurge(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  const cleaned = sanitizeListingImageUrlField(raw);
  return cleaned !== raw.trim();
}
