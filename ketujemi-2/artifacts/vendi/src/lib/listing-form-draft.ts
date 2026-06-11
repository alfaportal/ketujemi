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

export function readListingFormDraft(pathname: string): ListingFormDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(draftKey(pathname));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListingFormDraft;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.imageUrls)) parsed.imageUrls = [];
    return parsed;
  } catch {
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveListingFormDraft(pathname: string, draft: ListingFormDraft): void {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      sessionStorage.setItem(
        draftKey(pathname),
        JSON.stringify({ ...draft, savedAt: Date.now() }),
      );
    } catch {
      /* quota / private mode */
    }
  }, 250);
}

export function clearListingFormDraft(pathname: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(draftKey(pathname));
  } catch {
    /* ignore */
  }
}

export function isListingPostPath(pathname: string): boolean {
  return pathname.startsWith("/listings/new");
}
