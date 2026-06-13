/** Fold Albanian accents for consistent matching (tavolin ↔ tavolinë). */
export function foldListingSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ë/g, "e")
    .replace(/ç/g, "c");
}

/** Whole-query aliases → root category slug (show entire hub, e.g. veture → all cars). */
export const LISTING_HUB_ALIASES: Record<string, readonly string[]> = {
  vetura: [
    "vetura",
    "veture",
    "veturat",
    "makina",
    "makinat",
    "makine",
    "automobil",
    "automjete",
    "car",
    "cars",
  ],
  "motorr-skuter": ["motorr", "motor", "motore", "skuter", "motocikleta", "motorra"],
  "kamione-furgone": ["kamion", "kamione", "furgon", "furgone", "kamionet"],
  "auto-pjese": ["auto pjese", "autopjese", "pjese auto", "pjese veture"],
  "banesa-shtepi": [
    "banesa",
    "banese",
    "shtepi",
    "shtepia",
    "apartament",
    "apartamente",
    "patundshmeri",
    "patundshmeria",
  ],
  "mobilje-dekorime": ["mobilje", "mobiljet", "dekorim", "dekorime", "furniture"],
  "rroba-kepuce": ["rroba", "rrobat", "kepuce", "kepuçe", "veshje", "clothes"],
  telefona: ["telefon", "telefona", "smartphone", "smartphones", "celular"],
  "kompjutere-laptope": ["kompjuter", "kompjutere", "laptop", "laptope", "pc"],
  femije: ["femije", "femijet", "per femije", "children", "baby"],
  "pune-sherbime": ["pune", "sherbime", "sherbimet", "jobs", "services"],
  "ndertim-instalime": ["ndertim", "instalime", "ndertime"],
  "bujqesi-blegtori": ["bujqesi", "blegtori", "blegtoria"],
  "muzike-hobby": ["muzike", "hobby", "hobi"],
  kafshet: ["kafshe", "kafshet", "pets"],
  "tv-elektronike": ["tv", "elektronike", "elektronika"],
  "sport-outdoor": ["sport", "outdoor", "sporti"],
  "lokale-zyre": ["lokale", "zyre", "zyrat", "office"],
  "arsim-kurse": ["arsim", "kurse", "kurs", "training"],
};

/** Returns hub slug when the full query means “show this category”, not a product keyword. */
export function resolveListingHubSlug(raw: string): string | null {
  const folded = foldListingSearchText(String(raw ?? "").trim());
  if (!folded) return null;
  for (const [slug, aliases] of Object.entries(LISTING_HUB_ALIASES)) {
    if (aliases.some((a) => foldListingSearchText(a) === folded)) return slug;
  }
  return null;
}

/** Split a user query into distinct keyword tokens (min 2 chars). */
export function listingSearchTokens(raw: string): string[] {
  if (resolveListingHubSlug(raw)) return [];

  const folded = foldListingSearchText(String(raw ?? "").trim());
  if (!folded) return [];
  const tokens = folded
    .split(/[\s,;.+/|\\-]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length >= 2);
  return [...new Set(tokens)];
}

export type CategorySearchRow = {
  id: number;
  name: string;
  parent_id: number | null;
  slug: string | null;
};

export type TokenCategoryResolution = {
  /** Brand leaf — strict filter (Mercedes only, not Golf). */
  strictBrandIds: number[];
  /** Broader category roots — include descendant tree (e.g. Tavolina & Karriget). */
  treeIds: number[];
};

function nameParts(name: string): string[] {
  return foldListingSearchText(name)
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length >= 2);
}

/** Brand names are short (Mercedes-Benz, BMW); product types are longer phrases. */
function isLikelyBrandCategoryName(name: string, token: string): boolean {
  const folded = foldListingSearchText(name);
  const parts = nameParts(name);
  if (!parts.some((p) => p === token || p.startsWith(token))) return false;
  if (parts.length <= 2) return true;
  if (folded.length <= 24 && parts[0] === token) return true;
  return false;
}

function tokenMatchesCategoryName(name: string, token: string): boolean {
  const parts = nameParts(name);
  return parts.some((p) => p === token || p.startsWith(token) || token.startsWith(p));
}

export async function resolveSearchTokenCategories(
  tokens: string[],
  categories: CategorySearchRow[],
  getTreeIds: (rootId: number) => Promise<number[]>,
): Promise<Map<string, TokenCategoryResolution>> {
  const map = new Map<string, TokenCategoryResolution>();
  if (tokens.length === 0) return map;

  const treeCache = new Map<number, number[]>();

  for (const token of tokens) {
    const strictBrandIds: number[] = [];
    const treeRootIds: number[] = [];

    for (const cat of categories) {
      if (!tokenMatchesCategoryName(cat.name, token)) continue;
      if (isLikelyBrandCategoryName(cat.name, token)) {
        strictBrandIds.push(cat.id);
      } else {
        treeRootIds.push(cat.id);
      }
    }

    const treeIds = new Set<number>();
    for (const rootId of treeRootIds) {
      let tree = treeCache.get(rootId);
      if (!tree) {
        tree = await getTreeIds(rootId);
        treeCache.set(rootId, tree);
      }
      for (const id of tree) treeIds.add(id);
    }

    map.set(token, {
      strictBrandIds: [...new Set(strictBrandIds)],
      treeIds: [...treeIds],
    });
  }

  return map;
}
