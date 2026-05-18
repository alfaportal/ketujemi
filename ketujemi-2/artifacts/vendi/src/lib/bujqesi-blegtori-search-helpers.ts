/** Bujqësi & Blegtori hub slug (matches seeded category). */
export const BUJQESI_BLEGTORI_HUB_SLUG = "bujqesi-blegtori";

export const BUJQESI_BLEGTORI_HERO_PHOTO =
  "https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const BB_TYPE_KEYS = [
  "makineri",
  "bageti",
  "shpeze",
  "ushqim_kafshet",
  "farera_plehra",
] as const;

export type BbTypeKey = (typeof BB_TYPE_KEYS)[number];

export const BB_TYPE_DB_SLUG: Record<BbTypeKey, string> = {
  makineri: "bujq-type-makineri",
  bageti: "bujq-type-bageti",
  shpeze: "bujq-type-shpeze",
  ushqim_kafshet: "bujq-type-ushqim-kafshet",
  farera_plehra: "bujq-type-farera-plehra",
};

export const BB_TYPE_PHOTOS: Record<BbTypeKey, string> = {
  makineri:
    "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=400",
  bageti:
    "https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=400",
  shpeze:
    "https://images.pexels.com/photos/1300375/pexels-photo-1300375.jpeg?auto=compress&cs=tinysrgb&w=400",
  ushqim_kafshet:
    "https://images.pexels.com/photos/1084542/pexels-photo-1084542.jpeg?auto=compress&cs=tinysrgb&w=400",
  farera_plehra:
    "https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const BB_TYPE_LABEL_KEY: Record<BbTypeKey, string> = {
  makineri: "bb_type_makineri",
  bageti: "bb_type_bageti",
  shpeze: "bb_type_shpeze",
  ushqim_kafshet: "bb_type_ushqim",
  farera_plehra: "bb_type_farera",
};

export const BB_MACH_TYPE_KEYS = [
  "traktore",
  "kombajna",
  "motokultivator",
  "bashkengjitje",
  "korrje",
  "pompa",
] as const;
export type BbMachTypeKey = (typeof BB_MACH_TYPE_KEYS)[number];

export const BB_MACH_TYPE_LABEL_KEY: Record<BbMachTypeKey, string> = {
  traktore: "bb_mch_traktore",
  kombajna: "bb_mch_kombajna",
  motokultivator: "bb_mch_motokultivator",
  bashkengjitje: "bb_mch_bashkengjitje",
  korrje: "bb_mch_korrje",
  pompa: "bb_mch_pompa",
};

export const BB_MACH_TYPE_SEARCH: Record<BbMachTypeKey, string> = {
  traktore: "Traktorë",
  kombajna: "Kombajna",
  motokultivator: "Motokultivatorë Freza",
  bashkengjitje: "Pajisje Bashkëngjitëse",
  korrje: "Makina Korrëse Prerëse",
  pompa: "Pompa Uji Ujitjeje",
};

export const BB_POWER_KEYS = ["under_50", "50_100", "over_100"] as const;
export type BbPowerKey = (typeof BB_POWER_KEYS)[number];

export const BB_POWER_LABEL_KEY: Record<BbPowerKey, string> = {
  under_50: "bb_pwr_under_50",
  "50_100": "bb_pwr_50_100",
  over_100: "bb_pwr_over_100",
};

export const BB_POWER_SEARCH: Record<BbPowerKey, string> = {
  under_50: "Nën 50 KF",
  "50_100": "50-100 KF",
  over_100: "Mbi 100 KF",
};

export const BB_LIVESTOCK_KEYS = ["gjedhe", "dele", "derra", "kuaj"] as const;
export type BbLivestockKey = (typeof BB_LIVESTOCK_KEYS)[number];

export const BB_LIVESTOCK_LABEL_KEY: Record<BbLivestockKey, string> = {
  gjedhe: "bb_liv_gjedhe",
  dele: "bb_liv_dele",
  derra: "bb_liv_derra",
  kuaj: "bb_liv_kuaj",
};

export const BB_LIVESTOCK_SEARCH: Record<BbLivestockKey, string> = {
  gjedhe: "Gjedhe Lopa Mëshqerra",
  dele: "Dele Dhi",
  derra: "Derra",
  kuaj: "Kuaj Gomarë",
};

export const BB_PURPOSE_KEYS = ["qumesht", "mish", "riprodhim"] as const;
export type BbPurposeKey = (typeof BB_PURPOSE_KEYS)[number];

export const BB_PURPOSE_LABEL_KEY: Record<BbPurposeKey, string> = {
  qumesht: "bb_purp_qumesht",
  mish: "bb_purp_mish",
  riprodhim: "bb_purp_riprodhim",
};

export const BB_PURPOSE_SEARCH: Record<BbPurposeKey, string> = {
  qumesht: "Për Qumësht",
  mish: "Për Mish",
  riprodhim: "Për Riprodhim",
};

export const BB_POULTRY_KEYS = ["pula", "gjeldet", "rosa", "te_tjera"] as const;
export type BbPoultryKey = (typeof BB_POULTRY_KEYS)[number];

export const BB_POULTRY_LABEL_KEY: Record<BbPoultryKey, string> = {
  pula: "bb_plt_pula",
  gjeldet: "bb_plt_gjeldet",
  rosa: "bb_plt_rosa",
  te_tjera: "bb_plt_te_tjera",
};

export const BB_POULTRY_SEARCH: Record<BbPoultryKey, string> = {
  pula: "Pula Polat",
  gjeldet: "Gjeldeta",
  rosa: "Rosat Patat",
  te_tjera: "Shpezë të tjera",
};

export const BB_POULTRY_AGE_KEYS = ["1_ditor", "rritur", "vojse"] as const;
export type BbPoultryAgeKey = (typeof BB_POULTRY_AGE_KEYS)[number];

export const BB_POULTRY_AGE_LABEL_KEY: Record<BbPoultryAgeKey, string> = {
  "1_ditor": "bb_age_1_ditor",
  rritur: "bb_age_rritur",
  vojse: "bb_age_vojse",
};

export const BB_POULTRY_AGE_SEARCH: Record<BbPoultryAgeKey, string> = {
  "1_ditor": "Zogj njëditorë",
  rritur: "Zogj të rritur",
  vojse: "Shpezë vojse",
};

export const BB_FEED_KEYS = ["that", "koncentruar", "drithera", "silazh", "premiksa"] as const;
export type BbFeedKey = (typeof BB_FEED_KEYS)[number];

export const BB_FEED_LABEL_KEY: Record<BbFeedKey, string> = {
  that: "bb_feed_that",
  koncentruar: "bb_feed_koncentruar",
  drithera: "bb_feed_drithera",
  silazh: "bb_feed_silazh",
  premiksa: "bb_feed_premiksa",
};

export const BB_FEED_SEARCH: Record<BbFeedKey, string> = {
  that: "Ushqim i Thatë",
  koncentruar: "Ushqim i Koncentruar",
  drithera: "Drithëra Misër Grurë",
  silazh: "Silazh",
  premiksa: "Premiksa Vitamina",
};

export const BB_SEED_KEYS = [
  "dritherash",
  "perimesh",
  "fidane",
  "kimike",
  "organike",
  "pesticide",
] as const;
export type BbSeedKey = (typeof BB_SEED_KEYS)[number];

export const BB_SEED_LABEL_KEY: Record<BbSeedKey, string> = {
  dritherash: "bb_seed_dritherash",
  perimesh: "bb_seed_perimesh",
  fidane: "bb_seed_fidane",
  kimike: "bb_seed_kimike",
  organike: "bb_seed_organike",
  pesticide: "bb_seed_pesticide",
};

export const BB_SEED_SEARCH: Record<BbSeedKey, string> = {
  dritherash: "Farëra Drithërash",
  perimesh: "Farëra Perimesh Bimësh",
  fidane: "Fidane Pemësh Perimesh",
  kimike: "Plehra Kimike NPK",
  organike: "Plehra Organike",
  pesticide: "Pesticide Herbicide Fungicide",
};

export const BB_CONDITION_KEYS = ["new", "used"] as const;
export type BbConditionKey = (typeof BB_CONDITION_KEYS)[number];

export const BB_CONDITION_LABEL_KEY: Record<BbConditionKey, string> = {
  new: "bb_cond_new",
  used: "bb_cond_used",
};

export const BB_CONDITION_SEARCH: Record<BbConditionKey, string> = {
  new: "E re",
  used: "E përdorur",
};

export const BB_QTY_UNIT_KEYS = ["kg", "tone", "cope"] as const;
export type BbQtyUnitKey = (typeof BB_QTY_UNIT_KEYS)[number];

export const BB_QTY_UNIT_LABEL_KEY: Record<BbQtyUnitKey, string> = {
  kg: "bb_unit_kg",
  tone: "bb_unit_tone",
  cope: "bb_unit_cope",
};

export const BB_QTY_UNIT_SEARCH: Record<BbQtyUnitKey, string> = {
  kg: "Kg",
  tone: "Tonë",
  cope: "Copë",
};

export {
  LOKALE_ZYRE_CITY_KEYS as BB_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY as BB_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH as BB_CITY_SEARCH,
  type LokaleCityKey as BbCityKey,
} from "@/lib/lokale-zyre-search-helpers";

export type BujqesiBlegtoriCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getBujqesiBlegtoriLeafCategoryIds(
  categories: BujqesiBlegtoriCategoryRow[],
  hubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === hubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("bujq-type-"),
    )
    .map((c) => c.id);
}

export function resolveBujqesiBlegtoriTypeCategoryId(
  categories: BujqesiBlegtoriCategoryRow[],
  hubId: number,
  typeKey: BbTypeKey,
): number | undefined {
  const slug = BB_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
