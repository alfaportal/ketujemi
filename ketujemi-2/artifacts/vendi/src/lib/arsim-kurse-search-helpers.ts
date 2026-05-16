/** Arsim & Kurse hub slug (matches seeded category). */
export const ARSIM_KURSE_HUB_SLUG = "arsim-kurse";

export const ARSIM_KURSE_HERO_PHOTO =
  "https://images.pexels.com/photos/5212342/pexels-photo-5212342.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const AK_TYPE_KEYS = [
  "gjuhe_huaja",
  "mesime_private",
  "kurse_prof",
  "trajnime_it",
] as const;

export type AkTypeKey = (typeof AK_TYPE_KEYS)[number];

export const AK_TYPE_DB_SLUG: Record<AkTypeKey, string> = {
  gjuhe_huaja: "arsim-type-gjuhe-huaja",
  mesime_private: "arsim-type-mesime-private",
  kurse_prof: "arsim-type-kurse-prof",
  trajnime_it: "arsim-type-trajnime-it",
};

export const AK_TYPE_PHOTOS: Record<AkTypeKey, string> = {
  gjuhe_huaja:
    "https://images.pexels.com/photos/5212342/pexels-photo-5212342.jpeg?auto=compress&cs=tinysrgb&w=400",
  mesime_private:
    "https://images.pexels.com/photos/5905702/pexels-photo-5905702.jpeg?auto=compress&cs=tinysrgb&w=400",
  kurse_prof:
    "https://images.pexels.com/photos/6140102/pexels-photo-6140102.jpeg?auto=compress&cs=tinysrgb&w=400",
  trajnime_it:
    "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const AK_TYPE_LABEL_KEY: Record<AkTypeKey, string> = {
  gjuhe_huaja: "ak_type_gjuhe",
  mesime_private: "ak_type_mesime",
  kurse_prof: "ak_type_prof",
  trajnime_it: "ak_type_it",
};

export const AK_LANG_KEYS = [
  "angleze",
  "gjermane",
  "frence",
  "italiane",
  "spanjolle",
  "tjeter",
] as const;
export type AkLangKey = (typeof AK_LANG_KEYS)[number];

export const AK_LANG_LABEL_KEY: Record<AkLangKey, string> = {
  angleze: "ak_lang_en",
  gjermane: "ak_lang_de",
  frence: "ak_lang_fr",
  italiane: "ak_lang_it",
  spanjolle: "ak_lang_es",
  tjeter: "ak_lang_other",
};

export const AK_LANG_SEARCH: Record<AkLangKey, string> = {
  angleze: "Angleze",
  gjermane: "Gjermane",
  frence: "Frënge",
  italiane: "Italiane",
  spanjolle: "Spanjolle",
  tjeter: "Gjuhë",
};

export const AK_LEVEL_KEYS = [
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
  "c2",
  "femije",
] as const;
export type AkLevelKey = (typeof AK_LEVEL_KEYS)[number];

export const AK_LEVEL_LABEL_KEY: Record<AkLevelKey, string> = {
  a1: "ak_lvl_a1",
  a2: "ak_lvl_a2",
  b1: "ak_lvl_b1",
  b2: "ak_lvl_b2",
  c1: "ak_lvl_c1",
  c2: "ak_lvl_c2",
  femije: "ak_lvl_kids",
};

export const AK_LEVEL_SEARCH: Record<AkLevelKey, string> = {
  a1: "A1",
  a2: "A2",
  b1: "B1",
  b2: "B2",
  c1: "C1",
  c2: "C2",
  femije: "Fëmijë",
};

export const AK_FORMAT_KEYS = ["fizikisht", "online"] as const;
export type AkFormatKey = (typeof AK_FORMAT_KEYS)[number];

export const AK_FORMAT_LABEL_KEY: Record<AkFormatKey, string> = {
  fizikisht: "ak_fmt_inperson",
  online: "ak_fmt_online",
};

export const AK_FORMAT_SEARCH: Record<AkFormatKey, string> = {
  fizikisht: "Në klasë",
  online: "Online",
};

export const AK_SUBJECT_KEYS = [
  "matematike",
  "fizike",
  "kimi",
  "biologji",
  "gjuhe_shqipe",
  "ndihme_filloriste",
] as const;
export type AkSubjectKey = (typeof AK_SUBJECT_KEYS)[number];

export const AK_SUBJECT_LABEL_KEY: Record<AkSubjectKey, string> = {
  matematike: "ak_sub_math",
  fizike: "ak_sub_physics",
  kimi: "ak_sub_chem",
  biologji: "ak_sub_bio",
  gjuhe_shqipe: "ak_sub_albanian",
  ndihme_filloriste: "ak_sub_primary",
};

export const AK_SUBJECT_SEARCH: Record<AkSubjectKey, string> = {
  matematike: "Matematikë",
  fizike: "Fizikë",
  kimi: "Kimi",
  biologji: "Biologji",
  gjuhe_shqipe: "Gjuhë Shqipe",
  ndihme_filloriste: "Filloristë",
};

export const AK_CYCLE_KEYS = [
  "fillore",
  "mesme",
  "fakultet",
  "mature",
] as const;
export type AkCycleKey = (typeof AK_CYCLE_KEYS)[number];

export const AK_CYCLE_LABEL_KEY: Record<AkCycleKey, string> = {
  fillore: "ak_cycle_primary",
  mesme: "ak_cycle_secondary",
  fakultet: "ak_cycle_university",
  mature: "ak_cycle_maturity",
};

export const AK_CYCLE_SEARCH: Record<AkCycleKey, string> = {
  fillore: "Shkollë Fillore",
  mesme: "Shkollë e Mesme",
  fakultet: "Fakultet",
  mature: "Maturë",
};

export const AK_PROF_DIR_KEYS = [
  "kontabilitet",
  "marketing",
  "dizajn",
  "bukuri",
  "fotografi",
] as const;
export type AkProfDirKey = (typeof AK_PROF_DIR_KEYS)[number];

export const AK_PROF_DIR_LABEL_KEY: Record<AkProfDirKey, string> = {
  kontabilitet: "ak_dir_accounting",
  marketing: "ak_dir_marketing",
  dizajn: "ak_dir_design",
  bukuri: "ak_dir_beauty",
  fotografi: "ak_dir_photo",
};

export const AK_PROF_DIR_SEARCH: Record<AkProfDirKey, string> = {
  kontabilitet: "Kontabilitet",
  marketing: "Marketing Digjital",
  dizajn: "Dizajn Grafik",
  bukuri: "Kurse Bukurie",
  fotografi: "Fotografi",
};

export const AK_IT_DIR_KEYS = ["programim", "qa", "rrjeta", "uiux"] as const;
export type AkItDirKey = (typeof AK_IT_DIR_KEYS)[number];

export const AK_IT_DIR_LABEL_KEY: Record<AkItDirKey, string> = {
  programim: "ak_dir_programming",
  qa: "ak_dir_qa",
  rrjeta: "ak_dir_network",
  uiux: "ak_dir_uiux",
};

export const AK_IT_DIR_SEARCH: Record<AkItDirKey, string> = {
  programim: "Programim",
  qa: "QA Testing",
  rrjeta: "Cyber Security",
  uiux: "UI/UX",
};

export type ArsimKurseCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getArsimKurseLeafCategoryIds(
  categories: ArsimKurseCategoryRow[],
  hubId: number,
): number[] {
  return categories.filter((c) => c.parent_id === hubId).map((c) => c.id);
}

export function resolveArsimTypeCategoryId(
  categories: ArsimKurseCategoryRow[],
  hubId: number,
  typeKey: AkTypeKey,
): number | undefined {
  const slug = AK_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
