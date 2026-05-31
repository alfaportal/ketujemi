/** Mobilje & Dekorime hub slug (matches seeded category). */
export const MOBILJE_DEKORIM_HUB_SLUG = "mobilje-dekorime";

export const MOBILJE_DEKORIM_HERO_PHOTO =
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const MD_TYPE_KEYS = [
  "sallone_ulese",
  "dhoma_gjumit",
  "ndricim",
  "kuzhina",
  "kopsht_terasa",
  "tepihe_perde",
] as const;

export type MdTypeKey = (typeof MD_TYPE_KEYS)[number];

export const MD_TYPE_DB_SLUG: Record<MdTypeKey, string> = {
  sallone_ulese: "mobilje-type-sallone-ulese",
  dhoma_gjumit: "mobilje-type-dhoma-gjumit",
  ndricim: "mobilje-type-ndricim",
  kuzhina: "mobilje-type-kuzhina",
  kopsht_terasa: "mobilje-type-kopsht-terasa",
  tepihe_perde: "mobilje-type-tepihe-perde",
};

/** Nivel 1 — miniaturat në grid të hub-it. Mos vendos këtu URL Unsplash të banner-it (nivel 2 → `category-pexels-urls.ts`). */
export const MD_TYPE_PHOTOS: Record<MdTypeKey, string> = {
  sallone_ulese:
    "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
  dhoma_gjumit:
    "https://images.pexels.com/photos/36676787/pexels-photo-36676787.jpeg?auto=compress&cs=tinysrgb&w=400",
  ndricim:
    "https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=400",
  kuzhina:
    "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400",
  kopsht_terasa:
    "https://images.pexels.com/photos/27975920/pexels-photo-27975920.jpeg?auto=compress&cs=tinysrgb&w=400",
  tepihe_perde:
    "https://images.pexels.com/photos/28379851/pexels-photo-28379851.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const MD_TYPE_LABEL_KEY: Record<MdTypeKey, string> = {
  sallone_ulese: "md_type_sallone",
  dhoma_gjumit: "md_type_dhoma",
  ndricim: "md_type_ndricim",
  kuzhina: "md_type_kuzhina",
  kopsht_terasa: "md_type_kopsht",
  tepihe_perde: "md_type_tepihe",
};

export const MD_SAL_TYPE_KEYS = ["kendor", "trosjed", "divan", "relaks", "tabure"] as const;
export type MdSalTypeKey = (typeof MD_SAL_TYPE_KEYS)[number];

export const MD_SAL_TYPE_LABEL_KEY: Record<MdSalTypeKey, string> = {
  kendor: "md_sal_kendor",
  trosjed: "md_sal_trosjed",
  divan: "md_sal_divan",
  relaks: "md_sal_relaks",
  tabure: "md_sal_tabure",
};

export const MD_SAL_TYPE_SEARCH: Record<MdSalTypeKey, string> = {
  kendor: "Set Këndor",
  trosjed: "Trosjed Dvosed",
  divan: "Divan Kauç",
  relaks: "Fotelja Relaksi",
  tabure: "Tabure",
};

export const MD_SAL_MAT_KEYS = ["stof", "leather_nat", "leather_eko", "plush"] as const;
export type MdSalMatKey = (typeof MD_SAL_MAT_KEYS)[number];

export const MD_SAL_MAT_LABEL_KEY: Record<MdSalMatKey, string> = {
  stof: "md_mat_stof",
  leather_nat: "md_mat_leather_nat",
  leather_eko: "md_mat_leather_eko",
  plush: "md_mat_plush",
};

export const MD_SAL_MAT_SEARCH: Record<MdSalMatKey, string> = {
  stof: "Stof",
  leather_nat: "Lëkurë Natyrale",
  leather_eko: "Lëkurë Eko",
  plush: "Pllush",
};

export const MD_SAL_CAP_KEYS = ["1", "2", "3", "5p"] as const;
export type MdSalCapKey = (typeof MD_SAL_CAP_KEYS)[number];

export const MD_SAL_CAP_LABEL_KEY: Record<MdSalCapKey, string> = {
  "1": "md_cap_1",
  "2": "md_cap_2",
  "3": "md_cap_3",
  "5p": "md_cap_5p",
};

export const MD_SAL_CAP_SEARCH: Record<MdSalCapKey, string> = {
  "1": "1 vend",
  "2": "2 vende",
  "3": "3 vende",
  "5p": "5+ vende",
};

export const MD_SAL_FEATURE_KEYS = ["sleep", "storage"] as const;
export type MdSalFeatureKey = (typeof MD_SAL_FEATURE_KEYS)[number];

export const MD_SAL_FEATURE_LABEL_KEY: Record<MdSalFeatureKey, string> = {
  sleep: "md_sal_sleep",
  storage: "md_sal_storage",
};

export const MD_SAL_FEATURE_SEARCH: Record<MdSalFeatureKey, string> = {
  sleep: "Hapet për fjetje",
  storage: "Hapësirë depo",
};

export const MD_BED_TYPE_KEYS = ["shtreter", "dollape", "komoda", "dysheke", "set"] as const;
export type MdBedTypeKey = (typeof MD_BED_TYPE_KEYS)[number];

export const MD_BED_TYPE_LABEL_KEY: Record<MdBedTypeKey, string> = {
  shtreter: "md_bed_shtreter",
  dollape: "md_bed_dollape",
  komoda: "md_bed_komoda",
  dysheke: "md_bed_dysheke",
  set: "md_bed_set",
};

export const MD_BED_TYPE_SEARCH: Record<MdBedTypeKey, string> = {
  shtreter: "Shtretër",
  dollape: "Dollapë Garderobë",
  komoda: "Komoda",
  dysheke: "Dyshekë",
  set: "Set i plotë",
};

export const MD_BED_SIZE_KEYS = ["90x200", "140x200", "160x200", "180x200"] as const;
export type MdBedSizeKey = (typeof MD_BED_SIZE_KEYS)[number];

export const MD_BED_SIZE_LABEL_KEY: Record<MdBedSizeKey, string> = {
  "90x200": "md_size_90",
  "140x200": "md_size_140",
  "160x200": "md_size_160",
  "180x200": "md_size_180",
};

export const MD_BED_SIZE_SEARCH: Record<MdBedSizeKey, string> = {
  "90x200": "90x200",
  "140x200": "140x200",
  "160x200": "160x200",
  "180x200": "180x200",
};

export const MD_LIGHT_TYPE_KEYS = [
  "lustra",
  "abazhur",
  "muri",
  "led_strip",
  "outdoor",
] as const;
export type MdLightTypeKey = (typeof MD_LIGHT_TYPE_KEYS)[number];

export const MD_LIGHT_TYPE_LABEL_KEY: Record<MdLightTypeKey, string> = {
  lustra: "md_light_lustra",
  abazhur: "md_light_abazhur",
  muri: "md_light_muri",
  led_strip: "md_light_led",
  outdoor: "md_light_outdoor",
};

export const MD_LIGHT_TYPE_SEARCH: Record<MdLightTypeKey, string> = {
  lustra: "Lustra Chandelier",
  abazhur: "Abazhurë",
  muri: "Llampë Muri",
  led_strip: "LED Shirit",
  outdoor: "Ndriçim i Jashtëm",
};

export const MD_LIGHT_TECH_KEYS = ["led", "standard", "smart"] as const;
export type MdLightTechKey = (typeof MD_LIGHT_TECH_KEYS)[number];

export const MD_LIGHT_TECH_LABEL_KEY: Record<MdLightTechKey, string> = {
  led: "md_tech_led",
  standard: "md_tech_standard",
  smart: "md_tech_smart",
};

export const MD_LIGHT_TECH_SEARCH: Record<MdLightTechKey, string> = {
  led: "LED",
  standard: "Llambë Standarde",
  smart: "Smart",
};

export const MD_KITCHEN_TYPE_KEYS = ["kompletuar", "tavolina", "karrige", "banake"] as const;
export type MdKitchenTypeKey = (typeof MD_KITCHEN_TYPE_KEYS)[number];

export const MD_KITCHEN_TYPE_LABEL_KEY: Record<MdKitchenTypeKey, string> = {
  kompletuar: "md_kit_kompletuar",
  tavolina: "md_kit_tavolina",
  karrige: "md_kit_karrige",
  banake: "md_kit_banake",
};

export const MD_KITCHEN_TYPE_SEARCH: Record<MdKitchenTypeKey, string> = {
  kompletuar: "Kuzhinë e Kompletuar",
  tavolina: "Tavolina Tryezarie",
  karrige: "Karrige Kuzhine",
  banake: "Banakë Ishuj",
};

export const MD_KITCHEN_MAT_KEYS = ["dru", "mdf", "iverice", "metal_qelq"] as const;
export type MdKitchenMatKey = (typeof MD_KITCHEN_MAT_KEYS)[number];

export const MD_KITCHEN_MAT_LABEL_KEY: Record<MdKitchenMatKey, string> = {
  dru: "md_mat_dru",
  mdf: "md_mat_mdf",
  iverice: "md_mat_iverice",
  metal_qelq: "md_mat_metal",
};

export const MD_KITCHEN_MAT_SEARCH: Record<MdKitchenMatKey, string> = {
  dru: "Dru Masiv",
  mdf: "MDF",
  iverice: "Ivericë",
  metal_qelq: "Metal Qelq",
};

export const MD_GARDEN_TYPE_KEYS = ["sete", "plazh", "kolovajza", "saksi"] as const;
export type MdGardenTypeKey = (typeof MD_GARDEN_TYPE_KEYS)[number];

export const MD_GARDEN_TYPE_LABEL_KEY: Record<MdGardenTypeKey, string> = {
  sete: "md_gar_sete",
  plazh: "md_gar_plazh",
  kolovajza: "md_gar_kolovajza",
  saksi: "md_gar_saksi",
};

export const MD_GARDEN_TYPE_SEARCH: Record<MdGardenTypeKey, string> = {
  sete: "Sete Kopshti",
  plazh: "Shtretër Plazhi",
  kolovajza: "Kolovajza",
  saksi: "Saksi Dekorime",
};

export const MD_GARDEN_MAT_KEYS = [
  "ratan_syn",
  "ratan_nat",
  "plastike",
  "metal_alu",
  "dru",
] as const;
export type MdGardenMatKey = (typeof MD_GARDEN_MAT_KEYS)[number];

export const MD_GARDEN_MAT_LABEL_KEY: Record<MdGardenMatKey, string> = {
  ratan_syn: "md_gmat_ratan_syn",
  ratan_nat: "md_gmat_ratan_nat",
  plastike: "md_gmat_plastike",
  metal_alu: "md_gmat_metal",
  dru: "md_gmat_dru",
};

export const MD_GARDEN_MAT_SEARCH: Record<MdGardenMatKey, string> = {
  ratan_syn: "Ratan Sintetik",
  ratan_nat: "Ratan Natyral",
  plastike: "Plastikë",
  metal_alu: "Metal Alumini",
  dru: "Dru i trajtuar",
};

export const MD_RUG_TYPE_KEYS = ["tepih", "rugica", "perde_std", "perde_zebra"] as const;
export type MdRugTypeKey = (typeof MD_RUG_TYPE_KEYS)[number];

export const MD_RUG_TYPE_LABEL_KEY: Record<MdRugTypeKey, string> = {
  tepih: "md_rug_tepih",
  rugica: "md_rug_rugica",
  perde_std: "md_rug_perde",
  perde_zebra: "md_rug_zebra",
};

export const MD_RUG_TYPE_SEARCH: Record<MdRugTypeKey, string> = {
  tepih: "Tepihë Qilima",
  rugica: "Rrugica Staza",
  perde_std: "Perde Standarde",
  perde_zebra: "Perde Zebra Rolo",
};

export const MD_CONDITION_KEYS = ["new", "used"] as const;
export type MdConditionKey = (typeof MD_CONDITION_KEYS)[number];

export const MD_CONDITION_LABEL_KEY: Record<MdConditionKey, string> = {
  new: "md_cond_new",
  used: "md_cond_used",
};

export const MD_CONDITION_SEARCH: Record<MdConditionKey, string> = {
  new: "I ri Nga salloni",
  used: "I përdorur",
};

export {
  LOKALE_ZYRE_CITY_KEYS as MD_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY as MD_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH as MD_CITY_SEARCH,
  type LokaleCityKey as MdCityKey,
} from "@/lib/lokale-zyre-search-helpers";

export type MobiljeDekorimCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getMobiljeDekorimLeafCategoryIds(
  categories: MobiljeDekorimCategoryRow[],
  hubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === hubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("mobilje-type-"),
    )
    .map((c) => c.id);
}

export function resolveMobiljeTypeCategoryId(
  categories: MobiljeDekorimCategoryRow[],
  hubId: number,
  typeKey: MdTypeKey,
): number | undefined {
  const slug = MD_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
