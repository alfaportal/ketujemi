/** Shared title+description similarity (Jaccard on tokens), 0–1. */

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeForSimilarity(input: string): string[] {
  return normalizeText(input)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(" ")
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
}

export function listingTextSimilarity(
  titleA: string,
  descriptionA: string,
  titleB: string,
  descriptionB: string,
): number {
  const a = `${titleA} ${descriptionA}`;
  const b = `${titleB} ${descriptionB}`;
  const as = new Set(tokenizeForSimilarity(a));
  const bs = new Set(tokenizeForSimilarity(b));
  if (as.size === 0 || bs.size === 0) return 0;
  let intersection = 0;
  for (const token of as) if (bs.has(token)) intersection++;
  return (2 * intersection) / (as.size + bs.size);
}

export const SELF_DUPLICATE_SCAN_THRESHOLD = 0.8;

export function listingsAreSimilarDuplicate(
  titleA: string,
  descriptionA: string,
  titleB: string,
  descriptionB: string,
  threshold = SELF_DUPLICATE_SCAN_THRESHOLD,
): boolean {
  return listingTextSimilarity(titleA, descriptionA, titleB, descriptionB) >= threshold;
}
