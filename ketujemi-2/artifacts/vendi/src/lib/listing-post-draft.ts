const DRAFT_KEY = "vendi_listing_post_draft_v2";
const LEGACY_IMAGES_KEY = "vendi_listing_draft_images_v1";
const ACTIVE_SESSION_KEY = "vendi_listing_post_active_v1";
const MAX_DRAFT_IMAGES = 12;

export type ListingPostDraft = {
  images: string[];
  videoUrl: string | null;
  updatedAt: number;
};

function parseDraft(raw: string | null): ListingPostDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ListingPostDraft>;
    const images = Array.isArray(parsed.images)
      ? parsed.images.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      : [];
    const videoUrl =
      typeof parsed.videoUrl === "string" && parsed.videoUrl.trim().length > 0
        ? parsed.videoUrl.trim()
        : null;
    if (images.length === 0 && !videoUrl) return null;
    return {
      images: images.slice(0, MAX_DRAFT_IMAGES),
      videoUrl,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function readLegacyImages(): string[] {
  try {
    const raw = sessionStorage.getItem(LEGACY_IMAGES_KEY);
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

export function readListingPostDraft(): ListingPostDraft | null {
  if (typeof window === "undefined") return null;
  const current = parseDraft(sessionStorage.getItem(DRAFT_KEY));
  if (current) return current;
  const legacyImages = readLegacyImages();
  if (legacyImages.length === 0) return null;
  return { images: legacyImages, videoUrl: null, updatedAt: Date.now() };
}

export function readListingDraftImageUrls(): string[] {
  return readListingPostDraft()?.images ?? [];
}

export function writeListingPostDraft(draft: {
  images: string[];
  videoUrl?: string | null;
}): void {
  if (typeof window === "undefined") return;
  try {
    const images = draft.images.filter((u) => u.trim().length > 0).slice(0, MAX_DRAFT_IMAGES);
    const videoUrl =
      typeof draft.videoUrl === "string" && draft.videoUrl.trim().length > 0
        ? draft.videoUrl.trim()
        : null;
    if (images.length === 0 && !videoUrl) {
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(LEGACY_IMAGES_KEY);
      return;
    }
    const payload: ListingPostDraft = {
      images,
      videoUrl,
      updatedAt: Date.now(),
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    sessionStorage.setItem(LEGACY_IMAGES_KEY, JSON.stringify(images));
  } catch {
    /* quota / private mode */
  }
}

export function writeListingDraftImageUrls(urls: string[]): void {
  const existing = readListingPostDraft();
  writeListingPostDraft({
    images: urls,
    videoUrl: existing?.videoUrl ?? null,
  });
}

export function clearListingPostDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(LEGACY_IMAGES_KEY);
  } catch {
    /* ignore */
  }
}

export function clearListingDraftImages(): void {
  clearListingPostDraft();
}

export function hasListingPostDraft(): boolean {
  return readListingPostDraft() != null;
}

export function markListingPostSessionActive(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ACTIVE_SESSION_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function clearListingPostSessionActive(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function wasListingPostSessionInterrupted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ACTIVE_SESSION_KEY) != null && hasListingPostDraft();
  } catch {
    return false;
  }
}
