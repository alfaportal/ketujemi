/** Elektronikë & Pajisje Shtëpiake hub slug (matches seeded category). */
export const TV_ELEKTRONIKE_HUB_SLUG = "tv-elektronike";

export const TV_ELEKTRONIKE_HERO_PHOTO =
  "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const EP_TYPE_KEYS = [
  "pajisje_medha",
  "klimatizim",
  "televizore",
  "konzola",
  "audio",
  "kamera",
] as const;

export type EpTypeKey = (typeof EP_TYPE_KEYS)[number];

export const EP_TYPE_DB_SLUG: Record<EpTypeKey, string> = {
  pajisje_medha: "tv-type-pajisje-medha-shtepiake",
  klimatizim: "tv-type-klimatizim-ngrohje",
  televizore: "tv-type-televizore-projektor",
  konzola: "tv-type-konzola-gaming",
  audio: "tv-type-audio-zeri",
  kamera: "tv-type-kamera-foto-smartwatch",
};

export const EP_TYPE_PHOTOS: Record<EpTypeKey, string> = {
  pajisje_medha:
    "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400",
  klimatizim:
    "https://images.pexels.com/photos/534151/pexels-photo-534151.jpeg?auto=compress&cs=tinysrgb&w=400",
  televizore:
    "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=400",
  konzola:
    "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=400",
  audio:
    "https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg?auto=compress&cs=tinysrgb&w=400",
  kamera:
    "https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const EP_TYPE_LABEL_KEY: Record<EpTypeKey, string> = {
  pajisje_medha: "ep_type_pajisje",
  klimatizim: "ep_type_klimatizim",
  televizore: "ep_type_tv",
  konzola: "ep_type_konzola",
  audio: "ep_type_audio",
  kamera: "ep_type_kamera",
};

export const EP_APPLIANCE_KIND_KEYS = [
  "frigorifere",
  "rrobalarese",
  "enelarese",
  "shporeta",
  "furra",
  "aspiratore",
] as const;
export type EpApplianceKindKey = (typeof EP_APPLIANCE_KIND_KEYS)[number];

export const EP_APPLIANCE_KIND_LABEL_KEY: Record<EpApplianceKindKey, string> = {
  frigorifere: "ep_app_frigo",
  rrobalarese: "ep_app_rroba",
  enelarese: "ep_app_ene",
  shporeta: "ep_app_shporeta",
  furra: "ep_app_furra",
  aspiratore: "ep_app_aspirator",
};

export const EP_APPLIANCE_KIND_SEARCH: Record<EpApplianceKindKey, string> = {
  frigorifere: "Frigorifer Side-by-Side Ngrirës",
  rrobalarese: "Rrobalarëse Thonëse",
  enelarese: "Enëlarëse",
  shporeta: "Shporetë Plloca Gatimi Rrymë Gaz Induksion",
  furra: "Furrë Inkaso Standarde",
  aspiratore: "Aspirator",
};

export const EP_ENERGY_KEYS = ["a3plus", "a2plus", "a", "b"] as const;
export type EpEnergyKey = (typeof EP_ENERGY_KEYS)[number];

export const EP_ENERGY_LABEL_KEY: Record<EpEnergyKey, string> = {
  a3plus: "ep_energy_a3",
  a2plus: "ep_energy_a2",
  a: "ep_energy_a",
  b: "ep_energy_b",
};

export const EP_ENERGY_SEARCH: Record<EpEnergyKey, string> = {
  a3plus: "A+++",
  a2plus: "A++",
  a: "A",
  b: "B",
};

export const EP_WIDTH_KEYS = ["w50", "w60", "w90"] as const;
export type EpWidthKey = (typeof EP_WIDTH_KEYS)[number];

export const EP_WIDTH_LABEL_KEY: Record<EpWidthKey, string> = {
  w50: "ep_width_50",
  w60: "ep_width_60",
  w90: "ep_width_90",
};

export const EP_WIDTH_SEARCH: Record<EpWidthKey, string> = {
  w50: "50cm",
  w60: "60cm",
  w90: "90cm",
};

export const EP_CLIMATE_KIND_KEYS = [
  "klima",
  "ngrohjes",
  "mikroval",
  "kuzhine",
  "fshesa",
  "personale",
] as const;
export type EpClimateKindKey = (typeof EP_CLIMATE_KIND_KEYS)[number];

export const EP_CLIMATE_KIND_LABEL_KEY: Record<EpClimateKindKey, string> = {
  klima: "ep_clim_klima",
  ngrohjes: "ep_clim_ngrohje",
  mikroval: "ep_clim_mikroval",
  kuzhine: "ep_clim_kuzhine",
  fshesa: "ep_clim_fshesa",
  personale: "ep_clim_personale",
};

export const EP_CLIMATE_KIND_SEARCH: Record<EpClimateKindKey, string> = {
  klima: "Klima Inverter",
  ngrohjes: "Ngrohëse Radiator",
  mikroval: "Mikrovalë Mini-furrë",
  kuzhine: "Blender Mikser Kafemakinë Air Fryer",
  fshesa: "Fshesë Rrymë Bateri Robot",
  personale: "Fen Presë Makinë rroje",
};

export const EP_BTU_KEYS = ["btu9000", "btu12000", "btu18000", "btu24000"] as const;
export type EpBtuKey = (typeof EP_BTU_KEYS)[number];

export const EP_BTU_LABEL_KEY: Record<EpBtuKey, string> = {
  btu9000: "ep_btu_9000",
  btu12000: "ep_btu_12000",
  btu18000: "ep_btu_18000",
  btu24000: "ep_btu_24000",
};

export const EP_BTU_SEARCH: Record<EpBtuKey, string> = {
  btu9000: "9000 BTU",
  btu12000: "12000 BTU",
  btu18000: "18000 BTU",
  btu24000: "24000 BTU",
};

export const EP_TV_TYPE_KEYS = ["tv", "projektor", "home_cinema"] as const;
export type EpTvTypeKey = (typeof EP_TV_TYPE_KEYS)[number];

export const EP_TV_TYPE_LABEL_KEY: Record<EpTvTypeKey, string> = {
  tv: "ep_tv_type_tv",
  projektor: "ep_tv_type_projektor",
  home_cinema: "ep_tv_type_cinema",
};

export const EP_TV_TYPE_SEARCH: Record<EpTvTypeKey, string> = {
  tv: "Televizor",
  projektor: "Projektor",
  home_cinema: "Home Cinema",
};

export const EP_TV_SIZE_KEYS = ["under32", "s32_43", "s49_55", "s65_75", "over75"] as const;
export type EpTvSizeKey = (typeof EP_TV_SIZE_KEYS)[number];

export const EP_TV_SIZE_LABEL_KEY: Record<EpTvSizeKey, string> = {
  under32: "ep_tv_size_u32",
  s32_43: "ep_tv_size_32_43",
  s49_55: "ep_tv_size_49_55",
  s65_75: "ep_tv_size_65_75",
  over75: "ep_tv_size_o75",
};

export const EP_TV_SIZE_SEARCH: Record<EpTvSizeKey, string> = {
  under32: 'Nën 32"',
  s32_43: '32"-43"',
  s49_55: '49"-55"',
  s65_75: '65"-75"',
  over75: 'Mbi 75"',
};

export const EP_RESOLUTION_KEYS = ["hd", "fhd", "uhd4k", "uhd8k"] as const;
export type EpResolutionKey = (typeof EP_RESOLUTION_KEYS)[number];

export const EP_RESOLUTION_LABEL_KEY: Record<EpResolutionKey, string> = {
  hd: "ep_res_hd",
  fhd: "ep_res_fhd",
  uhd4k: "ep_res_4k",
  uhd8k: "ep_res_8k",
};

export const EP_RESOLUTION_SEARCH: Record<EpResolutionKey, string> = {
  hd: "HD",
  fhd: "Full HD",
  uhd4k: "4K Ultra HD",
  uhd8k: "8K",
};

export const EP_DISPLAY_TECH_KEYS = ["led", "oled", "qled", "smart"] as const;
export type EpDisplayTechKey = (typeof EP_DISPLAY_TECH_KEYS)[number];

export const EP_DISPLAY_TECH_LABEL_KEY: Record<EpDisplayTechKey, string> = {
  led: "ep_tech_led",
  oled: "ep_tech_oled",
  qled: "ep_tech_qled",
  smart: "ep_tech_smart",
};

export const EP_DISPLAY_TECH_SEARCH: Record<EpDisplayTechKey, string> = {
  led: "LED",
  oled: "OLED",
  qled: "QLED",
  smart: "Smart TV",
};

export const EP_CONSOLE_KEYS = [
  "ps5",
  "ps4",
  "xbox_series",
  "xbox_one",
  "switch",
  "pc",
] as const;
export type EpConsoleKey = (typeof EP_CONSOLE_KEYS)[number];

export const EP_CONSOLE_LABEL_KEY: Record<EpConsoleKey, string> = {
  ps5: "ep_console_ps5",
  ps4: "ep_console_ps4",
  xbox_series: "ep_console_xbox_series",
  xbox_one: "ep_console_xbox_one",
  switch: "ep_console_switch",
  pc: "ep_console_pc",
};

export const EP_CONSOLE_SEARCH: Record<EpConsoleKey, string> = {
  ps5: "PlayStation 5",
  ps4: "PlayStation 4",
  xbox_series: "Xbox Series X S",
  xbox_one: "Xbox One",
  switch: "Nintendo Switch",
  pc: "PC Gaming",
};

export const EP_GAME_ITEM_KEYS = ["konzola", "lojera", "kontroller", "kufje", "timon"] as const;
export type EpGameItemKey = (typeof EP_GAME_ITEM_KEYS)[number];

export const EP_GAME_ITEM_LABEL_KEY: Record<EpGameItemKey, string> = {
  konzola: "ep_game_konzola",
  lojera: "ep_game_lojera",
  kontroller: "ep_game_kontroller",
  kufje: "ep_game_kufje",
  timon: "ep_game_timon",
};

export const EP_GAME_ITEM_SEARCH: Record<EpGameItemKey, string> = {
  konzola: "Konzolë",
  lojera: "Lojëra CD Digital",
  kontroller: "Gjojstikë",
  kufje: "Kufje Gaming",
  timon: "Timon",
};

export const EP_STORAGE_KEYS = ["gb500", "gb1tb", "gb2tb"] as const;
export type EpStorageKey = (typeof EP_STORAGE_KEYS)[number];

export const EP_STORAGE_LABEL_KEY: Record<EpStorageKey, string> = {
  gb500: "ep_storage_500",
  gb1tb: "ep_storage_1tb",
  gb2tb: "ep_storage_2tb",
};

export const EP_STORAGE_SEARCH: Record<EpStorageKey, string> = {
  gb500: "500GB",
  gb1tb: "1TB",
  gb2tb: "2TB",
};

export const EP_AUDIO_KIND_KEYS = [
  "altoparlante",
  "soundbar",
  "subwoofer",
  "kufje",
  "sound_system",
] as const;
export type EpAudioKindKey = (typeof EP_AUDIO_KIND_KEYS)[number];

export const EP_AUDIO_KIND_LABEL_KEY: Record<EpAudioKindKey, string> = {
  altoparlante: "ep_audio_alto",
  soundbar: "ep_audio_soundbar",
  subwoofer: "ep_audio_sub",
  kufje: "ep_audio_kufje",
  sound_system: "ep_audio_pro",
};

export const EP_AUDIO_KIND_SEARCH: Record<EpAudioKindKey, string> = {
  altoparlante: "Altoparlantë Vuferë",
  soundbar: "Soundbar",
  subwoofer: "Sabvufer Përforcues",
  kufje: "Kufje Wireless Bluetooth",
  sound_system: "Sound System profesional",
};

export const EP_CAMERA_KIND_KEYS = [
  "dslr",
  "mirrorless",
  "cctv",
  "drone",
  "smartwatch",
  "aksesore",
] as const;
export type EpCameraKindKey = (typeof EP_CAMERA_KIND_KEYS)[number];

export const EP_CAMERA_KIND_LABEL_KEY: Record<EpCameraKindKey, string> = {
  dslr: "ep_cam_dslr",
  mirrorless: "ep_cam_mirrorless",
  cctv: "ep_cam_cctv",
  drone: "ep_cam_drone",
  smartwatch: "ep_cam_smartwatch",
  aksesore: "ep_cam_aksesore",
};

export const EP_CAMERA_KIND_SEARCH: Record<EpCameraKindKey, string> = {
  dslr: "Kamera DSLR",
  mirrorless: "Kamera Mirrorless",
  cctv: "Kamera Sigurie CCTV",
  drone: "Drone",
  smartwatch: "Smart Watch Band",
  aksesore: "Objektivë Stativë Karta memorie",
};

export const EP_CONDITION_KEYS = ["new_pack", "used", "damaged"] as const;
export type EpConditionKey = (typeof EP_CONDITION_KEYS)[number];

export const EP_CONDITION_LABEL_KEY: Record<EpConditionKey, string> = {
  new_pack: "ep_cond_new",
  used: "ep_cond_used",
  damaged: "ep_cond_damaged",
};

export const EP_CONDITION_SEARCH: Record<EpConditionKey, string> = {
  new_pack: "I ri Në paketim",
  used: "I përdorur",
  damaged: "I dëmtuar",
};

export const EP_BRAND_KEYS = [
  "samsung",
  "lg",
  "sony",
  "apple",
  "bosch",
  "beko",
  "philips",
  "gorenje",
  "midea",
  "other",
] as const;
export type EpBrandKey = (typeof EP_BRAND_KEYS)[number];

export const EP_BRAND_LABEL_KEY: Record<EpBrandKey, string> = {
  samsung: "ep_brand_samsung",
  lg: "ep_brand_lg",
  sony: "ep_brand_sony",
  apple: "ep_brand_apple",
  bosch: "ep_brand_bosch",
  beko: "ep_brand_beko",
  philips: "ep_brand_philips",
  gorenje: "ep_brand_gorenje",
  midea: "ep_brand_midea",
  other: "ep_brand_other",
};

export const EP_BRAND_SEARCH: Record<EpBrandKey, string> = {
  samsung: "Samsung",
  lg: "LG",
  sony: "Sony",
  apple: "Apple",
  bosch: "Bosch",
  beko: "Beko",
  philips: "Philips",
  gorenje: "Gorenje",
  midea: "Midea",
  other: "Tjetër",
};

export const EP_WARRANTY_SEARCH = "Garanci e vlefshme";

export {
  LOKALE_ZYRE_CITY_KEYS as EP_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY as EP_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH as EP_CITY_SEARCH,
  type LokaleCityKey as EpCityKey,
} from "@/lib/lokale-zyre-search-helpers";

export type TvElektronikeCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getTvElektronikeLeafCategoryIds(
  categories: TvElektronikeCategoryRow[],
  hubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === hubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("tv-type-"),
    )
    .map((c) => c.id);
}

export function resolveTvElektronikeTypeCategoryId(
  categories: TvElektronikeCategoryRow[],
  hubId: number,
  typeKey: EpTypeKey,
): number | undefined {
  const slug = EP_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
