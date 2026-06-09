/** Special marketplace parent categories — keep slugs in sync across DB seed, API, and UI. */
export const KERKOJ_TE_BLEJ_SLUG = "kerkoj-te-blej" as const;
export const KERKOJ_POST_PATH = "/listings/new/kerkoj-te-blej" as const;
export const DHURATA_FALAS_SLUG = "dhurata-falas" as const;

export const KERKOJ_ACTIVE_LIFETIME_DAYS = 30;
export const DHURATA_ACTIVE_LIFETIME_DAYS = 30;
/** No practical cap — listings may include many photos. */
export const LISTING_MAX_PHOTOS = 999;
export const KERKOJ_MAX_PHOTOS = LISTING_MAX_PHOTOS;
export const KERKOJ_MAX_ACTIVE_PER_USER = 1;
export const DHURATA_MAX_PHOTOS = LISTING_MAX_PHOTOS;

export const DHURATA_PRICE_ZERO_MESSAGE =
  "Në kategorinë Dhurata & Falas çmimi duhet të jetë 0";

/** Selling-language blocked in buyer-request posts. */
export const KERKOJ_BLOCKED_WORD_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bshes\b/i, label: "shes" },
  { re: /\bkam\s+p[ëe]r\s+shitje\b/i, label: "kam për shitje" },
  { re: /\bofrojm[ëe]\b/i, label: "ofrojmë" },
  { re: /\bme\s+shumic[ëe]\b/i, label: "me shumicë" },
  { re: /\bdisponojm[ëe]\b/i, label: "disponojmë" },
];

/** Blocked in free-gift posts — selling / payment language. */
export const DHURATA_BLOCKED_WORD_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bshes\b/i, label: "shes" },
  { re: /\bshit(?:je|ni)?\b/i, label: "shit" },
  { re: /\bçmim\b/i, label: "çmim" },
  { re: /\bcmim\b/i, label: "çmim" },
  { re: /\bpaguaj\b/i, label: "paguaj" },
  { re: /\btransfer\b/i, label: "transfer" },
  { re: /\bbonuse\b/i, label: "bonuse" },
  { re: /\bofert[ëe]\b/i, label: "ofertë" },
  { re: /\bme\s+pages[ëe]\b/i, label: "me pagesë" },
  { re: /\bkontraktoj\b/i, label: "kontraktoj" },
];

export function isKerkojTeBlejSlug(slug: string | null | undefined): boolean {
  return slug?.trim() === KERKOJ_TE_BLEJ_SLUG;
}

/** True when `category` is kerkoj-te-blej or any descendant in the tree. */
export function isUnderKerkojTeBlejCategory(
  category: { slug?: string | null; parent_id?: number | null } | null | undefined,
  all: ReadonlyArray<{ id: number; slug?: string | null; parent_id?: number | null }>,
): boolean {
  let cur = category;
  while (cur) {
    if (isKerkojTeBlejSlug(cur.slug)) return true;
    const pid = cur.parent_id;
    if (pid == null) break;
    cur = all.find((c) => Number(c.id) === Number(pid)) ?? null;
  }
  return false;
}

export function isDhurataFalasSlug(slug: string | null | undefined): boolean {
  return slug?.trim() === DHURATA_FALAS_SLUG;
}

export function findKerkojBlockedWord(text: string): string | null {
  const combined = text.trim();
  if (!combined) return null;
  for (const { re, label } of KERKOJ_BLOCKED_WORD_PATTERNS) {
    if (re.test(combined)) return label;
  }
  return null;
}

export function findDhurataBlockedWord(text: string): string | null {
  const combined = text.trim();
  if (!combined) return null;
  for (const { re, label } of DHURATA_BLOCKED_WORD_PATTERNS) {
    if (re.test(combined)) return label;
  }
  return null;
}

export function countListingImages(imageUrl: string | null | undefined): number {
  if (!imageUrl?.trim()) return 0;
  return imageUrl.split(",").map((s) => s.trim()).filter(Boolean).length;
}

export function splitListingImageUrls(imageUrl: string | null | undefined): string[] {
  if (!imageUrl?.trim()) return [];
  return imageUrl.split(",").map((s) => s.trim()).filter(Boolean);
}
