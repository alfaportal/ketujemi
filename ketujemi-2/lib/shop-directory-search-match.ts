/** Albanian / Latin shop search aliases → directory category slug. */
const SHOP_SEARCH_HUB_ALIASES: Record<string, string> = {
  fluturime: "turizem-udhetimet",
  fluturim: "turizem-udhetimet",
  bileta: "turizem-udhetimet",
  bilete: "turizem-udhetimet",
  avion: "turizem-udhetimet",
  avioni: "turizem-udhetimet",
  travel: "turizem-udhetimet",
  turizem: "turizem-udhetimet",
  turizëm: "turizem-udhetimet",
  udhëtime: "turizem-udhetimet",
  udhetime: "turizem-udhetimet",
  udhëtim: "turizem-udhetimet",
  udhetim: "turizem-udhetimet",
  hotel: "turizem-udhetimet",
  hotele: "turizem-udhetimet",
  paketa: "turizem-udhetimet",
  mobilje: "shtepi-mobilje",
  mobileri: "shtepi-mobilje",
  furniture: "shtepi-mobilje",
  telefon: "elektronike-teknologji",
  telefona: "elektronike-teknologji",
  laptop: "elektronike-teknologji",
  patundshmeri: "patundshmeri",
  patundshmëri: "patundshmeri",
  agjensi: "patundshmeri",
  agjension: "patundshmeri",
  vetura: "makina-transport",
  makina: "makina-transport",
  auto: "makina-transport",
  rroba: "moda-veshje",
  veshje: "moda-veshje",
  kepuce: "moda-veshje",
  këpucë: "moda-veshje",
  femije: "femije-nena",
  fëmijë: "femije-nena",
  sport: "sport-rekreacion",
  ndertim: "ndertim-instalime",
  ndërtim: "ndertim-instalime",
};

function foldShopSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .trim();
}

/** Map a free-text shop query to a directory hub category slug when it is a known alias. */
export function resolveShopDirectoryHubSlug(query: string): string | null {
  const folded = foldShopSearchText(query);
  if (!folded) return null;

  if (SHOP_SEARCH_HUB_ALIASES[folded]) return SHOP_SEARCH_HUB_ALIASES[folded];

  const tokens = folded.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (SHOP_SEARCH_HUB_ALIASES[token]) return SHOP_SEARCH_HUB_ALIASES[token];
  }

  for (const [alias, slug] of Object.entries(SHOP_SEARCH_HUB_ALIASES)) {
    if (folded.includes(alias)) return slug;
  }

  return null;
}

export function shopSearchTokens(query: string): string[] {
  return foldShopSearchText(query)
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length >= 2);
}
