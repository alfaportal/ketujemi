/** Terms that mean “show all listings”, not a product keyword — ignore in search filters. */
const GENERIC_LISTING_SEARCH = new Set([
  "shpalljet",
  "shpallje",
  "shpallja",
  "shpalljen",
  "njoftimet",
  "njoftim",
  "njoftime",
  "njoftimi",
  "listings",
  "listing",
  "ads",
  "ad",
  "kerko",
  "kërko",
  "kerkim",
  "kërkim",
  "search",
  "oglasi",
  "oglas",
  "oglasite",
  "oglasi",
]);

function foldSearchTerm(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Returns trimmed search text, or empty string if the query is generic (show all). */
export function effectiveListingSearchQuery(raw: string | null | undefined): string {
  if (raw == null) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  if (GENERIC_LISTING_SEARCH.has(foldSearchTerm(trimmed))) return "";
  return trimmed;
}

export function isGenericListingSearchQuery(raw: string | null | undefined): boolean {
  if (raw == null) return false;
  const trimmed = String(raw).trim();
  if (!trimmed) return false;
  return GENERIC_LISTING_SEARCH.has(foldSearchTerm(trimmed));
}
