/** Muzikë & Hobby hub slug (matches seeded category). */
export const MUZIKE_HOBBY_HUB_SLUG = "muzike-hobby";

export const MUZIKE_HOBBY_HERO_PHOTO =
  "https://images.pexels.com/photos/210764/pexels-photo-210764.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const MH_TYPE_KEYS = [
  "frymore",
  "tela",
  "tastiere",
  "studio",
  "libra",
  "art_teater",
] as const;

export type MhTypeKey = (typeof MH_TYPE_KEYS)[number];

export const MH_TYPE_DB_SLUG: Record<MhTypeKey, string> = {
  frymore: "muzike-type-frymore",
  tela: "muzike-type-tela",
  tastiere: "muzike-type-tastiere",
  studio: "muzike-type-studio",
  libra: "muzike-type-libra",
  art_teater: "muzike-type-art-teater-film",
};

export const MH_TYPE_PHOTOS: Record<MhTypeKey, string> = {
  frymore:
    "https://images.pexels.com/photos/210764/pexels-photo-210764.jpeg?auto=compress&cs=tinysrgb&w=400",
  tela:
    "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400",
  tastiere:
    "https://images.pexels.com/photos/164935/pexels-photo-164935.jpeg?auto=compress&cs=tinysrgb&w=400",
  studio:
    "https://images.pexels.com/photos/4253570/pexels-photo-4253570.jpeg?auto=compress&cs=tinysrgb&w=400",
  libra:
    "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400",
  art_teater:
    "https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const MH_TYPE_LABEL_KEY: Record<MhTypeKey, string> = {
  frymore: "mh_type_frymore",
  tela: "mh_type_tela",
  tastiere: "mh_type_tastiere",
  studio: "mh_type_studio",
  libra: "mh_type_libra",
  art_teater: "mh_type_art_teater",
};

export const MH_WIND_KEYS = [
  "saksofon",
  "klarinete",
  "flaut",
  "trombe",
  "trombon",
  "harmonike",
] as const;
export type MhWindKey = (typeof MH_WIND_KEYS)[number];

export const MH_WIND_LABEL_KEY: Record<MhWindKey, string> = {
  saksofon: "mh_wnd_saksofon",
  klarinete: "mh_wnd_klarinete",
  flaut: "mh_wnd_flaut",
  trombe: "mh_wnd_trombe",
  trombon: "mh_wnd_trombon",
  harmonike: "mh_wnd_harmonike",
};

export const MH_WIND_SEARCH: Record<MhWindKey, string> = {
  saksofon: "Saksofon",
  klarinete: "Klarinetë",
  flaut: "Flaut Fyell",
  trombe: "Trombë Trumpetë",
  trombon: "Trombon",
  harmonike: "Harmonikë goje",
};

export const MH_WIND_CHECK_KEYS = ["cante", "pipeza", "pastrim"] as const;
export type MhWindCheckKey = (typeof MH_WIND_CHECK_KEYS)[number];

export const MH_WIND_CHECK_LABEL_KEY: Record<MhWindCheckKey, string> = {
  cante: "mh_wnd_cante",
  pipeza: "mh_wnd_pipeza",
  pastrim: "mh_wnd_pastrim",
};

export const MH_WIND_CHECK_SEARCH: Record<MhWindCheckKey, string> = {
  cante: "Çantë mbajtëse",
  pipeza: "Pipëza Mustuk",
  pastrim: "Pajisje pastrimi",
};

export const MH_STRING_KEYS = [
  "kitare_akustike",
  "kitare_elektrike",
  "violin",
  "cifteli",
  "mandoline",
] as const;
export type MhStringKey = (typeof MH_STRING_KEYS)[number];

export const MH_STRING_LABEL_KEY: Record<MhStringKey, string> = {
  kitare_akustike: "mh_str_kitare_akustike",
  kitare_elektrike: "mh_str_kitare_elektrike",
  violin: "mh_str_violin",
  cifteli: "mh_str_cifteli",
  mandoline: "mh_str_mandoline",
};

export const MH_STRING_SEARCH: Record<MhStringKey, string> = {
  kitare_akustike: "Kitarë Akustike Klasike",
  kitare_elektrike: "Kitarë Elektrike Bas",
  violin: "Violinë Violonçelo",
  cifteli: "Çifteli Sharki",
  mandoline: "Mandolinë Ukulele",
};

export const MH_STRING_CHECK_KEYS = ["amp", "tela_rezerve", "cante", "pedale"] as const;
export type MhStringCheckKey = (typeof MH_STRING_CHECK_KEYS)[number];

export const MH_STRING_CHECK_LABEL_KEY: Record<MhStringCheckKey, string> = {
  amp: "mh_str_amp",
  tela_rezerve: "mh_str_tela",
  cante: "mh_str_cante",
  pedale: "mh_str_pedale",
};

export const MH_STRING_CHECK_SEARCH: Record<MhStringCheckKey, string> = {
  amp: "Amplifier Shpuzë",
  tela_rezerve: "Tela rezervë",
  cante: "Çantë instrument",
  pedale: "Efekte Pedale",
};

export const MH_KEY_KEYS = [
  "piano_akustike",
  "piano_digjital",
  "sintetizator",
  "harmonike",
  "midi",
] as const;
export type MhKeyKey = (typeof MH_KEY_KEYS)[number];

export const MH_KEY_LABEL_KEY: Record<MhKeyKey, string> = {
  piano_akustike: "mh_key_piano_akustike",
  piano_digjital: "mh_key_piano_digjital",
  sintetizator: "mh_key_sintetizator",
  harmonike: "mh_key_harmonike",
  midi: "mh_key_midi",
};

export const MH_KEY_SEARCH: Record<MhKeyKey, string> = {
  piano_akustike: "Piano Akustike Muri",
  piano_digjital: "Piano Digjitale Elektrike",
  sintetizator: "Sintetizator",
  harmonike: "Harmonikë",
  midi: "MIDI Controller",
};

export const MH_KEY_ACC_KEYS = ["karrige", "pedale", "mbajtese"] as const;
export type MhKeyAccKey = (typeof MH_KEY_ACC_KEYS)[number];

export const MH_KEY_ACC_LABEL_KEY: Record<MhKeyAccKey, string> = {
  karrige: "mh_acc_karrige",
  pedale: "mh_acc_pedale",
  mbajtese: "mh_acc_mbajtese",
};

export const MH_KEY_ACC_SEARCH: Record<MhKeyAccKey, string> = {
  karrige: "Karrige piano",
  pedale: "Pedale",
  mbajtese: "Mbajtëse Stallak",
};

export const MH_STUDIO_KEYS = [
  "mikrofon",
  "karte_zeri",
  "monitor",
  "kufje",
  "mikser",
  "izolim",
] as const;
export type MhStudioKey = (typeof MH_STUDIO_KEYS)[number];

export const MH_STUDIO_LABEL_KEY: Record<MhStudioKey, string> = {
  mikrofon: "mh_stu_mikrofon",
  karte_zeri: "mh_stu_karte",
  monitor: "mh_stu_monitor",
  kufje: "mh_stu_kufje",
  mikser: "mh_stu_mikser",
  izolim: "mh_stu_izolim",
};

export const MH_STUDIO_SEARCH: Record<MhStudioKey, string> = {
  mikrofon: "Mikrofona Kondenzator Dinamik",
  karte_zeri: "Kartë Zëri Audio Interface",
  monitor: "Monitorë Studio",
  kufje: "Kufje Studio",
  mikser: "Mikser Zëri DJ",
  izolim: "Izolim Akustik",
};

export const MH_GENRE_KEYS = [
  "romane",
  "shkencore",
  "femije",
  "zhvillim",
  "gjuhe",
  "historike",
] as const;
export type MhGenreKey = (typeof MH_GENRE_KEYS)[number];

export const MH_GENRE_LABEL_KEY: Record<MhGenreKey, string> = {
  romane: "mh_gen_romane",
  shkencore: "mh_gen_shkencore",
  femije: "mh_gen_femije",
  zhvillim: "mh_gen_zhvillim",
  gjuhe: "mh_gen_gjuhe",
  historike: "mh_gen_historike",
};

export const MH_GENRE_SEARCH: Record<MhGenreKey, string> = {
  romane: "Romane Letërsi Botërore",
  shkencore: "Libra Shkencorë Universitarë",
  femije: "Libra Fëmijë Shkollë",
  zhvillim: "Zhvillim Personal Biznes",
  gjuhe: "Gjuhë Huaja Fjalorë",
  historike: "Libra Historikë Kombëtarë",
};

export const MH_LANG_KEYS = ["shqip", "anglisht", "gjermanisht", "frengjisht", "tjeter"] as const;
export type MhLangKey = (typeof MH_LANG_KEYS)[number];

export const MH_LANG_LABEL_KEY: Record<MhLangKey, string> = {
  shqip: "mh_lang_shqip",
  anglisht: "mh_lang_anglisht",
  gjermanisht: "mh_lang_gjermanisht",
  frengjisht: "mh_lang_frengjisht",
  tjeter: "mh_lang_tjeter",
};

export const MH_LANG_SEARCH: Record<MhLangKey, string> = {
  shqip: "Shqip",
  anglisht: "Anglisht",
  gjermanisht: "Gjermanisht",
  frengjisht: "Frëngjisht",
  tjeter: "Gjuhë tjetër",
};

export const MH_COVER_KEYS = ["soft", "hard"] as const;
export type MhCoverKey = (typeof MH_COVER_KEYS)[number];

export const MH_COVER_LABEL_KEY: Record<MhCoverKey, string> = {
  soft: "mh_cover_soft",
  hard: "mh_cover_hard",
};

export const MH_COVER_SEARCH: Record<MhCoverKey, string> = {
  soft: "Kopertinë e butë",
  hard: "Kopertinë e fortë",
};

export const MH_CONDITION_KEYS = ["new", "used"] as const;
export type MhConditionKey = (typeof MH_CONDITION_KEYS)[number];

export const MH_CONDITION_LABEL_KEY: Record<MhConditionKey, string> = {
  new: "mh_cond_new",
  used: "mh_cond_used",
};

export const MH_CONDITION_SEARCH: Record<MhConditionKey, string> = {
  new: "E re",
  used: "E përdorur",
};

export const MH_EXCHANGE_SEARCH = "Ndërrohet";

export const MH_ART_SERVICE_KEYS = [
  "akter",
  "regjisor",
  "statist",
  "animator",
  "pikture",
  "valle",
  "foto_video",
  "scenografi",
] as const;
export type MhArtServiceKey = (typeof MH_ART_SERVICE_KEYS)[number];

export const MH_ART_SERVICE_LABEL_KEY: Record<MhArtServiceKey, string> = {
  akter: "mh_art_akter",
  regjisor: "mh_art_regjisor",
  statist: "mh_art_statist",
  animator: "mh_art_animator",
  pikture: "mh_art_pikture",
  valle: "mh_art_valle",
  foto_video: "mh_art_foto",
  scenografi: "mh_art_scenografi",
};

export const MH_ART_SERVICE_SEARCH: Record<MhArtServiceKey, string> = {
  akter: "Aktorë Aktore Teatër Film",
  regjisor: "Regjisorë Skenaristë Producentë",
  statist: "Statistë Videoklipe Filma",
  animator: "Animatorë Performues",
  pikture: "Pikturë Skulpturë Vizatim",
  valle: "Vallëzim Balet Koreografi",
  foto_video: "Fotografë Videografë Arti",
  scenografi: "Skenografi Kostumografi",
};

export const MH_ART_PURPOSE_KEYS = ["kerkohet", "ofrohet"] as const;
export type MhArtPurposeKey = (typeof MH_ART_PURPOSE_KEYS)[number];

export const MH_ART_PURPOSE_LABEL_KEY: Record<MhArtPurposeKey, string> = {
  kerkohet: "mh_art_purp_kerkohet",
  ofrohet: "mh_art_purp_ofrohet",
};

export const MH_ART_PURPOSE_SEARCH: Record<MhArtPurposeKey, string> = {
  kerkohet: "Kërkon Angazhim",
  ofrohet: "Ofron Shërbim",
};

export const MH_ART_EXP_KEYS = ["fillestar", "gjysme_prof", "profesional"] as const;
export type MhArtExpKey = (typeof MH_ART_EXP_KEYS)[number];

export const MH_ART_EXP_LABEL_KEY: Record<MhArtExpKey, string> = {
  fillestar: "mh_art_exp_fillestar",
  gjysme_prof: "mh_art_exp_gjysme",
  profesional: "mh_art_exp_prof",
};

export const MH_ART_EXP_SEARCH: Record<MhArtExpKey, string> = {
  fillestar: "Fillestar Amator",
  gjysme_prof: "Gjysmë-profesional",
  profesional: "Profesional Diplomuar",
};

export const MH_ART_GENDER_KEYS = ["mashkull", "femer", "unisex"] as const;
export type MhArtGenderKey = (typeof MH_ART_GENDER_KEYS)[number];

export const MH_ART_GENDER_LABEL_KEY: Record<MhArtGenderKey, string> = {
  mashkull: "mh_art_gender_m",
  femer: "mh_art_gender_f",
  unisex: "mh_art_gender_unisex",
};

export const MH_ART_GENDER_SEARCH: Record<MhArtGenderKey, string> = {
  mashkull: "Mashkull",
  femer: "Femër",
  unisex: "Unisex",
};

export const MH_ART_AGE_KEYS = ["femije", "rini", "te_rritur", "te_moshuar"] as const;
export type MhArtAgeKey = (typeof MH_ART_AGE_KEYS)[number];

export const MH_ART_AGE_LABEL_KEY: Record<MhArtAgeKey, string> = {
  femije: "mh_art_age_femije",
  rini: "mh_art_age_rini",
  te_rritur: "mh_art_age_rritur",
  te_moshuar: "mh_art_age_moshuar",
};

export const MH_ART_AGE_SEARCH: Record<MhArtAgeKey, string> = {
  femije: "Fëmijë",
  rini: "Rini",
  te_rritur: "Të rritur",
  te_moshuar: "Të moshuar",
};

export {
  LOKALE_ZYRE_CITY_KEYS as MH_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY as MH_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH as MH_CITY_SEARCH,
  type LokaleCityKey as MhCityKey,
} from "@/lib/lokale-zyre-search-helpers";

export type MuzikeHobbyCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getMuzikeHobbyLeafCategoryIds(
  categories: MuzikeHobbyCategoryRow[],
  hubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === hubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("muzike-type-"),
    )
    .map((c) => c.id);
}

export function resolveMuzikeHobbyTypeCategoryId(
  categories: MuzikeHobbyCategoryRow[],
  hubId: number,
  typeKey: MhTypeKey,
): number | undefined {
  const slug = MH_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
