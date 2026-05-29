import { FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG } from "./femije-hub-subcategory-photos";
import { FEMIJE_LEAF_PARENT_GROUP_SLUG } from "./femije-subcategory-guides";

function isUsableCategoryImageUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Fëmijë hub slug (matches seeded category). */
export const FEMIJE_HUB_SLUG = "femije";

export const FEMIJE_HERO_PHOTO =
  "https://images.pexels.com/photos/35537/child-children-girl-happy.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const FJ_TYPE_KEYS = [
  "karroca",
  "foshnje",
  "ushqim_higjiene",
  "lodra",
  "rroba",
] as const;

export type FjTypeKey = (typeof FJ_TYPE_KEYS)[number];

export const FJ_TYPE_DB_SLUG: Record<FjTypeKey, string> = {
  karroca: "femije-type-karroca",
  foshnje: "femije-type-foshnje",
  ushqim_higjiene: "femije-type-ushqim-higjiene",
  lodra: "femije-type-lodra",
  rroba: "femije-type-rroba",
};

export const FJ_TYPE_PHOTOS: Record<FjTypeKey, string> = {
  karroca:
    "https://images.pexels.com/photos/8924170/pexels-photo-8924170.jpeg?auto=compress&cs=tinysrgb&w=400",
  foshnje:
    "https://images.pexels.com/photos/6582167/pexels-photo-6582167.jpeg?auto=compress&cs=tinysrgb&w=400",
  ushqim_higjiene:
    "https://images.pexels.com/photos/1640767/pexels-photo-1640767.jpeg?auto=compress&cs=tinysrgb&w=400",
  lodra:
    "https://images.pexels.com/photos/7296631/pexels-photo-7296631.jpeg?auto=compress&cs=tinysrgb&w=400",
  rroba:
    "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const FJ_TYPE_LABEL_KEY: Record<FjTypeKey, string> = {
  karroca: "fj_type_karroca",
  foshnje: "fj_type_foshnje",
  ushqim_higjiene: "fj_type_ushqim",
  lodra: "fj_type_lodra",
  rroba: "fj_type_rroba",
};

export const FJ_STROLLER_TYPE_KEYS = [
  "standarde",
  "2in1",
  "3in1",
  "sportive",
  "binjake",
] as const;
export type FjStrollerTypeKey = (typeof FJ_STROLLER_TYPE_KEYS)[number];

export const FJ_STROLLER_TYPE_LABEL_KEY: Record<FjStrollerTypeKey, string> = {
  standarde: "fj_strol_standar",
  "2in1": "fj_strol_2in1",
  "3in1": "fj_strol_3in1",
  sportive: "fj_strol_sport",
  binjake: "fj_strol_binjake",
};

export const FJ_STROLLER_TYPE_SEARCH: Record<FjStrollerTypeKey, string> = {
  standarde: "Karrocë Standarde",
  "2in1": "Karrocë 2 në 1",
  "3in1": "Karrocë 3 në 1",
  sportive: "Karrocë Sportive",
  binjake: "Karrocë Binjakë",
};

export const FJ_STROLLER_BRAND_KEYS = [
  "chicco",
  "cybex",
  "stokke",
  "peg_perego",
  "kinderkraft",
  "lorelli",
  "bebe_confort",
] as const;
export type FjStrollerBrandKey = (typeof FJ_STROLLER_BRAND_KEYS)[number];

export const FJ_STROLLER_BRAND_LABEL_KEY: Record<FjStrollerBrandKey, string> = {
  chicco: "fj_brand_chicco",
  cybex: "fj_brand_cybex",
  stokke: "fj_brand_stokke",
  peg_perego: "fj_brand_peg",
  kinderkraft: "fj_brand_kinderkraft",
  lorelli: "fj_brand_lorelli",
  bebe_confort: "fj_brand_bebe",
};

export const FJ_STROLLER_BRAND_SEARCH: Record<FjStrollerBrandKey, string> = {
  chicco: "Chicco",
  cybex: "Cybex",
  stokke: "Stokke",
  peg_perego: "Peg Perego",
  kinderkraft: "Kinderkraft",
  lorelli: "Lorelli",
  bebe_confort: "Bebe Confort",
};

export const FJ_STROLLER_FEATURE_KEYS = [
  "cante",
  "rain",
  "mosquito",
  "winter",
] as const;
export type FjStrollerFeatureKey = (typeof FJ_STROLLER_FEATURE_KEYS)[number];

export const FJ_STROLLER_FEATURE_LABEL_KEY: Record<FjStrollerFeatureKey, string> = {
  cante: "fj_strol_cante",
  rain: "fj_strol_rain",
  mosquito: "fj_strol_mosquito",
  winter: "fj_strol_winter",
};

export const FJ_STROLLER_FEATURE_SEARCH: Record<FjStrollerFeatureKey, string> = {
  cante: "Çantë karroce",
  rain: "Mbrojtëse shiu",
  mosquito: "Rrjetë mushkonjash",
  winter: "Mbulesë dimërore",
};

export const FJ_BABY_TYPE_KEYS = [
  "car_seat",
  "crib",
  "high_chair",
  "bouncer",
  "swing",
  "kangaroo",
] as const;
export type FjBabyTypeKey = (typeof FJ_BABY_TYPE_KEYS)[number];

export const FJ_BABY_TYPE_LABEL_KEY: Record<FjBabyTypeKey, string> = {
  car_seat: "fj_baby_carseat",
  crib: "fj_baby_crib",
  high_chair: "fj_baby_chair",
  bouncer: "fj_baby_bouncer",
  swing: "fj_baby_swing",
  kangaroo: "fj_baby_kangaroo",
};

export const FJ_BABY_TYPE_SEARCH: Record<FjBabyTypeKey, string> = {
  car_seat: "Ulëse Makinë",
  crib: "Krevate Djepa",
  high_chair: "Karrige Ushqim",
  bouncer: "Relaksator Dridhlore",
  swing: "Rrethe Gjimnastikë",
  kangaroo: "Kangur Çantë",
};

export const FJ_WEIGHT_KEYS = ["w_0_13", "w_9_18", "w_15_36"] as const;
export type FjWeightKey = (typeof FJ_WEIGHT_KEYS)[number];

export const FJ_WEIGHT_LABEL_KEY: Record<FjWeightKey, string> = {
  w_0_13: "fj_weight_0_13",
  w_9_18: "fj_weight_9_18",
  w_15_36: "fj_weight_15_36",
};

export const FJ_WEIGHT_SEARCH: Record<FjWeightKey, string> = {
  w_0_13: "0-13kg",
  w_9_18: "9-18kg",
  w_15_36: "15-36kg",
};

export const FJ_INSTALL_KEYS = ["isofix", "belts"] as const;
export type FjInstallKey = (typeof FJ_INSTALL_KEYS)[number];

export const FJ_INSTALL_LABEL_KEY: Record<FjInstallKey, string> = {
  isofix: "fj_install_isofix",
  belts: "fj_install_belts",
};

export const FJ_INSTALL_SEARCH: Record<FjInstallKey, string> = {
  isofix: "Isofix",
  belts: "Rripa makine",
};

export const FJ_FOOD_TYPE_KEYS = [
  "feeding",
  "monitor",
  "bath",
  "sanitary",
  "cosmetic",
] as const;
export type FjFoodTypeKey = (typeof FJ_FOOD_TYPE_KEYS)[number];

export const FJ_FOOD_TYPE_LABEL_KEY: Record<FjFoodTypeKey, string> = {
  feeding: "fj_food_feeding",
  monitor: "fj_food_monitor",
  bath: "fj_food_bath",
  sanitary: "fj_food_sanitary",
  cosmetic: "fj_food_cosmetic",
};

export const FJ_FOOD_TYPE_SEARCH: Record<FjFoodTypeKey, string> = {
  feeding: "Pajisje Ushqimi",
  monitor: "Monitor Bebe",
  bath: "Banjot Vaskë",
  sanitary: "Produkte Sanitare",
  cosmetic: "Kozmetikë Bebe",
};

export const FJ_FOOD_ITEM_KEYS = [
  "bottle",
  "pump",
  "sterilizer",
  "babyphone",
  "bath_tub",
  "changing_mat",
] as const;
export type FjFoodItemKey = (typeof FJ_FOOD_ITEM_KEYS)[number];

export const FJ_FOOD_ITEM_LABEL_KEY: Record<FjFoodItemKey, string> = {
  bottle: "fj_item_bottle",
  pump: "fj_item_pump",
  sterilizer: "fj_item_sterilizer",
  babyphone: "fj_item_babyphone",
  bath_tub: "fj_item_bath",
  changing_mat: "fj_item_mat",
};

export const FJ_FOOD_ITEM_SEARCH: Record<FjFoodItemKey, string> = {
  bottle: "Shishe",
  pump: "Pompë gjiri",
  sterilizer: "Sterilizator",
  babyphone: "Babyphone",
  bath_tub: "Vaskë larje",
  changing_mat: "Tepihë ndërrimi",
};

export const FJ_TOY_TYPE_KEYS = [
  "baby",
  "educational",
  "battery",
  "outdoor",
  "bikes",
  "dolls",
] as const;
export type FjToyTypeKey = (typeof FJ_TOY_TYPE_KEYS)[number];

export const FJ_TOY_TYPE_LABEL_KEY: Record<FjToyTypeKey, string> = {
  baby: "fj_toy_baby",
  educational: "fj_toy_edu",
  battery: "fj_toy_battery",
  outdoor: "fj_toy_outdoor",
  bikes: "fj_toy_bikes",
  dolls: "fj_toy_dolls",
};

export const FJ_TOY_TYPE_SEARCH: Record<FjToyTypeKey, string> = {
  baby: "Lodra Foshnje",
  educational: "Lodra Eduktive Puzzle",
  battery: "Lodra me Bateri",
  outdoor: "Lodra Jashtë",
  bikes: "Biçikleta Trotinetë",
  dolls: "Kukulla Pellush",
};

export const FJ_TOY_AGE_KEYS = ["0_1", "1_3", "3_6", "6_12", "12p"] as const;
export type FjToyAgeKey = (typeof FJ_TOY_AGE_KEYS)[number];

export const FJ_TOY_AGE_LABEL_KEY: Record<FjToyAgeKey, string> = {
  "0_1": "fj_age_0_1",
  "1_3": "fj_age_1_3",
  "3_6": "fj_age_3_6",
  "6_12": "fj_age_6_12",
  "12p": "fj_age_12p",
};

export const FJ_TOY_AGE_SEARCH: Record<FjToyAgeKey, string> = {
  "0_1": "0-1 vjeç",
  "1_3": "1-3 vjeç",
  "3_6": "3-6 vjeç",
  "6_12": "6-12 vjeç",
  "12p": "12+ vjeç",
};

export const FJ_KID_GENDER_KEYS = ["djem", "vajza", "unisex"] as const;
export type FjKidGenderKey = (typeof FJ_KID_GENDER_KEYS)[number];

export const FJ_KID_GENDER_LABEL_KEY: Record<FjKidGenderKey, string> = {
  djem: "fj_gender_djem",
  vajza: "fj_gender_vajza",
  unisex: "fj_gender_unisex",
};

export const FJ_KID_GENDER_SEARCH: Record<FjKidGenderKey, string> = {
  djem: "Për djem",
  vajza: "Për vajza",
  unisex: "Unisex",
};

export const FJ_ROBE_AGE_GROUPS = [
  { groupKey: "0_3m", labelKey: "fj_robe_0_3m", sizeKeys: ["56", "62"] as const },
  { groupKey: "3_9m", labelKey: "fj_robe_3_9m", sizeKeys: ["68", "74"] as const },
  { groupKey: "9_18m", labelKey: "fj_robe_9_18m", sizeKeys: ["80", "86"] as const },
  { groupKey: "1_3y", labelKey: "fj_robe_1_3y", sizeKeys: ["92", "98"] as const },
  { groupKey: "3_6y", labelKey: "fj_robe_3_6y", sizeKeys: ["104", "110", "116"] as const },
  { groupKey: "6_10y", labelKey: "fj_robe_6_10y", sizeKeys: ["122", "128", "140"] as const },
  { groupKey: "10p", labelKey: "fj_robe_10p", sizeKeys: ["146", "152", "164"] as const },
] as const;

export type FjRobeSizeKey = (typeof FJ_ROBE_AGE_GROUPS)[number]["sizeKeys"][number];

export const FJ_ROBE_TYPE_KEYS = [
  "bodi",
  "kompleta",
  "trenerka",
  "jakne",
  "kepuce",
] as const;
export type FjRobeTypeKey = (typeof FJ_ROBE_TYPE_KEYS)[number];

export const FJ_ROBE_TYPE_LABEL_KEY: Record<FjRobeTypeKey, string> = {
  bodi: "fj_robe_bodi",
  kompleta: "fj_robe_kompleta",
  trenerka: "fj_robe_trenerka",
  jakne: "fj_robe_jakne",
  kepuce: "fj_robe_kepuce",
};

export const FJ_ROBE_TYPE_SEARCH: Record<FjRobeTypeKey, string> = {
  bodi: "Bodi Pandallona",
  kompleta: "Kompleta",
  trenerka: "Trenerka",
  jakne: "Jakne",
  kepuce: "Këpucë Patika",
};

export const FJ_CONDITION_KEYS = ["new", "used"] as const;
export type FjConditionKey = (typeof FJ_CONDITION_KEYS)[number];

export const FJ_CONDITION_LABEL_KEY: Record<FjConditionKey, string> = {
  new: "fj_cond_new",
  used: "fj_cond_used",
};

export const FJ_CONDITION_SEARCH: Record<FjConditionKey, string> = {
  new: "E re Me etiketë",
  used: "E përdorur",
};

export {
  LOKALE_ZYRE_CITY_KEYS as FJ_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY as FJ_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH as FJ_CITY_SEARCH,
  type LokaleCityKey as FjCityKey,
} from "@/lib/lokale-zyre-search-helpers";

export type FemijeCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getFemijeHubSubcategoryRows(
  categories: FemijeCategoryRow[],
  hubId: number,
): FemijeCategoryRow[] {
  const hub = Number(hubId);
  return categories
    .filter((c) => Number(c.parent_id) === hub)
    .sort((a, b) => a.name.localeCompare(b.name, "sq"));
}

export function getFemijeGroupLeafIds(
  categories: FemijeCategoryRow[],
  groupId: number,
): number[] {
  const group = categories.find((c) => c.id === groupId);
  if (!group?.slug) return [];

  if (group.slug.startsWith("femije-type-")) return [groupId];

  if (group.slug.startsWith("femije-grp-")) {
    return categories
      .filter(
        (c) =>
          Number(c.parent_id) === Number(groupId) &&
          typeof c.slug === "string" &&
          c.slug.startsWith("femije-leaf-"),
      )
      .map((c) => c.id);
  }

  if (group.slug.startsWith("femije-leaf-")) return [groupId];

  return [];
}

export function femijeSubcategoryPhoto(
  slug: string | null | undefined,
  imageUrl?: string | null,
): string {
  const fromDbRaw = typeof imageUrl === "string" ? imageUrl.trim() : "";
  const fromDb = fromDbRaw && isUsableCategoryImageUrl(fromDbRaw) ? fromDbRaw : "";
  if (fromDb) return fromDb;
  if (slug && FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG[slug]) {
    return FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG[slug];
  }
  if (slug?.startsWith("femije-leaf-")) {
    const groupSlug = FEMIJE_LEAF_PARENT_GROUP_SLUG[slug];
    if (groupSlug && FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG[groupSlug]) {
      return FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG[groupSlug];
    }
  }
  if (!slug) return FEMIJE_HERO_PHOTO;
  for (const key of FJ_TYPE_KEYS) {
    if (FJ_TYPE_DB_SLUG[key] === slug) return FJ_TYPE_PHOTOS[key];
  }
  return FEMIJE_HERO_PHOTO;
}

export function getFemijeLeafCategoryIds(
  categories: FemijeCategoryRow[],
  hubId: number,
): number[] {
  const ids = getFemijeHubSubcategoryRows(categories, hubId).flatMap((group) =>
    getFemijeGroupLeafIds(categories, group.id),
  );
  return [...new Set(ids)];
}

export function resolveFemijeTypeCategoryId(
  categories: FemijeCategoryRow[],
  hubId: number,
  typeKey: FjTypeKey,
): number | undefined {
  const slug = FJ_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
