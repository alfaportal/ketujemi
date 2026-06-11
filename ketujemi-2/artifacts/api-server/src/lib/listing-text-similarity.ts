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
/** Block at post time — lower than scan; AI rewrites titles between attempts. */
export const SELF_DUPLICATE_POST_THRESHOLD = 0.55;

const SQ_STOPWORDS = new Set([
  "me",
  "te",
  "të",
  "dhe",
  "një",
  "nje",
  "per",
  "për",
  "i",
  "e",
  "a",
  "o",
  "u",
  "në",
  "ne",
  "se",
  "si",
  "qe",
  "që",
  "nga",
  "pa",
  "ka",
  "do",
  "eshte",
  "është",
  "ose",
  "por",
  "ky",
  "kjo",
  "kete",
  "këtë",
  "shume",
  "shumë",
  "me",
  "nga",
  "ne",
  "ju",
  "ai",
  "ajo",
]);

function foldAlbanianToken(token: string): string {
  return token
    .toLowerCase()
    .normalize("NFC")
    .replace(/ë/g, "e")
    .replace(/ç/g, "c");
}

function significantTitleTokens(title: string): Set<string> {
  const out = new Set<string>();
  for (const raw of tokenizeForSimilarity(title)) {
    const folded = foldAlbanianToken(raw);
    if (folded.length < 3) continue;
    if (SQ_STOPWORDS.has(folded)) continue;
    out.add(folded);
  }
  return out;
}

export function listingTitleSimilarity(titleA: string, titleB: string): number {
  const as = significantTitleTokens(titleA);
  const bs = significantTitleTokens(titleB);
  if (as.size === 0 || bs.size === 0) return 0;
  let intersection = 0;
  for (const token of as) if (bs.has(token)) intersection++;
  return (2 * intersection) / (as.size + bs.size);
}

export function significantTitleTokenOverlap(titleA: string, titleB: string): number {
  const as = significantTitleTokens(titleA);
  const bs = significantTitleTokens(titleB);
  let n = 0;
  for (const token of as) if (bs.has(token)) n++;
  return n;
}

export function listingsAreSimilarDuplicate(
  titleA: string,
  descriptionA: string,
  titleB: string,
  descriptionB: string,
  threshold = SELF_DUPLICATE_SCAN_THRESHOLD,
): boolean {
  return listingTextSimilarity(titleA, descriptionA, titleB, descriptionB) >= threshold;
}

export function isSelfDuplicateListingMatch(
  incoming: { title: string; description: string; categoryId?: number | null },
  existing: { title: string; description: string; categoryId?: number | null },
): boolean {
  const fullSim = listingTextSimilarity(
    incoming.title,
    incoming.description,
    existing.title,
    existing.description,
  );
  if (fullSim >= SELF_DUPLICATE_POST_THRESHOLD) return true;

  const sameCategory =
    incoming.categoryId != null &&
    incoming.categoryId > 0 &&
    incoming.categoryId === existing.categoryId;

  if (!sameCategory) return false;

  if (significantTitleTokenOverlap(incoming.title, existing.title) >= 2) return true;
  if (listingTitleSimilarity(incoming.title, existing.title) >= 0.42) return true;

  return false;
}
