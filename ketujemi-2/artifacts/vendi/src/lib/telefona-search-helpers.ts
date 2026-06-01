/** Telefona hub slug (matches seeded category). */
export const TELEFONA_HUB_SLUG = "telefona";

export const TELEFONA_HERO_PHOTO =
  "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const TEL_DEVICE_KEYS = [
  "smartphones",
  "smartwatches",
  "smart_bands",
  "e_readers",
  "aksesore_pjese",
] as const;
export type TelDeviceKey = (typeof TEL_DEVICE_KEYS)[number];

export const TEL_DEVICE_PHOTOS: Record<TelDeviceKey, string> = {
  smartphones:
    "https://images.pexels.com/photos/36680543/pexels-photo-36680543.jpeg?auto=compress&cs=tinysrgb&w=400",
  smartwatches:
    "https://images.pexels.com/photos/3935354/pexels-photo-3935354.jpeg?auto=compress&cs=tinysrgb&w=400",
  smart_bands:
    "https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400",
  e_readers:
    "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400",
  aksesore_pjese:
    "https://images.pexels.com/photos/35673118/pexels-photo-35673118.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const TEL_DEVICE_LABEL_KEY: Record<TelDeviceKey, string> = {
  smartphones: "tel_dev_smartphones",
  smartwatches: "tel_dev_smartwatches",
  smart_bands: "tel_dev_smart_bands",
  e_readers: "tel_dev_ereaders",
  aksesore_pjese: "tel_dev_aksesore",
};

export const TEL_DEVICE_SEARCH: Record<TelDeviceKey, string> = {
  smartphones: "Smartphone telefon",
  smartwatches: "Smartwatch Apple Watch Galaxy Watch",
  smart_bands: "Smart Band fitness Xiaomi Band",
  e_readers: "E-Reader Kindle Kobo lexues",
  aksesore_pjese: "Aksesorë telefon pjesë",
};

export const TEL_DEVICE_SLUGS: Partial<Record<TelDeviceKey, string | string[]>> = {
  smartphones: "telefona-type-smartphones",
  aksesore_pjese: ["telefona-type-pjese-rezerve", "telefona-type-aksesore-smartphone"],
};

/** Market-facing condition (brand new / used / unlocked). */
export const TEL_MARKET_CONDITION_KEYS = ["brand_new", "pre_owned", "unlocked"] as const;
export type TelMarketConditionKey = (typeof TEL_MARKET_CONDITION_KEYS)[number];

export const TEL_MARKET_CONDITION_LABEL_KEY: Record<TelMarketConditionKey, string> = {
  brand_new: "tel_mcond_new",
  pre_owned: "tel_mcond_used",
  unlocked: "tel_mcond_unlocked",
};

export const TEL_MARKET_CONDITION_SEARCH: Record<TelMarketConditionKey, string> = {
  brand_new: "Brand New i ri paketuar",
  pre_owned: "Pre-Owned i përdorur",
  unlocked: "Unlocked Sim-Free zhbllokuar",
};

export const TEL_QUICK_FILTER_KEYS = [
  "battery_5000",
  "pro_camera",
  "dual_sim",
  "ip68",
] as const;
export type TelQuickFilterKey = (typeof TEL_QUICK_FILTER_KEYS)[number];

export const TEL_QUICK_FILTER_LABEL_KEY: Record<TelQuickFilterKey, string> = {
  battery_5000: "tel_qf_battery",
  pro_camera: "tel_qf_camera",
  dual_sim: "tel_qf_dual_sim",
  ip68: "tel_qf_ip68",
};

export const TEL_QUICK_FILTER_SEARCH: Record<TelQuickFilterKey, string> = {
  battery_5000: "Bateri 5000mAh",
  pro_camera: "Kamerë OIS 108MP profesionale",
  dual_sim: "Dual SIM eSIM",
  ip68: "IP68 rezistent ujë",
};

/** Smartphone tier / type subcategories */
export const TEL_SMARTPHONE_SUB_KEYS = [
  "premium_flagship",
  "mid_range",
  "budget_under_200",
  "gaming_phones",
  "foldables",
] as const;

export type TelSmartphoneSubKey = (typeof TEL_SMARTPHONE_SUB_KEYS)[number];

export const TEL_SMARTPHONE_SUB_LABEL_KEY: Record<TelSmartphoneSubKey, string> = {
  premium_flagship: "tel_sub_premium",
  mid_range: "tel_sub_mid",
  budget_under_200: "tel_sub_budget",
  gaming_phones: "tel_sub_gaming",
  foldables: "tel_sub_foldables",
};

export const TEL_SMARTPHONE_SUB_SEARCH: Record<TelSmartphoneSubKey, string> = {
  premium_flagship: "Premium Flagship",
  mid_range: "Mid-Range",
  budget_under_200: "Budget nën 200 euro",
  gaming_phones: "Gaming Phone",
  foldables: "Galaxy Fold Flip Foldable",
};

export const TEL_SMARTPHONE_SUB_PRICE: Record<
  TelSmartphoneSubKey,
  { min?: number; max?: number }
> = {
  premium_flagship: { min: 800 },
  mid_range: { min: 200, max: 700 },
  budget_under_200: { max: 199 },
  gaming_phones: {},
  foldables: {},
};

export const TEL_SMARTPHONE_SUB_EXTRA_SEARCH: Record<TelSmartphoneSubKey, string> = {
  premium_flagship:
    "iPhone 15 Pro Max iPhone 15 Pro iPhone 16 Pro Galaxy S24 Ultra S25 Ultra S26 Ultra Pixel Pro Xiaomi Ultra flagship",
  mid_range:
    "Galaxy A55 A54 A35 iPhone 13 iPhone 14 Redmi Note Poco F Poco X mid-range",
  budget_under_200:
    "Galaxy A05 A15 Redmi 13C Redmi A3 Motorola E Motorola G budget ekonomik",
  gaming_phones:
    "ASUS ROG Phone Black Shark Nubia RedMagic Poco F6 Pro Gaming telefon lojëra",
  foldables:
    "Galaxy Z Fold Galaxy Z Flip Pixel Fold OnePlus Open Honor Magic V Foldable palosshëm",
};

export const TEL_BRAND_GROUP_KEYS = [
  "apple",
  "samsung",
  "xiaomi_redmi",
  "other_brands",
] as const;

export type TelBrandGroupKey = (typeof TEL_BRAND_GROUP_KEYS)[number];

export const TEL_BRAND_GROUP_LABEL_KEY: Record<TelBrandGroupKey, string> = {
  apple: "tel_brand_grp_apple",
  samsung: "tel_brand_grp_samsung",
  xiaomi_redmi: "tel_brand_grp_xiaomi",
  other_brands: "tel_brand_grp_other",
};

export const TEL_BRAND_GROUP_PHOTOS: Record<TelBrandGroupKey, string> = {
  apple:
    "https://images.pexels.com/photos/16005007/pexels-photo-16005007.jpeg?auto=compress&cs=tinysrgb&w=400",
  samsung:
    "https://images.pexels.com/photos/16149966/pexels-photo-16149966.jpeg?auto=compress&cs=tinysrgb&w=400",
  xiaomi_redmi:
    "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400",
  other_brands:
    "https://images.pexels.com/photos/1482061/pexels-photo-1482061.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const TEL_BRAND_GROUP_SLUG: Partial<Record<TelBrandGroupKey, string>> = {
  apple: "telefona-apple",
  samsung: "telefona-samsung",
  xiaomi_redmi: "telefona-xiaomi",
};

export const TEL_OTHER_BRAND_KEYS = [
  "google",
  "oneplus",
  "huawei",
  "realme",
  "motorola",
  "honor",
] as const;

export type TelOtherBrandKey = (typeof TEL_OTHER_BRAND_KEYS)[number];

export const TEL_OTHER_BRAND_LABEL_KEY: Record<TelOtherBrandKey, string> = {
  google: "tel_other_google",
  oneplus: "tel_other_oneplus",
  huawei: "tel_other_huawei",
  realme: "tel_other_realme",
  motorola: "tel_other_motorola",
  honor: "tel_other_honor",
};

export const TEL_BRAND_GROUP_MODELS: Record<Exclude<TelBrandGroupKey, "other_brands">, readonly string[]> = {
  apple: [
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 12 Pro Max",
    "iPhone 12",
    "iPhone 11",
  ],
  samsung: [
    "Galaxy S24 Ultra",
    "Galaxy S24+",
    "Galaxy S24",
    "Galaxy S23 Ultra",
    "Galaxy S23+",
    "Galaxy S23",
    "Galaxy Z Fold 5",
    "Galaxy Z Flip 5",
    "Galaxy A55",
    "Galaxy A35",
    "Galaxy A15",
  ],
  xiaomi_redmi: [
    "Xiaomi 14 Ultra",
    "Xiaomi 14 Pro",
    "Xiaomi 14",
    "Redmi Note 13 Pro+",
    "Redmi Note 13 Pro",
    "Redmi Note 13",
    "POCO F6 Pro",
    "POCO F6",
    "POCO X6 Pro",
  ],
};

export const TEL_OTHER_BRAND_MODELS: Record<TelOtherBrandKey, readonly string[]> = {
  google: [
    "Google Pixel 8 Pro",
    "Google Pixel 8",
    "Google Pixel 7 Pro",
    "Google Pixel 7a",
  ],
  oneplus: ["OnePlus 12", "OnePlus 11", "OnePlus Nord 3", "OnePlus Nord CE3"],
  huawei: ["Huawei P60 Pro", "Huawei Mate 50 Pro"],
  realme: ["Realme 12 Pro+", "Realme 12 Pro", "Realme C55"],
  motorola: ["Motorola Edge 50 Pro", "Motorola G84", "Motorola Razr 40"],
  honor: ["Honor Magic 6 Pro", "Honor 90", "Honor X8b"],
};

export function getTelBrandGroupModels(
  brandGroup: TelBrandGroupKey | null,
  otherBrand: TelOtherBrandKey | null,
): readonly string[] {
  if (!brandGroup) return [];
  if (brandGroup === "other_brands") {
    if (otherBrand) return TEL_OTHER_BRAND_MODELS[otherBrand];
    return TEL_OTHER_BRAND_KEYS.flatMap((k) => [...TEL_OTHER_BRAND_MODELS[k]]);
  }
  return TEL_BRAND_GROUP_MODELS[brandGroup];
}

/** Phone picker brands for accessory compatibility */
export const TEL_COMPAT_PICKER_BRANDS = ["apple", "samsung"] as const;
export type TelCompatPickerBrand = (typeof TEL_COMPAT_PICKER_BRANDS)[number];

export function getTelCompatPickerModels(brand: TelCompatPickerBrand | ""): readonly string[] {
  if (brand === "apple") return TEL_BRAND_GROUP_MODELS.apple;
  if (brand === "samsung") return TEL_BRAND_GROUP_MODELS.samsung;
  return [];
}

export const TEL_AKSESORE_ITEM_KEYS = [
  "case_silikon",
  "case_lekure",
  "case_plastike",
  "case_magsafe",
  "xhama_mbrojtes",
  "charger_20w",
  "charger_25w",
  "charger_45w",
  "charger_65w",
  "charger_120w",
  "cable_usbc",
  "cable_lightning",
  "cable_micro",
  "wireless_magsafe",
  "car_charger",
  "powerbank",
  "tws_earbuds",
  "wired_headphones",
  "bluetooth_speakers",
  "spare_screen",
  "spare_battery",
  "spare_camera",
  "spare_charging_port",
  "car_mounts",
  "tripod_selfie",
  "airtag_smarttag",
] as const;

export type TelAksesoreItemKey = (typeof TEL_AKSESORE_ITEM_KEYS)[number];

export const TEL_AKSESORE_SECTIONS: readonly {
  titleKey: string;
  itemKeys: readonly TelAksesoreItemKey[];
}[] = [
  {
    titleKey: "tel_ak_sec_protection",
    itemKeys: ["case_silikon", "case_lekure", "case_plastike", "case_magsafe", "xhama_mbrojtes"],
  },
  {
    titleKey: "tel_ak_sec_charging",
    itemKeys: [
      "charger_20w",
      "charger_25w",
      "charger_45w",
      "charger_65w",
      "charger_120w",
      "cable_usbc",
      "cable_lightning",
      "cable_micro",
      "wireless_magsafe",
      "car_charger",
      "powerbank",
    ],
  },
  {
    titleKey: "tel_ak_sec_audio",
    itemKeys: ["tws_earbuds", "wired_headphones", "bluetooth_speakers"],
  },
  {
    titleKey: "tel_ak_sec_spare",
    itemKeys: ["spare_screen", "spare_battery", "spare_camera", "spare_charging_port"],
  },
  {
    titleKey: "tel_ak_sec_other",
    itemKeys: ["car_mounts", "tripod_selfie", "airtag_smarttag"],
  },
];

export const TEL_AKSESORE_LABEL_KEY: Record<TelAksesoreItemKey, string> = {
  case_silikon: "tel_ak_case_silikon",
  case_lekure: "tel_ak_case_lekure",
  case_plastike: "tel_ak_case_plastike",
  case_magsafe: "tel_ak_case_magsafe",
  xhama_mbrojtes: "tel_ak_xhama",
  charger_20w: "tel_ak_chg_20w",
  charger_25w: "tel_ak_chg_25w",
  charger_45w: "tel_ak_chg_45w",
  charger_65w: "tel_ak_chg_65w",
  charger_120w: "tel_ak_chg_120w",
  cable_usbc: "tel_ak_cable_usbc",
  cable_lightning: "tel_ak_cable_lightning",
  cable_micro: "tel_ak_cable_micro",
  wireless_magsafe: "tel_ak_wireless",
  car_charger: "tel_ak_car_charger",
  powerbank: "tel_ak_powerbank",
  tws_earbuds: "tel_ak_tws",
  wired_headphones: "tel_ak_wired_hp",
  bluetooth_speakers: "tel_ak_bt_speaker",
  spare_screen: "tel_ak_spare_screen",
  spare_battery: "tel_ak_spare_battery",
  spare_camera: "tel_ak_spare_camera",
  spare_charging_port: "tel_ak_spare_port",
  car_mounts: "tel_ak_car_mount",
  tripod_selfie: "tel_ak_tripod",
  airtag_smarttag: "tel_ak_airtag",
};

export const TEL_AKSESORE_SEARCH: Record<TelAksesoreItemKey, string> = {
  case_silikon: "Masketa Silikon Case",
  case_lekure: "Masketa Lekure Leather Case",
  case_plastike: "Masketa Plastike Case",
  case_magsafe: "MagSafe Case",
  xhama_mbrojtes: "Xhama Mbrojtës Screen Protector",
  charger_20w: "Karrikues 20W Fast Charge",
  charger_25w: "Karrikues 25W Fast Charge",
  charger_45w: "Karrikues 45W Fast Charge",
  charger_65w: "Karrikues 65W Fast Charge",
  charger_120w: "Karrikues 120W Fast Charge",
  cable_usbc: "Kabllo USB-C",
  cable_lightning: "Kabllo Lightning",
  cable_micro: "Kabllo Micro-USB",
  wireless_magsafe: "Wireless MagSafe Charger",
  car_charger: "Car Charger Auto",
  powerbank: "Powerbank Bateri",
  tws_earbuds: "TWS Earbuds Kufje",
  wired_headphones: "Kufje me kabllo",
  bluetooth_speakers: "Bluetooth Speaker Altoparlant",
  spare_screen: "Ekran LCD OLED",
  spare_battery: "Bateri telefon",
  spare_camera: "Kamera modul",
  spare_charging_port: "Porte karrikimi Charging Port",
  car_mounts: "Car Mount Mbajtese veture",
  tripod_selfie: "Tripod Selfie Stick",
  airtag_smarttag: "AirTag SmartTag",
};

export function telAksesoreItemSearch(item: TelAksesoreItemKey | null): string {
  if (!item) return "";
  return TEL_AKSESORE_SEARCH[item];
}

export function telAksesoreItemSlug(item: TelAksesoreItemKey | null): string | undefined {
  if (!item) return undefined;
  const spareKeys: TelAksesoreItemKey[] = [
    "spare_screen",
    "spare_battery",
    "spare_camera",
    "spare_charging_port",
  ];
  return spareKeys.includes(item)
    ? "telefona-type-pjese-rezerve"
    : "telefona-type-aksesore-smartphone";
}

export const TEL_STORAGE_KEYS = ["64", "128", "256", "512", "1tb"] as const;
export type TelStorageKey = (typeof TEL_STORAGE_KEYS)[number];

export const TEL_STORAGE_LABEL_KEY: Record<TelStorageKey, string> = {
  "64": "tel_stor_64",
  "128": "tel_stor_128",
  "256": "tel_stor_256",
  "512": "tel_stor_512",
  "1tb": "tel_stor_1tb",
};

export const TEL_STORAGE_SEARCH: Record<TelStorageKey, string> = {
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
  sealed: "I ri paketuar Sealed",
  like_new: "Si i ri",
  used: "I përdorur",
  parts: "Për pjesë thyer iCloud",
};

export const TEL_RAM_KEYS = ["4", "6", "8", "12", "16"] as const;
export type TelRamKey = (typeof TEL_RAM_KEYS)[number];

export const TEL_RAM_LABEL_KEY: Record<TelRamKey, string> = {
  "4": "tel_ram_4",
  "6": "tel_ram_6",
  "8": "tel_ram_8",
  "12": "tel_ram_12",
  "16": "tel_ram_16",
};

export const TEL_RAM_SEARCH: Record<TelRamKey, string> = {
  "4": "4GB RAM",
  "6": "6GB RAM",
  "8": "8GB RAM",
  "12": "12GB RAM",
  "16": "16GB RAM",
};

export const TEL_NETWORK_KEYS = ["5g", "4g"] as const;
export type TelNetworkKey = (typeof TEL_NETWORK_KEYS)[number];

export const TEL_NETWORK_LABEL_KEY: Record<TelNetworkKey, string> = {
  "5g": "tel_net_5g",
  "4g": "tel_net_4g",
};

export const TEL_NETWORK_SEARCH: Record<TelNetworkKey, string> = {
  "5g": "5G",
  "4g": "4G LTE",
};

export const TEL_CAPACITY_KEYS = ["under_4000", "4000_5000", "over_5000"] as const;
export type TelCapacityKey = (typeof TEL_CAPACITY_KEYS)[number];

export const TEL_CAPACITY_LABEL_KEY: Record<TelCapacityKey, string> = {
  under_4000: "tel_cap_under",
  "4000_5000": "tel_cap_mid",
  over_5000: "tel_cap_over",
};

export const TEL_CAPACITY_SEARCH: Record<TelCapacityKey, string> = {
  under_4000: "Bateri nën 4000mAh",
  "4000_5000": "Bateri 4000 5000 mAh",
  over_5000: "Bateri mbi 5000mAh",
};

export const TEL_OS_KEYS = ["ios", "android"] as const;
export type TelOsKey = (typeof TEL_OS_KEYS)[number];

export const TEL_OS_LABEL_KEY: Record<TelOsKey, string> = {
  ios: "tel_os_ios",
  android: "tel_os_android",
};

export const TEL_OS_SEARCH: Record<TelOsKey, string> = {
  ios: "iOS iPhone",
  android: "Android",
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
  const direct = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  if (direct) return direct.id;

  // Fallback: allow slugs nested under a type page (hub -> type -> brand/item).
  const inHubTree = (row: TelefonaCategoryRow): boolean => {
    let pid = row.parent_id;
    let guard = 0;
    while (pid != null && guard < 12) {
      if (pid === hubId) return true;
      pid = categories.find((c) => c.id === pid)?.parent_id ?? null;
      guard += 1;
    }
    return false;
  };

  const nested = categories.find((c) => c.slug === slug && inHubTree(c));
  return nested?.id;
}

export function resolveDeviceTypeCategoryIds(
  categories: TelefonaCategoryRow[],
  hubId: number,
  deviceKey: TelDeviceKey,
): number[] {
  return resolveTelDeviceCategoryIds(categories, hubId, deviceKey);
}

export const TEL_BRAND_RAM_KEYS: Record<
  Exclude<TelBrandGroupKey, "other_brands">,
  readonly TelRamKey[]
> = {
  apple: ["4", "6", "8"],
  samsung: ["4", "6", "8", "12", "16"],
  xiaomi_redmi: ["6", "8", "12", "16"],
};

export const TEL_OTHER_RAM_KEYS: readonly TelRamKey[] = ["8", "12", "16"];

export const TEL_BRAND_STORAGE_KEYS: Record<
  Exclude<TelBrandGroupKey, "other_brands">,
  readonly TelStorageKey[]
> = {
  apple: ["64", "128", "256", "512", "1tb"],
  samsung: ["64", "128", "256", "512", "1tb"],
  xiaomi_redmi: ["128", "256", "512", "1tb"],
};

export const TEL_OTHER_STORAGE_KEYS: readonly TelStorageKey[] = ["128", "256", "512", "1tb"];

export const TEL_BRAND_CAPACITY_KEYS: Record<
  Exclude<TelBrandGroupKey, "other_brands">,
  readonly TelCapacityKey[]
> = {
  apple: ["under_4000", "4000_5000"],
  samsung: ["under_4000", "4000_5000", "over_5000"],
  xiaomi_redmi: ["4000_5000", "over_5000"],
};

export const TEL_OTHER_CAPACITY_KEYS: readonly TelCapacityKey[] = [
  "under_4000",
  "4000_5000",
  "over_5000",
];

export function getTelRamKeysForBrand(
  brandGroup: TelBrandGroupKey | null,
): readonly TelRamKey[] {
  if (!brandGroup || brandGroup === "other_brands") return TEL_OTHER_RAM_KEYS;
  return TEL_BRAND_RAM_KEYS[brandGroup];
}

export function getTelStorageKeysForBrand(
  brandGroup: TelBrandGroupKey | null,
): readonly TelStorageKey[] {
  if (!brandGroup || brandGroup === "other_brands") return TEL_OTHER_STORAGE_KEYS;
  return TEL_BRAND_STORAGE_KEYS[brandGroup];
}

export function getTelCapacityKeysForBrand(
  brandGroup: TelBrandGroupKey | null,
): readonly TelCapacityKey[] {
  if (!brandGroup || brandGroup === "other_brands") return TEL_OTHER_CAPACITY_KEYS;
  return TEL_BRAND_CAPACITY_KEYS[brandGroup];
}

export function getTelOsKeysForBrand(brandGroup: TelBrandGroupKey | null): readonly TelOsKey[] {
  if (brandGroup === "apple") return ["ios"];
  if (brandGroup) return ["android"];
  return TEL_OS_KEYS;
}

export function resolveTelDeviceCategoryIds(
  categories: TelefonaCategoryRow[],
  hubId: number,
  deviceKey: TelDeviceKey,
): number[] {
  const configured = TEL_DEVICE_SLUGS[deviceKey];
  if (configured) {
    const list = Array.isArray(configured) ? configured : [configured];
    const ids = list
      .map((s) => resolveTelefonaCategoryIdBySlug(categories, hubId, s))
      .filter((id): id is number => id != null);
    if (ids.length) return ids;
  }
  if (
    deviceKey === "smartwatches" ||
    deviceKey === "smart_bands" ||
    deviceKey === "e_readers"
  ) {
    const phoneId = resolveTelefonaCategoryIdBySlug(
      categories,
      hubId,
      "telefona-type-smartphones",
    );
    return phoneId ? [phoneId] : [];
  }
  return [];
}

export function applyTelSubcategoryPrice(
  params: { min_price?: number; max_price?: number },
  sub: TelSmartphoneSubKey | null,
  manualMin?: number,
  manualMax?: number,
): void {
  const tier = sub ? TEL_SMARTPHONE_SUB_PRICE[sub] : undefined;
  if (tier?.min != null) {
    params.min_price = manualMin != null ? Math.max(manualMin, tier.min) : tier.min;
  } else if (manualMin != null) {
    params.min_price = manualMin;
  }
  if (tier?.max != null) {
    params.max_price = manualMax != null ? Math.min(manualMax, tier.max) : tier.max;
  } else if (manualMax != null) {
    params.max_price = manualMax;
  }
}
