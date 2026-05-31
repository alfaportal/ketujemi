/** Rroba & Këpucë hub slug (matches seeded category). */
export const RROBA_KEPUCE_HUB_SLUG = "rroba-kepuce";

export const RROBA_KEPUCE_HERO_PHOTO =
  "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const RK_TYPE_KEYS = ["meshkuj", "femra", "aksesore", "kepuce"] as const;
export type RkTypeKey = (typeof RK_TYPE_KEYS)[number];

export const RK_TYPE_DB_SLUG: Record<RkTypeKey, string> = {
  meshkuj: "rroba-type-veshje-meshkuj",
  femra: "rroba-type-veshje-femra",
  aksesore: "rroba-type-aksesore",
  kepuce: "rroba-type-kepuce",
};

export const RK_TYPE_PHOTOS: Record<RkTypeKey, string> = {
  meshkuj:
    "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400",
  femra:
    "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400",
  aksesore:
    "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400",
  kepuce:
    "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const RK_TYPE_LABEL_KEY: Record<RkTypeKey, string> = {
  meshkuj: "rk_type_meshkuj",
  femra: "rk_type_femra",
  aksesore: "rk_type_aksesore",
  kepuce: "rk_type_kepuce",
};

export const RK_MEN_TYPE_KEYS = [
  "jakne",
  "kemisha",
  "tshirt",
  "xhemper",
  "pantallona",
  "kostume",
  "sportive",
  "brendshme",
  "ceremoniale",
] as const;
export type RkMenTypeKey = (typeof RK_MEN_TYPE_KEYS)[number];

export const RK_MEN_TYPE_LABEL_KEY: Record<RkMenTypeKey, string> = {
  jakne: "rk_men_jakne",
  kemisha: "rk_men_kemisha",
  tshirt: "rk_men_tshirt",
  xhemper: "rk_men_xhemper",
  pantallona: "rk_men_pantallona",
  kostume: "rk_men_kostume",
  sportive: "rk_men_sportive",
  brendshme: "rk_men_brendshme",
  ceremoniale: "rk_men_ceremoniale",
};

export const RK_MEN_DB_SLUG: Record<RkMenTypeKey, string> = {
  jakne: "rroba-leaf-m-jakne-pallto",
  kemisha: "rroba-leaf-m-kemisha",
  tshirt: "rroba-leaf-m-tshirt-maica",
  xhemper: "rroba-leaf-m-xhemper-duks",
  pantallona: "rroba-leaf-m-pantallona-xhins",
  kostume: "rroba-leaf-m-kostume-sako",
  sportive: "rroba-leaf-m-sportive",
  brendshme: "rroba-leaf-m-te-brendshme",
  ceremoniale: "rroba-leaf-m-ceremoniale",
};

export const RK_MEN_TYPE_SEARCH: Record<RkMenTypeKey, string> = {
  jakne: "Jakne Pallto",
  kemisha: "Këmisha",
  tshirt: "T-Shirt Maica",
  xhemper: "Xhemperë Duksë",
  pantallona: "Pantallona Xhins",
  kostume: "Kostume Sako",
  sportive: "Rroba Sportive",
  brendshme: "Të brendshme Piçama",
  ceremoniale: "Veshje Ceremoniale",
};

export const RK_MEN_SIZE_KEYS = [
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "3xl",
  "30",
  "32",
  "34",
  "36",
] as const;
export type RkMenSizeKey = (typeof RK_MEN_SIZE_KEYS)[number];

export const RK_MEN_SIZE_LABEL_KEY: Record<RkMenSizeKey, string> = {
  s: "rk_size_s",
  m: "rk_size_m",
  l: "rk_size_l",
  xl: "rk_size_xl",
  xxl: "rk_size_xxl",
  "3xl": "rk_size_3xl",
  "30": "rk_size_30",
  "32": "rk_size_32",
  "34": "rk_size_34",
  "36": "rk_size_36",
};

export const RK_WOMEN_TYPE_KEYS = [
  "fustane",
  "jakne",
  "bluta",
  "tshirt",
  "dukse",
  "pantallona",
  "kostume",
  "sportive",
  "banjo",
  "brendshme",
  "shtatzena",
  "festive",
] as const;
export type RkWomenTypeKey = (typeof RK_WOMEN_TYPE_KEYS)[number];

export const RK_WOMEN_TYPE_LABEL_KEY: Record<RkWomenTypeKey, string> = {
  fustane: "rk_wom_fustane",
  jakne: "rk_wom_jakne",
  bluta: "rk_wom_bluta",
  tshirt: "rk_wom_tshirt",
  dukse: "rk_wom_dukse",
  pantallona: "rk_wom_pantallona",
  kostume: "rk_wom_kostume",
  sportive: "rk_wom_sportive",
  banjo: "rk_wom_banjo",
  brendshme: "rk_wom_brendshme",
  shtatzena: "rk_wom_shtatzena",
  festive: "rk_wom_festive",
};

export const RK_WOMEN_DB_SLUG: Record<RkWomenTypeKey, string> = {
  fustane: "rroba-leaf-f-fustane-funde",
  jakne: "rroba-leaf-f-jakne-gezof",
  bluta: "rroba-leaf-f-bluza-kemisha",
  tshirt: "rroba-leaf-f-tshirt-topa",
  dukse: "rroba-leaf-f-duks-xhemper",
  pantallona: "rroba-leaf-f-pantallona-xhins",
  kostume: "rroba-leaf-f-kostume-sako",
  sportive: "rroba-leaf-f-sportive",
  banjo: "rroba-leaf-f-banjo-bikini",
  brendshme: "rroba-leaf-f-te-brendshme-gjumi",
  shtatzena: "rroba-leaf-f-shtatzena",
  festive: "rroba-leaf-f-festive",
};

export const RK_WOMEN_TYPE_SEARCH: Record<RkWomenTypeKey, string> = {
  fustane: "Fustane Funde",
  jakne: "Jakne Pallto Gëzofë",
  bluta: "Bluta Këmisha",
  tshirt: "T-Shirt Topa",
  dukse: "Duksë Xhemperë",
  pantallona: "Pantallona Xhins",
  kostume: "Kostume Sako",
  sportive: "Rroba Sportive",
  banjo: "Rroba banjo Bikini",
  brendshme: "Të brendshme Gjumi",
  shtatzena: "Veshje shtatzëna",
  festive: "Veshje festive",
};

export const RK_WOMEN_SIZE_KEYS = [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
] as const;
export type RkWomenSizeKey = (typeof RK_WOMEN_SIZE_KEYS)[number];

export const RK_WOMEN_SIZE_LABEL_KEY: Record<RkWomenSizeKey, string> = {
  xs: "rk_size_xs",
  s: "rk_size_s",
  m: "rk_size_m",
  l: "rk_size_l",
  xl: "rk_size_xl",
  xxl: "rk_size_xxl",
  "34": "rk_size_34",
  "36": "rk_size_36",
  "38": "rk_size_38",
  "40": "rk_size_40",
  "42": "rk_size_42",
  "44": "rk_size_44",
};

export const RK_CLOTH_MAT_KEYS = ["pambuk", "lekure", "denim", "lesh", "sintetike"] as const;
export type RkClothMatKey = (typeof RK_CLOTH_MAT_KEYS)[number];

export const RK_CLOTH_MAT_LABEL_KEY: Record<RkClothMatKey, string> = {
  pambuk: "rk_mat_pambuk",
  lekure: "rk_mat_lekure",
  denim: "rk_mat_denim",
  lesh: "rk_mat_lesh",
  sintetike: "rk_mat_sintetike",
};

export const RK_CLOTH_MAT_SEARCH: Record<RkClothMatKey, string> = {
  pambuk: "Pambuk",
  lekure: "Lëkurë",
  denim: "Denim",
  lesh: "Lesh",
  sintetike: "Sintetikë",
};

export const RK_GENDER_KEYS = ["meshkuj", "femra", "unisex"] as const;
export type RkGenderKey = (typeof RK_GENDER_KEYS)[number];

export const RK_GENDER_LABEL_KEY: Record<RkGenderKey, string> = {
  meshkuj: "rk_gender_m",
  femra: "rk_gender_f",
  unisex: "rk_gender_u",
};

export const RK_GENDER_SEARCH: Record<RkGenderKey, string> = {
  meshkuj: "Meshkuj",
  femra: "Femra",
  unisex: "Unisex",
};

export const RK_SHOE_TYPE_KEYS = [
  "atlete",
  "elegante",
  "cizme",
  "sandale",
  "shapka",
  "sporte",
  "ortopedike",
] as const;
export type RkShoeTypeKey = (typeof RK_SHOE_TYPE_KEYS)[number];

export const RK_SHOE_TYPE_LABEL_KEY: Record<RkShoeTypeKey, string> = {
  atlete: "rk_shoe_atlete",
  elegante: "rk_shoe_elegante",
  cizme: "rk_shoe_cizme",
  sandale: "rk_shoe_sandale",
  shapka: "rk_shoe_shapka",
  sporte: "rk_shoe_sporte",
  ortopedike: "rk_shoe_ortopedike",
};

export const RK_SHOE_DB_SLUG: Record<RkShoeTypeKey, string> = {
  atlete: "rroba-leaf-k-atlete",
  elegante: "rroba-leaf-k-elegante",
  cizme: "rroba-leaf-k-cizme",
  sandale: "rroba-leaf-k-sandale",
  shapka: "rroba-leaf-k-shapka",
  sporte: "rroba-leaf-k-sporte",
  ortopedike: "rroba-leaf-k-ortopedike",
};

export const RK_SHOE_TYPE_SEARCH: Record<RkShoeTypeKey, string> = {
  atlete: "Atlete",
  elegante: "Këpucë Elegante",
  cizme: "Çizme",
  sandale: "Sandale Papuçe",
  shapka: "Shapka Shtëpiake",
  sporte: "Këpucë sporte specifike",
  ortopedike: "Këpucë ortopedike",
};

export const RK_SHOE_SIZE_KEYS = [
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
] as const;
export type RkShoeSizeKey = (typeof RK_SHOE_SIZE_KEYS)[number];

export const RK_SHOE_SIZE_LABEL_KEY: Record<RkShoeSizeKey, string> = {
  "35": "rk_shoe_35",
  "36": "rk_shoe_36",
  "37": "rk_shoe_37",
  "38": "rk_shoe_38",
  "39": "rk_shoe_39",
  "40": "rk_shoe_40",
  "41": "rk_shoe_41",
  "42": "rk_shoe_42",
  "43": "rk_shoe_43",
  "44": "rk_shoe_44",
  "45": "rk_shoe_45",
  "46": "rk_shoe_46",
  "47": "rk_shoe_47",
  "48": "rk_shoe_48",
};

export const RK_SHOE_MAT_KEYS = ["leather_nat", "leather_eko", "tekstil", "gome"] as const;
export type RkShoeMatKey = (typeof RK_SHOE_MAT_KEYS)[number];

export const RK_SHOE_MAT_LABEL_KEY: Record<RkShoeMatKey, string> = {
  leather_nat: "rk_shmat_leather_nat",
  leather_eko: "rk_shmat_leather_eko",
  tekstil: "rk_shmat_tekstil",
  gome: "rk_shmat_gome",
};

export const RK_SHOE_MAT_SEARCH: Record<RkShoeMatKey, string> = {
  leather_nat: "Lëkurë Natyrale",
  leather_eko: "Lëkurë Eko",
  tekstil: "Tekstil",
  gome: "Gomë",
};

export const RK_ACC_TYPE_KEYS = [
  "canta_dore",
  "canta_shpine",
  "portofol",
  "ora",
  "syze",
  "bizhuteri",
  "ripe",
  "kapele",
] as const;
export type RkAccTypeKey = (typeof RK_ACC_TYPE_KEYS)[number];

export const RK_ACC_TYPE_LABEL_KEY: Record<RkAccTypeKey, string> = {
  canta_dore: "rk_acc_canta_dore",
  canta_shpine: "rk_acc_canta_shpine",
  portofol: "rk_acc_portofol",
  ora: "rk_acc_ora",
  syze: "rk_acc_syze",
  bizhuteri: "rk_acc_bizhuteri",
  ripe: "rk_acc_ripe",
  kapele: "rk_acc_kapele",
};

export const RK_ACC_DB_SLUG: Record<RkAccTypeKey, string> = {
  canta_dore: "rroba-leaf-a-canta-dore",
  canta_shpine: "rroba-leaf-a-canta-shpine",
  portofol: "rroba-leaf-a-portofola",
  ora: "rroba-leaf-a-ore-dore",
  syze: "rroba-leaf-a-syze",
  bizhuteri: "rroba-leaf-a-bizhuteri",
  ripe: "rroba-leaf-a-rripa",
  kapele: "rroba-leaf-a-kapele",
};

export const RK_ACC_TYPE_SEARCH: Record<RkAccTypeKey, string> = {
  canta_dore: "Çanta dore",
  canta_shpine: "Çanta shpine",
  portofol: "Portofola",
  ora: "Ora Dore",
  syze: "Syze Dielli",
  bizhuteri: "Bizhuteri Ari",
  ripe: "Rripa Breza",
  kapele: "Kapele Shalle",
};

export const RK_KID_GENDER_KEYS = ["djem", "vajza", "unisex"] as const;
export type RkKidGenderKey = (typeof RK_KID_GENDER_KEYS)[number];

export const RK_KID_GENDER_LABEL_KEY: Record<RkKidGenderKey, string> = {
  djem: "rk_kid_djem",
  vajza: "rk_kid_vajza",
  unisex: "rk_gender_u",
};

export const RK_KID_GENDER_SEARCH: Record<RkKidGenderKey, string> = {
  djem: "Për djem",
  vajza: "Për vajza",
  unisex: "Unisex",
};

export const RK_KID_AGE_GROUPS = [
  {
    groupKey: "foshnje",
    labelKey: "rk_age_foshnje",
    sizeKeys: ["56", "62", "68", "74", "80", "86", "92"] as const,
  },
  {
    groupKey: "vegjel",
    labelKey: "rk_age_vegjel",
    sizeKeys: ["98", "104", "110", "116"] as const,
  },
  {
    groupKey: "rritur",
    labelKey: "rk_age_rritur",
    sizeKeys: ["122", "128", "140", "152", "164"] as const,
  },
] as const;

export type RkKidSizeKey =
  | (typeof RK_KID_AGE_GROUPS)[number]["sizeKeys"][number];

export const RK_KID_TYPE_KEYS = ["komplet", "kepuce_patika", "aksesore"] as const;
export type RkKidTypeKey = (typeof RK_KID_TYPE_KEYS)[number];

export const RK_KID_TYPE_LABEL_KEY: Record<RkKidTypeKey, string> = {
  komplet: "rk_kid_komplet",
  kepuce_patika: "rk_kid_kepuce",
  aksesore: "rk_kid_aksesore",
};

export const RK_KID_TYPE_SEARCH: Record<RkKidTypeKey, string> = {
  komplet: "Rroba komplet",
  kepuce_patika: "Këpucë Patika",
  aksesore: "Aksesorë",
};

export const RK_CONDITION_KEYS = ["new", "used"] as const;
export type RkConditionKey = (typeof RK_CONDITION_KEYS)[number];

export const RK_CONDITION_LABEL_KEY: Record<RkConditionKey, string> = {
  new: "rk_cond_new",
  used: "rk_cond_used",
};

export const RK_CONDITION_SEARCH: Record<RkConditionKey, string> = {
  new: "E re Me etiketë",
  used: "E përdorur Second hand",
};

export const RK_UNIVERSAL_CHECK_KEYS = ["exchange", "shipping", "pickup"] as const;
export type RkUniversalCheckKey = (typeof RK_UNIVERSAL_CHECK_KEYS)[number];

export const RK_UNIVERSAL_CHECK_LABEL_KEY: Record<RkUniversalCheckKey, string> = {
  exchange: "rk_chk_exchange",
  shipping: "rk_chk_shipping",
  pickup: "rk_chk_pickup",
};

export const RK_UNIVERSAL_CHECK_SEARCH: Record<RkUniversalCheckKey, string> = {
  exchange: "Ndërrohet",
  shipping: "Dërgimi me postë",
  pickup: "Marrje personale",
};

export {
  LOKALE_ZYRE_CITY_KEYS as RK_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY as RK_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH as RK_CITY_SEARCH,
  type LokaleCityKey as RkCityKey,
} from "@/lib/lokale-zyre-search-helpers";

export type RrobaKepuceCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getRrobaKepuceLeafCategoryIds(
  categories: RrobaKepuceCategoryRow[],
  hubId: number,
): number[] {
  const hub = Number(hubId);
  const typeRows = categories.filter(
    (c) =>
      Number(c.parent_id) === hub &&
      typeof c.slug === "string" &&
      (c.slug as string).startsWith("rroba-type-") &&
      (c.slug as string) !== "rroba-type-veshje-femije",
  );
  const typeIds = typeRows.map((c) => c.id);
  const typeIdSet = new Set(typeIds);
  const leafIds = categories
    .filter(
      (c) =>
        c.parent_id != null &&
        typeIdSet.has(Number(c.parent_id)) &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("rroba-leaf-"),
    )
    .map((c) => c.id);
  return [...new Set([...typeIds, ...leafIds])];
}

export function getRrobaTypeLeafCategoryIds(
  categories: RrobaKepuceCategoryRow[],
  hubId: number,
  typeKey: RkTypeKey,
): number[] {
  const typeId = resolveRrobaTypeCategoryId(categories, hubId, typeKey);
  if (!typeId) return [];
  return categories
    .filter(
      (c) =>
        Number(c.parent_id) === typeId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("rroba-leaf-"),
    )
    .map((c) => c.id);
}

export function resolveRrobaLeafCategoryIdBySlug(
  categories: RrobaKepuceCategoryRow[],
  slug: string,
): number | undefined {
  return categories.find((c) => c.slug === slug)?.id;
}

export function resolveRrobaTypeCategoryId(
  categories: RrobaKepuceCategoryRow[],
  hubId: number,
  typeKey: RkTypeKey,
): number | undefined {
  const slug = RK_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
