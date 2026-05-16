/** Sport & Outdoor hub slug (matches seeded category). */
export const SPORT_OUTDOOR_HUB_SLUG = "sport-outdoor";

export const SPORT_OUTDOOR_HERO_PHOTO =
  "https://images.pexels.com/photos/4164752/pexels-photo-4164752.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const SPORT_TYPE_KEYS = [
  "football",
  "fitness",
  "bike",
  "camping",
  "martial",
  "winter",
  "water",
  "hobby",
] as const;

export type SportTypeKey = (typeof SPORT_TYPE_KEYS)[number];

export const SPORT_TYPE_PHOTOS: Record<SportTypeKey, string> = {
  football:
    "https://images.pexels.com/photos/46798/the-ball-stadion-football-player-46798.jpeg?auto=compress&cs=tinysrgb&w=400",
  fitness:
    "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400",
  bike:
    "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400",
  camping:
    "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=400",
  martial:
    "https://images.pexels.com/photos/4428289/pexels-photo-4428289.jpeg?auto=compress&cs=tinysrgb&w=400",
  winter:
    "https://images.pexels.com/photos/848599/pexels-photo-848599.jpeg?auto=compress&cs=tinysrgb&w=400",
  water:
    "https://images.pexels.com/photos/1575518/pexels-photo-1575518.jpeg?auto=compress&cs=tinysrgb&w=400",
  hobby:
    "https://images.pexels.com/photos/163064/play-stone-network-networked-163064.jpeg?auto=compress&cs=tinysrgb&w=400",
};

/** Maps UI sport cards to seeded subcategory slugs when present. */
export const SPORT_TYPE_DB_SLUG: Partial<Record<SportTypeKey, string>> = {
  football: "sport-type-top",
  fitness: "sport-type-fitnes-joga",
  bike: "sport-type-bicikleta",
  camping: "sport-type-kampingu",
  winter: "sport-type-dimerore",
};

/** i18n keys under `so_type_*` in app-extra-i18n. */
export const SPORT_TYPE_LABEL_KEY: Record<SportTypeKey, string> = {
  football: "so_type_football",
  fitness: "so_type_fitness",
  bike: "so_type_bike",
  camping: "so_type_camping",
  martial: "so_type_martial",
  winter: "so_type_winter",
  water: "so_type_water",
  hobby: "so_type_hobby",
};

export const SPORT_EQUIPMENT_KEYS = ["clothing", "shoes", "gear", "accessories"] as const;
export type SportEquipmentKey = (typeof SPORT_EQUIPMENT_KEYS)[number];

export const SPORT_EQUIPMENT_LABEL_KEY: Record<SportEquipmentKey, string> = {
  clothing: "so_equip_clothing",
  shoes: "so_equip_shoes",
  gear: "so_equip_gear",
  accessories: "so_equip_accessories",
};

/** Albanian tokens stored in listings / used for search. */
export const SPORT_EQUIPMENT_SEARCH: Record<SportEquipmentKey, string> = {
  clothing: "Veshje Sportive",
  shoes: "Atlete Sportive",
  gear: "Rekuizita",
  accessories: "Aksesorë",
};

export const SPORT_CONDITION_SEARCH = {
  new: "E re",
  used: "E përdorur",
} as const;

export const SPORT_BIKE_SIZES = ['20"', '24"', '26"', '27.5"', '29"'] as const;
export const SPORT_BIKE_TYPE_KEYS = ["mtb", "road", "city", "kids"] as const;
export type SportBikeTypeKey = (typeof SPORT_BIKE_TYPE_KEYS)[number];

export const SPORT_BIKE_TYPE_SEARCH: Record<SportBikeTypeKey, string> = {
  mtb: "MTB",
  road: "Road",
  city: "Qyteti",
  kids: "Fëmijë",
};

export const SPORT_BIKE_TYPE_LABEL_KEY: Record<SportBikeTypeKey, string> = {
  mtb: "so_bike_mtb",
  road: "so_bike_road",
  city: "so_bike_city",
  kids: "so_bike_kids",
};

export const SPORT_GENDER_KEYS = ["male", "female", "kids"] as const;
export type SportGenderKey = (typeof SPORT_GENDER_KEYS)[number];

export const SPORT_GENDER_SEARCH: Record<SportGenderKey, string> = {
  male: "Meshkuj",
  female: "Femra",
  kids: "Fëmijë",
};

export const SPORT_GENDER_LABEL_KEY: Record<SportGenderKey, string> = {
  male: "so_gender_male",
  female: "so_gender_female",
  kids: "so_gender_kids",
};

export type SportOutdoorCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getSportOutdoorLeafCategoryIds(
  categories: SportOutdoorCategoryRow[],
  hubId: number,
): number[] {
  return categories.filter((c) => c.parent_id === hubId).map((c) => c.id);
}

export function resolveSportTypeCategoryId(
  categories: SportOutdoorCategoryRow[],
  hubId: number,
  sportKey: SportTypeKey,
): number | undefined {
  const slug = SPORT_TYPE_DB_SLUG[sportKey];
  if (!slug) return undefined;
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
