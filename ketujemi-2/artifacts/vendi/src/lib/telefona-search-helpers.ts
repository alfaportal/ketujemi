/** Telefona hub slug (matches seeded category). */
export const TELEFONA_HUB_SLUG = "telefona";

export const TELEFONA_HERO_PHOTO =
  "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const TEL_DEVICE_KEYS = ["smartphones", "numra", "aksesore_pjese"] as const;
export type TelDeviceKey = (typeof TEL_DEVICE_KEYS)[number];

export const TEL_DEVICE_PHOTOS: Record<TelDeviceKey, string> = {
  smartphones:
    "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400",
  numra:
    "https://images.pexels.com/photos/4068314/pexels-photo-4068314.jpeg?auto=compress&cs=tinysrgb&w=400",
  aksesore_pjese:
    "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const TEL_DEVICE_LABEL_KEY: Record<TelDeviceKey, string> = {
  smartphones: "tel_dev_smartphones",
  numra: "tel_dev_numra",
  aksesore_pjese: "tel_dev_aksesore",
};

/** DB type slugs for device cards. */
export const TEL_DEVICE_SLUGS: Record<TelDeviceKey, string | string[]> = {
  smartphones: "telefona-type-smartphones",
  numra: "telefona-type-numra-kartela",
  aksesore_pjese: ["telefona-type-pjese-rezerve", "telefona-type-aksesore-smartphone"],
};

export const TEL_BRAND_KEYS = [
  "apple",
  "google",
  "honor",
  "huawei",
  "motorola",
  "nokia",
  "oneplus",
  "samsung",
  "xiaomi",
  "zte",
] as const;

export type TelBrandKey = (typeof TEL_BRAND_KEYS)[number];

export const TEL_BRAND_LABEL: Record<TelBrandKey, string> = {
  apple: "Apple",
  google: "Google",
  honor: "Honor",
  huawei: "Huawei",
  motorola: "Motorola",
  nokia: "Nokia",
  oneplus: "OnePlus",
  samsung: "Samsung",
  xiaomi: "Xiaomi",
  zte: "ZTE",
};

export const TEL_BRAND_SLUG: Record<TelBrandKey, string> = {
  apple: "telefona-apple",
  google: "telefona-google",
  honor: "telefona-honor",
  huawei: "telefona-huawei",
  motorola: "telefona-motorola",
  nokia: "telefona-nokia",
  oneplus: "telefona-oneplus",
  samsung: "telefona-samsung",
  xiaomi: "telefona-xiaomi",
  zte: "telefona-zte",
};

export const TEL_BRAND_MODELS: Record<TelBrandKey, readonly string[]> = {
  apple: [
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13",
    "iPhone 12 Pro",
    "iPhone 12",
    "iPhone 11",
    "iPhone SE",
  ],
  samsung: [
    "Galaxy S24 Ultra",
    "Galaxy S24+",
    "Galaxy S24",
    "Galaxy S23 Ultra",
    "Galaxy S23",
    "Galaxy Z Fold5",
    "Galaxy Z Flip5",
    "Galaxy A55",
    "Galaxy A35",
    "Galaxy A15",
  ],
  xiaomi: [
    "14 Ultra",
    "14",
    "Redmi Note 13 Pro+",
    "Redmi Note 13",
    "Poco F6",
    "Poco X6 Pro",
  ],
  google: ["Pixel 8 Pro", "Pixel 8", "Pixel 7a", "Pixel 7 Pro"],
  honor: ["Honor 90", "Honor Magic5 Pro", "Honor X8"],
  huawei: ["P60 Pro", "Mate 50 Pro", "Nova 11"],
  motorola: ["Edge 40 Pro", "Moto G84", "Moto G54"],
  nokia: ["G42", "G22", "XR21"],
  oneplus: ["12", "11", "Nord 3", "Nord CE3"],
  zte: ["Blade V50", "Blade A73"],
};

export const TEL_STORAGE_KEYS = ["32", "64", "128", "256", "512", "1tb"] as const;
export type TelStorageKey = (typeof TEL_STORAGE_KEYS)[number];

export const TEL_STORAGE_LABEL_KEY: Record<TelStorageKey, string> = {
  "32": "tel_stor_32",
  "64": "tel_stor_64",
  "128": "tel_stor_128",
  "256": "tel_stor_256",
  "512": "tel_stor_512",
  "1tb": "tel_stor_1tb",
};

export const TEL_STORAGE_SEARCH: Record<TelStorageKey, string> = {
  "32": "32GB",
  "64": "64GB",
  "128": "128GB",
  "256": "256GB",
  "512": "512GB",
  "1tb": "1TB",
};

export const TEL_CONDITION_KEYS = ["sealed", "like_new", "used", "parts"] as const;
export type TelConditionKey = (typeof TEL_CONDITION_KEYS)[number];

export const TEL_CONDITION_LABEL_KEY: Record<TelConditionKey, string> = {
  sealed: "tel_cond_sealed",
  like_new: "tel_cond_like_new",
  used: "tel_cond_used",
  parts: "tel_cond_parts",
};

export const TEL_CONDITION_SEARCH: Record<TelConditionKey, string> = {
  sealed: "I paketuar Sealed",
  like_new: "Si i ri",
  used: "I përdorur",
  parts: "Për pjesë iCloud",
};

export const TEL_BATTERY_KEYS = ["90_100", "80_89", "under_80"] as const;
export type TelBatteryKey = (typeof TEL_BATTERY_KEYS)[number];

export const TEL_BATTERY_LABEL_KEY: Record<TelBatteryKey, string> = {
  "90_100": "tel_bat_90",
  "80_89": "tel_bat_80",
  under_80: "tel_bat_under",
};

export const TEL_BATTERY_SEARCH: Record<TelBatteryKey, string> = {
  "90_100": "Bateri 90%",
  "80_89": "Bateri 80%",
  under_80: "Bateri nën 80%",
};

export type TelefonaCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getTelefonaHubChildCategoryIds(
  categories: TelefonaCategoryRow[],
  hubId: number,
): number[] {
  return categories.filter((c) => c.parent_id === hubId).map((c) => c.id);
}

export function resolveTelefonaCategoryIdBySlug(
  categories: TelefonaCategoryRow[],
  hubId: number,
  slug: string,
): number | undefined {
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}

export function resolveDeviceTypeCategoryIds(
  categories: TelefonaCategoryRow[],
  hubId: number,
  deviceKey: TelDeviceKey,
): number[] {
  const slugs = TEL_DEVICE_SLUGS[deviceKey];
  const list = Array.isArray(slugs) ? slugs : [slugs];
  return list
    .map((s) => resolveTelefonaCategoryIdBySlug(categories, hubId, s))
    .filter((id): id is number => id != null);
}
