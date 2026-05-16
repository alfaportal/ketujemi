/** Lokale & Zyrë hub slug (matches seeded category). */
export const LOKALE_ZYRE_HUB_SLUG = "lokale-zyre";

export const LOKALE_ZYRE_HERO_PHOTO =
  "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const LOKALE_PROPERTY_KEYS = [
  "afariste",
  "zyre",
  "depo",
  "industrial",
  "garazha",
] as const;

export type LokalePropertyKey = (typeof LOKALE_PROPERTY_KEYS)[number];

export const LOKALE_PROPERTY_SLUG: Record<LokalePropertyKey, string> = {
  afariste: "lokale-type-afariste",
  zyre: "lokale-type-zyre",
  depo: "lokale-type-depo",
  industrial: "lokale-type-industriale",
  garazha: "lokale-type-garazha",
};

export const LOKALE_PROPERTY_PHOTOS: Record<LokalePropertyKey, string> = {
  afariste:
    "https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=400",
  zyre:
    "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=400",
  depo:
    "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=400",
  industrial:
    "https://images.pexels.com/photos/3732951/pexels-photo-3732951.jpeg?auto=compress&cs=tinysrgb&w=400",
  garazha:
    "https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const LOKALE_PROPERTY_LABEL_KEY: Record<LokalePropertyKey, string> = {
  afariste: "lz_type_afariste",
  zyre: "lz_type_zyre",
  depo: "lz_type_depo",
  industrial: "lz_type_industrial",
  garazha: "lz_type_garazha",
};

/** Afariste destination groups and options. */
export const LZ_AFARISTE_GROUPS = [
  {
    groupKey: "gastro",
    labelKey: "lz_grp_gastro",
    options: [
      { key: "restorant", labelKey: "lz_dest_restorant", search: "Restorant" },
      { key: "kafene", labelKey: "lz_dest_kafene", search: "Kafene Bar" },
      { key: "fastfood", labelKey: "lz_dest_fastfood", search: "Fast Food Pizzeria" },
    ],
  },
  {
    groupKey: "tregti",
    labelKey: "lz_grp_tregti",
    options: [
      { key: "butik", labelKey: "lz_dest_butik", search: "Butik Rroba" },
      { key: "market", labelKey: "lz_dest_market", search: "Market Ushqimore" },
      { key: "mishtore", labelKey: "lz_dest_mishtore", search: "Mishtore" },
      { key: "furre", labelKey: "lz_dest_furre", search: "Furrë Ëmbëltore" },
      { key: "barnatore", labelKey: "lz_dest_barnatore", search: "Barnatore" },
    ],
  },
  {
    groupKey: "sherbime",
    labelKey: "lz_grp_sherbime",
    options: [
      { key: "bukuri", labelKey: "lz_dest_bukuri", search: "Sallon Bukurie Frizer" },
      { key: "autolarje", labelKey: "lz_dest_autolarje", search: "Autolarje Servis" },
      { key: "fitness", labelKey: "lz_dest_fitness", search: "Fitness Palestër" },
    ],
  },
  {
    groupKey: "hapesire",
    labelKey: "lz_grp_hapesire",
    options: [
      { key: "klinike", labelKey: "lz_dest_klinike", search: "Klinikë Ordinancë" },
      { key: "laborator", labelKey: "lz_dest_laborator", search: "Laborator" },
      { key: "agjenci", labelKey: "lz_dest_agjenci", search: "Agjenci Kompani" },
    ],
  },
] as const;

export type LzAfaristeDestKey =
  (typeof LZ_AFARISTE_GROUPS)[number]["options"][number]["key"];

export const LZ_OFFICE_TYPE_KEYS = [
  "individuale",
  "open_space",
  "full_floor",
  "coworking",
] as const;
export type LzOfficeTypeKey = (typeof LZ_OFFICE_TYPE_KEYS)[number];

export const LZ_OFFICE_TYPE_LABEL_KEY: Record<LzOfficeTypeKey, string> = {
  individuale: "lz_off_individual",
  open_space: "lz_off_open",
  full_floor: "lz_off_full_floor",
  coworking: "lz_off_coworking",
};

export const LZ_OFFICE_TYPE_SEARCH: Record<LzOfficeTypeKey, string> = {
  individuale: "Zyrë Individuale",
  open_space: "Open Space",
  full_floor: "Kati i plotë",
  coworking: "Coworking",
};

export const LZ_OFFICE_COUNT_KEYS = ["1", "2", "3", "4", "5p"] as const;
export type LzOfficeCountKey = (typeof LZ_OFFICE_COUNT_KEYS)[number];

export const LZ_OFFICE_COUNT_LABEL_KEY: Record<LzOfficeCountKey, string> = {
  "1": "lz_count_1",
  "2": "lz_count_2",
  "3": "lz_count_3",
  "4": "lz_count_4",
  "5p": "lz_count_5p",
};

export const LZ_OFFICE_COUNT_SEARCH: Record<LzOfficeCountKey, string> = {
  "1": "1 zyrë",
  "2": "2 zyra",
  "3": "3 zyra",
  "4": "4 zyra",
  "5p": "5+ zyra",
};

export const LZ_WC_COUNT_KEYS = ["1", "2", "3p"] as const;
export type LzWcCountKey = (typeof LZ_WC_COUNT_KEYS)[number];

export const LZ_WC_COUNT_LABEL_KEY: Record<LzWcCountKey, string> = {
  "1": "lz_wc_1",
  "2": "lz_wc_2",
  "3p": "lz_wc_3p",
};

export const LZ_WC_COUNT_SEARCH: Record<LzWcCountKey, string> = {
  "1": "1 WC",
  "2": "2 WC",
  "3p": "3+ WC",
};

export const LZ_ZYRE_FEATURE_KEYS = [
  "meeting",
  "kitchen",
  "server",
  "ac",
  "elevator",
] as const;
export type LzZyreFeatureKey = (typeof LZ_ZYRE_FEATURE_KEYS)[number];

export const LZ_ZYRE_FEATURE_LABEL_KEY: Record<LzZyreFeatureKey, string> = {
  meeting: "lz_zyre_meeting",
  kitchen: "lz_zyre_kitchen",
  server: "lz_zyre_server",
  ac: "lz_zyre_ac",
  elevator: "lz_zyre_elevator",
};

export const LZ_ZYRE_FEATURE_SEARCH: Record<LzZyreFeatureKey, string> = {
  meeting: "Sallë takimesh",
  kitchen: "Kuzhinë e integruar",
  server: "Server Room",
  ac: "Klimatizim",
  elevator: "Ashensor",
};

export const LZ_DEPO_TYPE_KEYS = ["general", "cold", "pharma"] as const;
export type LzDepoTypeKey = (typeof LZ_DEPO_TYPE_KEYS)[number];

export const LZ_DEPO_TYPE_LABEL_KEY: Record<LzDepoTypeKey, string> = {
  general: "lz_depo_general",
  cold: "lz_depo_cold",
  pharma: "lz_depo_pharma",
};

export const LZ_DEPO_TYPE_SEARCH: Record<LzDepoTypeKey, string> = {
  general: "Mallra të Përgjithshme",
  cold: "Frigoriferike",
  pharma: "Farmaceutike",
};

export const LZ_CEILING_KEYS = ["under4", "4_6", "over6"] as const;
export type LzCeilingKey = (typeof LZ_CEILING_KEYS)[number];

export const LZ_CEILING_LABEL_KEY: Record<LzCeilingKey, string> = {
  under4: "lz_ceil_under4",
  "4_6": "lz_ceil_4_6",
  over6: "lz_ceil_over6",
};

export const LZ_CEILING_SEARCH: Record<LzCeilingKey, string> = {
  under4: "Nën 4m",
  "4_6": "4m-6m",
  over6: "Mbi 6m",
};

export const LZ_DEPO_FEATURE_KEYS = ["ramp", "floor", "security", "admin"] as const;
export type LzDepoFeatureKey = (typeof LZ_DEPO_FEATURE_KEYS)[number];

export const LZ_DEPO_FEATURE_LABEL_KEY: Record<LzDepoFeatureKey, string> = {
  ramp: "lz_depo_ramp",
  floor: "lz_depo_floor",
  security: "lz_depo_security",
  admin: "lz_depo_admin",
};

export const LZ_DEPO_FEATURE_SEARCH: Record<LzDepoFeatureKey, string> = {
  ramp: "Rrampa Shkarkim",
  floor: "Dysheme Industriale",
  security: "Siguri 24/7",
  admin: "Zyrë administrative",
};

export const LZ_IND_TYPE_KEYS = ["factory", "workshop", "complex"] as const;
export type LzIndTypeKey = (typeof LZ_IND_TYPE_KEYS)[number];

export const LZ_IND_TYPE_LABEL_KEY: Record<LzIndTypeKey, string> = {
  factory: "lz_ind_factory",
  workshop: "lz_ind_workshop",
  complex: "lz_ind_complex",
};

export const LZ_IND_TYPE_SEARCH: Record<LzIndTypeKey, string> = {
  factory: "Fabrikë Repart",
  workshop: "Punëtori",
  complex: "Kompleks Industrial",
};

export const LZ_IND_FEATURE_KEYS = ["crane", "substation", "fire", "sewer"] as const;
export type LzIndFeatureKey = (typeof LZ_IND_FEATURE_KEYS)[number];

export const LZ_IND_FEATURE_LABEL_KEY: Record<LzIndFeatureKey, string> = {
  crane: "lz_ind_crane",
  substation: "lz_ind_substation",
  fire: "lz_ind_fire",
  sewer: "lz_ind_sewer",
};

export const LZ_IND_FEATURE_SEARCH: Record<LzIndFeatureKey, string> = {
  crane: "Vinç Kran",
  substation: "Trafostacion",
  fire: "Kundër zjarrit",
  sewer: "Kanalizim Industrial",
};

export const LZ_GAR_TYPE_KEYS = ["underground", "outdoor", "open"] as const;
export type LzGarTypeKey = (typeof LZ_GAR_TYPE_KEYS)[number];

export const LZ_GAR_TYPE_LABEL_KEY: Record<LzGarTypeKey, string> = {
  underground: "lz_gar_under",
  outdoor: "lz_gar_outdoor",
  open: "lz_gar_open",
};

export const LZ_GAR_TYPE_SEARCH: Record<LzGarTypeKey, string> = {
  underground: "Nëntokësore",
  outdoor: "E jashtme",
  open: "Vendparkim i hapur",
};

export const LZ_GAR_CAP_KEYS = ["1", "2", "3_5", "5p"] as const;
export type LzGarCapKey = (typeof LZ_GAR_CAP_KEYS)[number];

export const LZ_GAR_CAP_LABEL_KEY: Record<LzGarCapKey, string> = {
  "1": "lz_cap_1",
  "2": "lz_cap_2",
  "3_5": "lz_cap_3_5",
  "5p": "lz_cap_5p",
};

export const LZ_GAR_CAP_SEARCH: Record<LzGarCapKey, string> = {
  "1": "1 veturë",
  "2": "2 vetura",
  "3_5": "3-5 vetura",
  "5p": "5+ vetura",
};

export const LZ_GAR_FEATURE_KEYS = ["door", "power", "water", "repair"] as const;
export type LzGarFeatureKey = (typeof LZ_GAR_FEATURE_KEYS)[number];

export const LZ_GAR_FEATURE_LABEL_KEY: Record<LzGarFeatureKey, string> = {
  door: "lz_gar_door",
  power: "lz_gar_power",
  water: "lz_gar_water",
  repair: "lz_gar_repair",
};

export const LZ_GAR_FEATURE_SEARCH: Record<LzGarFeatureKey, string> = {
  door: "Derë Automatike",
  power: "Rrymë e instaluar",
  water: "Ujë Kanalizim",
  repair: "Kanal riparim",
};

export const LOKALE_ZYRE_CITY_KEYS = [
  "prishtine",
  "ferizaj",
  "prizren",
  "peje",
  "mitrovice",
  "gjakove",
  "gjilan",
  "vushtrri",
  "podujeve",
  "tirane",
  "durres",
  "vlore",
  "shkoder",
  "elbasan",
  "shkup",
  "tetove",
  "bitola",
  "ohrid",
  "podgorice",
  "bar",
  "budva",
  "niksic",
] as const;

export type LokaleCityKey = (typeof LOKALE_ZYRE_CITY_KEYS)[number];

export const LOKALE_ZYRE_CITY_SEARCH: Record<LokaleCityKey, string> = {
  prishtine: "Prishtinë",
  ferizaj: "Ferizaj",
  prizren: "Prizren",
  peje: "Pejë",
  mitrovice: "Mitrovicë",
  gjakove: "Gjakovë",
  gjilan: "Gjilan",
  vushtrri: "Vushtrri",
  podujeve: "Podujevë",
  tirane: "Tiranë",
  durres: "Durrës",
  vlore: "Vlorë",
  shkoder: "Shkodër",
  elbasan: "Elbasan",
  shkup: "Shkup",
  tetove: "Tetovë",
  bitola: "Bitola",
  ohrid: "Ohër",
  podgorice: "Podgoricë",
  bar: "Bar",
  budva: "Budva",
  niksic: "Nikshiq",
};

export const LOKALE_ZYRE_CITY_LABEL_KEY: Record<LokaleCityKey, string> = {
  prishtine: "lz_city_prishtine",
  ferizaj: "lz_city_ferizaj",
  prizren: "lz_city_prizren",
  peje: "lz_city_peje",
  mitrovice: "lz_city_mitrovice",
  gjakove: "lz_city_gjakove",
  gjilan: "lz_city_gjilan",
  vushtrri: "lz_city_vushtrri",
  podujeve: "lz_city_podujeve",
  tirane: "lz_city_tirane",
  durres: "lz_city_durres",
  vlore: "lz_city_vlore",
  shkoder: "lz_city_shkoder",
  elbasan: "lz_city_elbasan",
  shkup: "lz_city_shkup",
  tetove: "lz_city_tetove",
  bitola: "lz_city_bitola",
  ohrid: "lz_city_ohrid",
  podgorice: "lz_city_podgorice",
  bar: "lz_city_bar",
  budva: "lz_city_budva",
  niksic: "lz_city_niksic",
};

export const LOKALE_UNIVERSAL_FILTER_KEYS = [
  "truck",
  "parking",
  "power",
  "heating",
] as const;

export type LokaleUniversalFilterKey = (typeof LOKALE_UNIVERSAL_FILTER_KEYS)[number];

export const LOKALE_UNIVERSAL_LABEL_KEY: Record<LokaleUniversalFilterKey, string> = {
  truck: "lz_filter_truck",
  parking: "lz_filter_parking",
  power: "lz_filter_power",
  heating: "lz_filter_heating",
};

export const LOKALE_UNIVERSAL_SEARCH: Record<LokaleUniversalFilterKey, string> = {
  truck: "Qasje për Kamionë",
  parking: "Parking Privat",
  power: "Rrymë Industriale 3-Fazore",
  heating: "Ngrohje Qendrore",
};

/** @deprecated use LOKALE_UNIVERSAL_* */
export const LOKALE_ADVANCED_FILTER_KEYS = LOKALE_UNIVERSAL_FILTER_KEYS;
export type LokaleAdvancedFilterKey = LokaleUniversalFilterKey;
export const LOKALE_ADVANCED_LABEL_KEY = LOKALE_UNIVERSAL_LABEL_KEY;
export const LOKALE_ADVANCED_SEARCH = LOKALE_UNIVERSAL_SEARCH;

export type LokaleZyreCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getLokaleZyreLeafCategoryIds(
  categories: LokaleZyreCategoryRow[],
  hubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === hubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("lokale-type-"),
    )
    .map((c) => c.id);
}

export function resolveLokalePropertyCategoryId(
  categories: LokaleZyreCategoryRow[],
  hubId: number,
  propertyKey: LokalePropertyKey,
): number | undefined {
  const slug = LOKALE_PROPERTY_SLUG[propertyKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}

export function findAfaristeDestSearch(destKey: string): string | undefined {
  for (const g of LZ_AFARISTE_GROUPS) {
    const opt = g.options.find((o) => o.key === destKey);
    if (opt) return opt.search;
  }
  return undefined;
}
