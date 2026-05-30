/** Punë & Shërbime hub slug (matches seeded category). */
export const PUNE_SHERBIME_HUB_SLUG = "pune-sherbime";

export const PUNE_SHERBIME_HERO_PHOTO =
  "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const PS_TYPE_KEYS = [
  "administrate",
  "it_dizajn",
  "ndertimtari",
  "zejtari",
  "gastronomi",
  "marketing",
  "transporti",
  "shendet_kujdes",
  "pastrim_mirembajtje",
  "sherbime_te_tjera",
] as const;

export type PsTypeKey = (typeof PS_TYPE_KEYS)[number];

export const PS_TYPE_DB_SLUG: Record<PsTypeKey, string> = {
  administrate: "pune-type-administrate",
  it_dizajn: "pune-type-it-dizajn",
  ndertimtari: "pune-type-ndertimtari",
  zejtari: "pune-type-zejtari",
  gastronomi: "pune-type-gastronomi",
  marketing: "pune-type-marketing",
  transporti: "pune-type-transporti",
  shendet_kujdes: "pune-type-shendet-kujdes",
  pastrim_mirembajtje: "pune-type-pastrim-mirembajtje",
  sherbime_te_tjera: "pune-type-sherbime-te-tjera",
};

export const PS_TYPE_PHOTOS: Record<PsTypeKey, string> = {
  administrate:
    "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400",
  it_dizajn:
    "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400",
  ndertimtari:
    "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=400",
  zejtari:
    "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400",
  gastronomi:
    "https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=400",
  marketing:
    "https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=400",
  transporti:
    "https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=400",
  shendet_kujdes:
    "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=400",
  pastrim_mirembajtje:
    "https://images.pexels.com/photos/48889/pexels-photo-48889.jpeg?auto=compress&cs=tinysrgb&w=400",
  sherbime_te_tjera:
    "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const PS_TYPE_LABEL_KEY: Record<PsTypeKey, string> = {
  administrate: "ps_type_administrate",
  it_dizajn: "ps_type_it",
  ndertimtari: "ps_type_ndertimtari",
  zejtari: "ps_type_zejtari",
  gastronomi: "ps_type_gastronomi",
  marketing: "ps_type_marketing",
  transporti: "ps_type_transporti",
  shendet_kujdes: "ps_type_shendet_kujdes",
  pastrim_mirembajtje: "ps_type_pastrim_mirembajtje",
  sherbime_te_tjera: "ps_type_sherbime_te_tjera",
};

export const PS_EXTRA_TYPE_KEYS = [
  "shendet_kujdes",
  "pastrim_mirembajtje",
  "sherbime_te_tjera",
] as const;
export type PsExtraTypeKey = (typeof PS_EXTRA_TYPE_KEYS)[number];

export function isPsExtraTypeKey(key: PsTypeKey): key is PsExtraTypeKey {
  return (PS_EXTRA_TYPE_KEYS as readonly string[]).includes(key);
}

export const PS_SHENDET_KEYS = [
  "infermier_shtepi",
  "fizioterapi",
  "psikolog_terapeut",
  "kujdes_moshuar",
  "babysitter",
] as const;
export type PsShendetKey = (typeof PS_SHENDET_KEYS)[number];

export const PS_SHENDET_LABEL_KEY: Record<PsShendetKey, string> = {
  infermier_shtepi: "ps_sh_infermier_shtepi",
  fizioterapi: "ps_sh_fizioterapi",
  psikolog_terapeut: "ps_sh_psikolog_terapeut",
  kujdes_moshuar: "ps_sh_kujdes_moshuar",
  babysitter: "ps_sh_babysitter",
};

export const PS_SHENDET_DB_SLUG: Record<PsShendetKey, string> = {
  infermier_shtepi: "pune-leaf-infermier-kujdes-shtepi",
  fizioterapi: "pune-leaf-fizioterapi",
  psikolog_terapeut: "pune-leaf-psikolog-terapeut",
  kujdes_moshuar: "pune-leaf-kujdes-te-moshuarit",
  babysitter: "pune-leaf-babysitter-kujdes-femijesh",
};

export const PS_PASTRIM_KEYS = [
  "pastrim_banesash",
  "pastrim_ndertimi",
  "pastrim_xhamash",
  "dezinfektim",
  "kopshte_oborr",
] as const;
export type PsPastrimKey = (typeof PS_PASTRIM_KEYS)[number];

export const PS_PASTRIM_LABEL_KEY: Record<PsPastrimKey, string> = {
  pastrim_banesash: "ps_pa_pastrim_banesash",
  pastrim_ndertimi: "ps_pa_pastrim_ndertimi",
  pastrim_xhamash: "ps_pa_pastrim_xhamash",
  dezinfektim: "ps_pa_dezinfektim",
  kopshte_oborr: "ps_pa_kopshte_oborr",
};

export const PS_PASTRIM_DB_SLUG: Record<PsPastrimKey, string> = {
  pastrim_banesash: "pune-leaf-pastrim-banesash",
  pastrim_ndertimi: "pune-leaf-pastrim-pas-ndertimit",
  pastrim_xhamash: "pune-leaf-pastrim-xhamash",
  dezinfektim: "pune-leaf-dezinfektim-dezinsektim",
  kopshte_oborr: "pune-leaf-mirembajtje-kopshtesh-oborresh",
};

export const PS_SHERBIME_KEYS = [
  "riparim_pajisje",
  "riparim_telefona",
  "fotokopje",
  "noteriale",
  "lirim_banesash",
] as const;
export type PsSherbimeKey = (typeof PS_SHERBIME_KEYS)[number];

export const PS_SHERBIME_LABEL_KEY: Record<PsSherbimeKey, string> = {
  riparim_pajisje: "ps_st_riparim_pajisje",
  riparim_telefona: "ps_st_riparim_telefona",
  fotokopje: "ps_st_fotokopje",
  noteriale: "ps_st_noteriale",
  lirim_banesash: "ps_st_lirim_banesash",
};

export const PS_SHERBIME_DB_SLUG: Record<PsSherbimeKey, string> = {
  riparim_pajisje: "pune-leaf-riparim-pajisje-shtepiake",
  riparim_telefona: "pune-leaf-riparim-telefona-laptop",
  fotokopje: "pune-leaf-fotokopje-shtypshkrim",
  noteriale: "pune-leaf-sherbime-noteriale-juridike",
  lirim_banesash: "pune-leaf-lirim-banesash-zyrash",
};

export const PS_ADMIN_KEYS = [
  "kontabilitet",
  "juridike",
  "hr",
  "asistent",
  "konsulence",
] as const;
export type PsAdminKey = (typeof PS_ADMIN_KEYS)[number];

export const PS_ADMIN_LABEL_KEY: Record<PsAdminKey, string> = {
  kontabilitet: "ps_adm_kontabilitet",
  juridike: "ps_adm_juridike",
  hr: "ps_adm_hr",
  asistent: "ps_adm_asistent",
  konsulence: "ps_adm_konsulence",
};

export const PS_ADMIN_SEARCH: Record<PsAdminKey, string> = {
  kontabilitet: "Kontabilitet Financa",
  juridike: "Shërbime Juridike Avokati",
  hr: "Burime Njerëzore HR",
  asistent: "Asistent Administrative",
  konsulence: "Konsulencë Biznesi",
};

export const PS_IT_KEYS = [
  "programim",
  "grafik",
  "uiux",
  "video",
  "rrjete",
] as const;
export type PsItKey = (typeof PS_IT_KEYS)[number];

export const PS_IT_LABEL_KEY: Record<PsItKey, string> = {
  programim: "ps_it_programim",
  grafik: "ps_it_grafik",
  uiux: "ps_it_uiux",
  video: "ps_it_video",
  rrjete: "ps_it_rrjete",
};

export const PS_IT_SEARCH: Record<PsItKey, string> = {
  programim: "Programim Zhvillim",
  grafik: "Grafik Dizajn",
  uiux: "UI UX Dizajn",
  video: "Editim Video Animacion",
  rrjete: "Mirëmbajtje Rrjetesh Serverësh",
};

export const PS_BUILD_KEYS = [
  "that",
  "moler",
  "keramike",
  "eperm",
  "arkitekture",
  "oborr",
] as const;
export type PsBuildKey = (typeof PS_BUILD_KEYS)[number];

export const PS_BUILD_LABEL_KEY: Record<PsBuildKey, string> = {
  that: "ps_bld_that",
  moler: "ps_bld_moler",
  keramike: "ps_bld_keramike",
  eperm: "ps_bld_eperm",
  arkitekture: "ps_bld_arkitekture",
  oborr: "ps_bld_oborr",
};

export const PS_BUILD_SEARCH: Record<PsBuildKey, string> = {
  that: "Ndërtim i Thatë Knauf Gips",
  moler: "Punë Molere",
  keramike: "Keramikë Shtrim dysheme",
  eperm: "Ndërtim i Epërm Kulm Betonim",
  arkitekture: "Arkitekturë Dizajn i Brendshëm",
  oborr: "Rregullim Oborresh",
};

export const PS_CRAFT_KEYS = [
  "elektrike",
  "vodoinstalime",
  "marangoz",
  "bravandreqes",
  "bravari",
  "servis",
] as const;
export type PsCraftKey = (typeof PS_CRAFT_KEYS)[number];

export const PS_CRAFT_LABEL_KEY: Record<PsCraftKey, string> = {
  elektrike: "ps_crf_elektrike",
  vodoinstalime: "ps_crf_vodoinstalime",
  marangoz: "ps_crf_marangoz",
  bravandreqes: "ps_crf_bravandreqes",
  bravari: "ps_crf_bravari",
  servis: "ps_crf_servis",
};

export const PS_CRAFT_SEARCH: Record<PsCraftKey, string> = {
  elektrike: "Instalime Elektrike",
  vodoinstalime: "Vodoinstalime Nxemje",
  marangoz: "Marangoz Mobilje",
  bravandreqes: "Bravandreqës Drysa",
  bravari: "Bravari Konstruksione Metali",
  servis: "Servis Pajisjesh Frigoriferë",
};

export const PS_GASTRO_KEYS = [
  "catering",
  "kuzhinier",
  "kamarier",
  "pastrim",
  "furnizim",
] as const;
export type PsGastroKey = (typeof PS_GASTRO_KEYS)[number];

export const PS_GASTRO_LABEL_KEY: Record<PsGastroKey, string> = {
  catering: "ps_gas_catering",
  kuzhinier: "ps_gas_kuzhinier",
  kamarier: "ps_gas_kamarier",
  pastrim: "ps_gas_pastrim",
  furnizim: "ps_gas_furnizim",
};

export const PS_GASTRO_SEARCH: Record<PsGastroKey, string> = {
  catering: "Catering Shërbim Ushqimi",
  kuzhinier: "Kuzhinierë Ndihmës",
  kamarier: "Kamarierë Shankistë",
  pastrim: "Pastrim Lokalesh Kuzhinash",
  furnizim: "Furnizim Pajisje Gastronomike",
};

export const PS_MKT_KEYS = [
  "social",
  "digital_ads",
  "copywriting",
  "foto_video",
  "pr_events",
] as const;
export type PsMktKey = (typeof PS_MKT_KEYS)[number];

export const PS_MKT_LABEL_KEY: Record<PsMktKey, string> = {
  social: "ps_mkt_social",
  digital_ads: "ps_mkt_digital",
  copywriting: "ps_mkt_copy",
  foto_video: "ps_mkt_foto",
  pr_events: "ps_mkt_pr",
};

export const PS_MKT_SEARCH: Record<PsMktKey, string> = {
  social: "Menaxhim Rrjetesh Sociale",
  digital_ads: "Reklamim Digjital Google Meta SEO",
  copywriting: "Copywriting Përmbajtje",
  foto_video: "Fotografi Videografi",
  pr_events: "PR Organizim Eventesh",
};

export const PS_TRANS_KEYS = [
  "mallrash",
  "kombi",
  "mobilje",
  "rent_car",
  "shlep",
  "taksi",
] as const;
export type PsTransKey = (typeof PS_TRANS_KEYS)[number];

export const PS_TRANS_LABEL_KEY: Record<PsTransKey, string> = {
  mallrash: "ps_tr_mallrash",
  kombi: "ps_tr_kombi",
  mobilje: "ps_tr_mobilje",
  rent_car: "ps_tr_rent",
  shlep: "ps_tr_shlep",
  taksi: "ps_tr_taksi",
};

export const PS_TRANS_SEARCH: Record<PsTransKey, string> = {
  mallrash: "Transport Mallrash Maune",
  kombi: "Transport me Kombi",
  mobilje: "Bartje Mobiljesh",
  rent_car: "Rent a Car Qira Veturash",
  shlep: "Auto Bartje Shlep",
  taksi: "Taksi Transport Udhëtarësh",
};

export const PS_OFFER_KEYS = ["kerkohet", "ofrohet"] as const;
export type PsOfferKey = (typeof PS_OFFER_KEYS)[number];

export const PS_OFFER_LABEL_KEY: Record<PsOfferKey, string> = {
  kerkohet: "ps_offer_kerkohet",
  ofrohet: "ps_offer_ofrohet",
};

export const PS_OFFER_SEARCH: Record<PsOfferKey, string> = {
  kerkohet: "Kërkohet Punëtor",
  ofrohet: "Ofrohet Shërbim",
};

export const PS_PAY_KEYS = ["ore", "dite", "projekt", "muaj"] as const;
export type PsPayKey = (typeof PS_PAY_KEYS)[number];

export const PS_PAY_LABEL_KEY: Record<PsPayKey, string> = {
  ore: "ps_pay_ore",
  dite: "ps_pay_dite",
  projekt: "ps_pay_projekt",
  muaj: "ps_pay_muaj",
};

export const PS_PAY_SEARCH: Record<PsPayKey, string> = {
  ore: "Me Orë",
  dite: "Me Ditë",
  projekt: "Me Projekt",
  muaj: "Pagë Mujore",
};

export {
  LOKALE_ZYRE_CITY_KEYS as PS_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY as PS_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH as PS_CITY_SEARCH,
  type LokaleCityKey as PsCityKey,
} from "@/lib/lokale-zyre-search-helpers";

export type PuneSherbimeCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getPuneSherbimeLeafCategoryIds(
  categories: PuneSherbimeCategoryRow[],
  hubId: number,
): number[] {
  const hub = Number(hubId);
  const typeRows = categories.filter(
    (c) =>
      Number(c.parent_id) === hub &&
      typeof c.slug === "string" &&
      (c.slug as string).startsWith("pune-type-"),
  );
  const typeIds = typeRows.map((c) => c.id);
  const typeIdSet = new Set(typeIds);
  const leafIds = categories
    .filter(
      (c) =>
        c.parent_id != null &&
        typeIdSet.has(Number(c.parent_id)) &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("pune-leaf-"),
    )
    .map((c) => c.id);
  return [...new Set([...typeIds, ...leafIds])];
}

export function getPuneSherbimeTypeLeafCategoryIds(
  categories: PuneSherbimeCategoryRow[],
  hubId: number,
  typeKey: PsTypeKey,
): number[] {
  const typeId = resolvePuneSherbimeTypeCategoryId(categories, hubId, typeKey);
  if (!typeId) return [];
  return categories
    .filter(
      (c) =>
        Number(c.parent_id) === typeId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("pune-leaf-"),
    )
    .map((c) => c.id);
}

export function resolvePuneSherbimeLeafCategoryIdBySlug(
  categories: PuneSherbimeCategoryRow[],
  slug: string,
): number | undefined {
  return categories.find((c) => c.slug === slug)?.id;
}

export function resolvePuneSherbimeTypeCategoryId(
  categories: PuneSherbimeCategoryRow[],
  hubId: number,
  typeKey: PsTypeKey,
): number | undefined {
  const slug = PS_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
