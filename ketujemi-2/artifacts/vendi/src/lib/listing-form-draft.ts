import type { ListingMarketCode } from "@/lib/market-context";
import type { NewListingFormData } from "@/lib/listing-form-schema";

const DRAFT_KEY_PREFIX = "vendi_new_listing_draft:";

export type ListingFormDraft = {
  form: Partial<NewListingFormData>;
  imageUrls: string[];
  videoUrl: string | null;
  listingCountry: ListingMarketCode;
  savedAt: number;
};

function draftKey(pathname: string): string {
  return `${DRAFT_KEY_PREFIX}${pathname || "/listings/new"}`;
}

function readRaw(storage: Storage, pathname: string): ListingFormDraft | null {
  try {
    const raw = storage.getItem(draftKey(pathname));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListingFormDraft;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.imageUrls)) parsed.imageUrls = [];
    if (typeof parsed.savedAt !== "number") parsed.savedAt = 0;
    return parsed;
  } catch {
    return null;
  }
}

function writeRaw(storage: Storage, pathname: string, draft: ListingFormDraft): void {
  try {
    storage.setItem(draftKey(pathname), JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch {
    /* quota / private mode */
  }
}

export function listingDraftHasContent(draft: ListingFormDraft | null): boolean {
  if (!draft) return false;
  if (draft.imageUrls.length > 0) return true;
  if (draft.videoUrl) return true;
  const f = draft.form;
  if ((f.title?.trim()?.length ?? 0) >= 2) return true;
  if ((f.description?.trim()?.length ?? 0) >= 3) return true;
  if ((f.seller_phone?.trim()?.length ?? 0) >= 5) return true;
  if (Number(f.parent_category_id) > 0) return true;
  return false;
}

export function readListingFormDraft(pathname: string): ListingFormDraft | null {
  if (typeof window === "undefined") return null;
  const session = readRaw(sessionStorage, pathname);
  const local = readRaw(localStorage, pathname);
  if (!session && !local) return null;
  if (!session) return local;
  if (!local) return session;
  return (session.savedAt >= local.savedAt ? session : local) ?? null;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Synchronous write — use before tab close / background. */
export function flushListingFormDraft(pathname: string, draft: ListingFormDraft): void {
  if (typeof window === "undefined") return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  const payload = { ...draft, savedAt: Date.now() };
  writeRaw(sessionStorage, pathname, payload);
  writeRaw(localStorage, pathname, payload);
}

export function saveListingFormDraft(pathname: string, draft: ListingFormDraft): void {
  if (typeof window === "undefined") return;
  if (!listingDraftHasContent(draft)) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    flushListingFormDraft(pathname, draft);
  }, 120);
}

export function clearListingFormDraft(pathname: string): void {
  if (typeof window === "undefined") return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    sessionStorage.removeItem(draftKey(pathname));
    localStorage.removeItem(draftKey(pathname));
  } catch {
    /* ignore */
  }
}

export function isListingPostPath(pathname: string): boolean {
  return pathname.startsWith("/listings/new");
}

/** Persist draft when the browser backgrounds the tab or unloads the page. */
export function setupListingDraftPageGuard(
  pathname: string,
  getSnapshot: () => ListingFormDraft,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const flush = () => {
    if (!isListingPostPath(pathname)) return;
    const snap = getSnapshot();
    if (listingDraftHasContent(snap)) {
      flushListingFormDraft(pathname, snap);
    }
  };

  const onVisibility = () => {
    if (document.visibilityState === "hidden") flush();
  };

  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    window.removeEventListener("pagehide", flush);
    window.removeEventListener("beforeunload", flush);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
