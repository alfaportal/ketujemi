/** Kafshë Shtëpiake hub slug (matches seeded category). */
export const KAFSHET_HUB_SLUG = "kafshet";

export const KAFSHET_HERO_PHOTO =
  "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

export const KSH_TYPE_KEYS = [
  "mace",
  "qen",
  "shpende",
  "akuariume",
  "ushqim_aksesore",
] as const;

export type KshTypeKey = (typeof KSH_TYPE_KEYS)[number];

export const KSH_TYPE_DB_SLUG: Record<KshTypeKey, string> = {
  mace: "kafshet-type-mace",
  qen: "kafshet-type-qen",
  shpende: "kafshet-type-shpende",
  akuariume: "kafshet-type-akuariume",
  ushqim_aksesore: "kafshet-type-ushqim-aksesore",
};

export const KSH_TYPE_PHOTOS: Record<KshTypeKey, string> = {
  mace:
    "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400",
  qen:
    "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400",
  shpende:
    "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=400",
  akuariume:
    "https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&cs=tinysrgb&w=400",
  ushqim_aksesore:
    "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const KSH_TYPE_LABEL_KEY: Record<KshTypeKey, string> = {
  mace: "ksh_type_mace",
  qen: "ksh_type_qen",
  shpende: "ksh_type_shpende",
  akuariume: "ksh_type_akuariume",
  ushqim_aksesore: "ksh_type_ushqim",
};

export const KSH_CAT_BREED_KEYS = [
  "britanike",
  "persiane",
  "siamese",
  "scottish",
  "bengale",
  "pa_race",
] as const;
export type KshCatBreedKey = (typeof KSH_CAT_BREED_KEYS)[number];

export const KSH_CAT_BREED_LABEL_KEY: Record<KshCatBreedKey, string> = {
  britanike: "ksh_cat_britanike",
  persiane: "ksh_cat_persiane",
  siamese: "ksh_cat_siamese",
  scottish: "ksh_cat_scottish",
  bengale: "ksh_cat_bengale",
  pa_race: "ksh_cat_pa_race",
};

export const KSH_CAT_BREED_SEARCH: Record<KshCatBreedKey, string> = {
  britanike: "Britanike",
  persiane: "Persiane",
  siamese: "Siamese",
  scottish: "Scottish Fold",
  bengale: "Bengale",
  pa_race: "Pa racë Shtëpiake",
};

export const KSH_CAT_AGE_KEYS = ["kotele", "e_re", "e_rritur"] as const;
export type KshCatAgeKey = (typeof KSH_CAT_AGE_KEYS)[number];

export const KSH_CAT_AGE_LABEL_KEY: Record<KshCatAgeKey, string> = {
  kotele: "ksh_cat_age_kotele",
  e_re: "ksh_cat_age_e_re",
  e_rritur: "ksh_cat_age_rritur",
};

export const KSH_CAT_AGE_SEARCH: Record<KshCatAgeKey, string> = {
  kotele: "Kotele 0-6 muaj",
  e_re: "E re 6-12 muaj",
  e_rritur: "E rritur 1+ vjeç",
};

export const KSH_GENDER_KEYS = ["mashkull", "femer"] as const;
export type KshGenderKey = (typeof KSH_GENDER_KEYS)[number];

export const KSH_GENDER_LABEL_KEY: Record<KshGenderKey, string> = {
  mashkull: "ksh_gender_m",
  femer: "ksh_gender_f",
};

export const KSH_GENDER_SEARCH: Record<KshGenderKey, string> = {
  mashkull: "Mashkull",
  femer: "Femër",
};

export const KSH_CAT_CHECK_KEYS = ["vaksinuar", "parazite", "libreze", "kastruar"] as const;
export type KshCatCheckKey = (typeof KSH_CAT_CHECK_KEYS)[number];

export const KSH_CAT_CHECK_LABEL_KEY: Record<KshCatCheckKey, string> = {
  vaksinuar: "ksh_cat_vaksinuar",
  parazite: "ksh_cat_parazite",
  libreze: "ksh_cat_libreze",
  kastruar: "ksh_cat_kastruar",
};

export const KSH_CAT_CHECK_SEARCH: Record<KshCatCheckKey, string> = {
  vaksinuar: "E vaksinuar",
  parazite: "E pastruar parazitë",
  libreze: "Me librezë Pasaportë",
  kastruar: "E kastruar sterilizuar",
};

export const KSH_DOG_BREED_KEYS = [
  "gjerman",
  "labrador",
  "golden",
  "pomeranian",
  "maltese",
  "pitbull",
  "husky",
  "poodle",
] as const;
export type KshDogBreedKey = (typeof KSH_DOG_BREED_KEYS)[number];

export const KSH_DOG_BREED_LABEL_KEY: Record<KshDogBreedKey, string> = {
  gjerman: "ksh_dog_gjerman",
  labrador: "ksh_dog_labrador",
  golden: "ksh_dog_golden",
  pomeranian: "ksh_dog_pomeranian",
  maltese: "ksh_dog_maltese",
  pitbull: "ksh_dog_pitbull",
  husky: "ksh_dog_husky",
  poodle: "ksh_dog_poodle",
};

export const KSH_DOG_BREED_SEARCH: Record<KshDogBreedKey, string> = {
  gjerman: "Gjerman Shepherd",
  labrador: "Labrador",
  golden: "Golden Retriever",
  pomeranian: "Pomeranian",
  maltese: "Maltese",
  pitbull: "Pitbull",
  husky: "Husky",
  poodle: "Pudëll",
};

export const KSH_DOG_AGE_KEYS = ["klysh", "i_ri", "i_rritur"] as const;
export type KshDogAgeKey = (typeof KSH_DOG_AGE_KEYS)[number];

export const KSH_DOG_AGE_LABEL_KEY: Record<KshDogAgeKey, string> = {
  klysh: "ksh_dog_age_klysh",
  i_ri: "ksh_dog_age_i_ri",
  i_rritur: "ksh_dog_age_rritur",
};

export const KSH_DOG_AGE_SEARCH: Record<KshDogAgeKey, string> = {
  klysh: "Klysh 0-6 muaj",
  i_ri: "I ri 6-12 muaj",
  i_rritur: "I rritur",
};

export const KSH_DOG_SIZE_KEYS = ["vogel", "mesme", "madhe"] as const;
export type KshDogSizeKey = (typeof KSH_DOG_SIZE_KEYS)[number];

export const KSH_DOG_SIZE_LABEL_KEY: Record<KshDogSizeKey, string> = {
  vogel: "ksh_dog_size_vogel",
  mesme: "ksh_dog_size_mesme",
  madhe: "ksh_dog_size_madhe",
};

export const KSH_DOG_SIZE_SEARCH: Record<KshDogSizeKey, string> = {
  vogel: "E vogël Mini",
  mesme: "E mesme",
  madhe: "E madhe",
};

export const KSH_DOG_CHECK_KEYS = ["pedigree", "mikrochip", "vaksinuar", "libreze"] as const;
export type KshDogCheckKey = (typeof KSH_DOG_CHECK_KEYS)[number];

export const KSH_DOG_CHECK_LABEL_KEY: Record<KshDogCheckKey, string> = {
  pedigree: "ksh_dog_pedigree",
  mikrochip: "ksh_dog_mikrochip",
  vaksinuar: "ksh_dog_vaksinuar",
  libreze: "ksh_dog_libreze",
};

export const KSH_DOG_CHECK_SEARCH: Record<KshDogCheckKey, string> = {
  pedigree: "Me Pedigree",
  mikrochip: "Me Mikroçip",
  vaksinuar: "I vaksinuar",
  libreze: "Me librezë Pasaportë",
};

export const KSH_BIRD_TYPE_KEYS = ["papagaj_vegjel", "papagaj_medhenj", "kanarina", "pellumba"] as const;
export type KshBirdTypeKey = (typeof KSH_BIRD_TYPE_KEYS)[number];

export const KSH_BIRD_TYPE_LABEL_KEY: Record<KshBirdTypeKey, string> = {
  papagaj_vegjel: "ksh_bird_pap_vegjel",
  papagaj_medhenj: "ksh_bird_pap_medhenj",
  kanarina: "ksh_bird_kanarina",
  pellumba: "ksh_bird_pellumba",
};

export const KSH_BIRD_TYPE_SEARCH: Record<KshBirdTypeKey, string> = {
  papagaj_vegjel: "Papagaj Tigra Budgies",
  papagaj_medhenj: "Papagaj Nimfa Jako Ara",
  kanarina: "Kanarina Gardelinfë",
  pellumba: "Pëllumba dekorativë",
};

export const KSH_BIRD_CHAR_KEYS = ["i_zbutur", "i_egre"] as const;
export type KshBirdCharKey = (typeof KSH_BIRD_CHAR_KEYS)[number];

export const KSH_BIRD_CHAR_LABEL_KEY: Record<KshBirdCharKey, string> = {
  i_zbutur: "ksh_bird_zbutur",
  i_egre: "ksh_bird_egre",
};

export const KSH_BIRD_CHAR_SEARCH: Record<KshBirdCharKey, string> = {
  i_zbutur: "I zbutur",
  i_egre: "I egër",
};

export const KSH_BIRD_CAGE_SEARCH = "Me kafaz";

export const KSH_AQUA_KEYS = ["dekorativ", "komplet", "pajisje", "dekorime"] as const;
export type KshAquaKey = (typeof KSH_AQUA_KEYS)[number];

export const KSH_AQUA_LABEL_KEY: Record<KshAquaKey, string> = {
  dekorativ: "ksh_aqua_dekorativ",
  komplet: "ksh_aqua_komplet",
  pajisje: "ksh_aqua_pajisje",
  dekorime: "ksh_aqua_dekorime",
};

export const KSH_AQUA_SEARCH: Record<KshAquaKey, string> = {
  dekorativ: "Peshq dekorativë Goldfish Gupi",
  komplet: "Akuariume komplet",
  pajisje: "Filtra Ngrohës Pompa",
  dekorime: "Dekorime Bimë",
};

export const KSH_PET_CATEGORY_KEYS = ["qen", "mace", "shpende", "peshq"] as const;
export type KshPetCategoryKey = (typeof KSH_PET_CATEGORY_KEYS)[number];

export const KSH_PET_CATEGORY_LABEL_KEY: Record<KshPetCategoryKey, string> = {
  qen: "ksh_pet_qen",
  mace: "ksh_pet_mace",
  shpende: "ksh_pet_shpende",
  peshq: "ksh_pet_peshq",
};

export const KSH_PET_CATEGORY_SEARCH: Record<KshPetCategoryKey, string> = {
  qen: "Për qen",
  mace: "Për mace",
  shpende: "Për shpendë",
  peshq: "Për peshq",
};

export const KSH_SUPPLY_KEYS = [
  "that",
  "lagesht",
  "kafaze",
  "shtreter",
  "higjiene",
  "shetitje",
  "lodra",
] as const;
export type KshSupplyKey = (typeof KSH_SUPPLY_KEYS)[number];

export const KSH_SUPPLY_LABEL_KEY: Record<KshSupplyKey, string> = {
  that: "ksh_sup_that",
  lagesht: "ksh_sup_lagesht",
  kafaze: "ksh_sup_kafaze",
  shtreter: "ksh_sup_shtreter",
  higjiene: "ksh_sup_higjiene",
  shetitje: "ksh_sup_shetitje",
  lodra: "ksh_sup_lodra",
};

export const KSH_SUPPLY_SEARCH: Record<KshSupplyKey, string> = {
  that: "Ushqim i thatë",
  lagesht: "Ushqim i lagësht",
  kafaze: "Kafaze Shtëpiza",
  shtreter: "Shtretër Jastëkë",
  higjiene: "Higjienë Rërë Shamponë",
  shetitje: "Pajisje Shëtitjeje",
  lodra: "Lodra",
};

export const KSH_LISTING_KEYS = ["shitje", "falet"] as const;
export type KshListingKey = (typeof KSH_LISTING_KEYS)[number];

export const KSH_LISTING_LABEL_KEY: Record<KshListingKey, string> = {
  shitje: "ksh_list_shitje",
  falet: "ksh_list_falet",
};

export const KSH_LISTING_SEARCH: Record<KshListingKey, string> = {
  shitje: "Shitje",
  falet: "Falet Adoptohet",
};

export {
  LOKALE_ZYRE_CITY_KEYS as KSH_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY as KSH_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH as KSH_CITY_SEARCH,
  type LokaleCityKey as KshCityKey,
} from "@/lib/lokale-zyre-search-helpers";

export type KafshetCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getKafshetLeafCategoryIds(
  categories: KafshetCategoryRow[],
  hubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === hubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("kafshet-type-"),
    )
    .map((c) => c.id);
}

export function resolveKafshetTypeCategoryId(
  categories: KafshetCategoryRow[],
  hubId: number,
  typeKey: KshTypeKey,
): number | undefined {
  const slug = KSH_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
