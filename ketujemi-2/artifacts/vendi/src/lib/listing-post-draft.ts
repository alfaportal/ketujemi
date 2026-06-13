const DRAFT_IMAGES_KEY = "vendi_listing_draft_images_v1";
const MAX_DRAFT_IMAGES = 12;

export function readListingDraftImageUrls(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(DRAFT_IMAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      .slice(0, MAX_DRAFT_IMAGES);
  } catch {
    return [];
  }
}

export function writeListingDraftImageUrls(urls: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = urls.filter((u) => u.trim().length > 0).slice(0, MAX_DRAFT_IMAGES);
    if (trimmed.length === 0) {
      sessionStorage.removeItem(DRAFT_IMAGES_KEY);
      return;
    }
    sessionStorage.setItem(DRAFT_IMAGES_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota / private mode */
  }
}

export function clearListingDraftImages(): void {
  writeListingDraftImageUrls([]);
}
