const DRAFT_KEY = "vendi_listing_post_draft_v2";
const DRAFT_LOCAL_KEY = "vendi_listing_post_draft_local_v2";
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

function readFromStorage(kind: "session" | "local"): ListingPostDraft | null {
  if (typeof window === "undefined") return null;
  const store = kind === "session" ? sessionStorage : localStorage;
  return parseDraft(store.getItem(DRAFT_KEY));
}

function writeToStorage(
  kind: "session" | "local",
  payload: ListingPostDraft,
  images: string[],
): void {
  if (typeof window === "undefined") return;
  const store = kind === "session" ? sessionStorage : localStorage;
  try {
    store.setItem(DRAFT_KEY, JSON.stringify(payload));
    if (kind === "session") {
      store.setItem(LEGACY_IMAGES_KEY, JSON.stringify(images));
    }
  } catch {
    /* quota */
  }
}

/** Prefer freshest draft from session or local backup. */
export function readListingPostDraft(): ListingPostDraft | null {
  if (typeof window === "undefined") return null;
  const sessionDraft = readFromStorage("session");
  const localDraft = readFromStorage("local");
  if (sessionDraft && localDraft) {
    return sessionDraft.updatedAt >= localDraft.updatedAt ? sessionDraft : localDraft;
  }
  if (sessionDraft) return sessionDraft;
  if (localDraft) return localDraft;
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
  const images = draft.images.filter((u) => u.trim().length > 0).slice(0, MAX_DRAFT_IMAGES);
  const videoUrl =
    typeof draft.videoUrl === "string" && draft.videoUrl.trim().length > 0
      ? draft.videoUrl.trim()
      : null;
  if (images.length === 0 && !videoUrl) {
    clearListingPostDraft();
    return;
  }
  const payload: ListingPostDraft = {
    images,
    videoUrl,
    updatedAt: Date.now(),
  };
  writeToStorage("session", payload, images);
  writeToStorage("local", payload, images);
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
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_LOCAL_KEY);
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
    localStorage.setItem(ACTIVE_SESSION_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function clearListingPostSessionActive(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function wasListingPostSessionInterrupted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const active =
      sessionStorage.getItem(ACTIVE_SESSION_KEY) != null
      || localStorage.getItem(ACTIVE_SESSION_KEY) != null;
    return active && hasListingPostDraft();
  } catch {
    return false;
  }
}
