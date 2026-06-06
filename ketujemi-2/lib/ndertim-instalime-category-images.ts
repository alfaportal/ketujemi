/** Pexels photo ids for Ndërtim & Instalime — one distinct themed image per subcategory. */
export const NDERTIM_INSTALIME_PEXELS_ID = {
  ndertim_murature: 14367421,
  gipsi_suvatime: 6474479,
  pllakosje_mozaik: 259588,
  bojatisje_dekorim: 1249611,
  riparim_catie: 1170085,
  riparim_dyshemeje: 1571459,
  riparim_dritaresh: 2071167,
  instalime_ngrohje: 9120507,
  instalime_kamera: 6804072,
  instalime_solar: 8853502,
  levizje_transport: 1427107,
  mirembajtje: 3991879,
  /** Dyqanet-only subcategories */
  instalime_elektrike: 162553,
  instalime_hidraulike: 8482593,
  instalime_rrjeta: 2881230,
  pastrim_shtepi: 4239146,
  pastrim_industrial: 8460157,
} as const;

export function ndertimPexelsUrl(id: number, w: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&q=80`;
}

/** Hub grid cards (nivel 1) — 400px */
export function ndertimListingTypePhoto(
  key: keyof typeof NDERTIM_INSTALIME_PEXELS_ID,
): string {
  return ndertimPexelsUrl(NDERTIM_INSTALIME_PEXELS_ID[key], 400);
}

/** Type page banner (nivel 2) — 1200px */
export function ndertimListingBannerPhoto(
  key: keyof typeof NDERTIM_INSTALIME_PEXELS_ID,
): string {
  return ndertimPexelsUrl(NDERTIM_INSTALIME_PEXELS_ID[key], 1200);
}

/** Dyqanet subcategory card thumbs — 200px */
export function ndertimShopDirectoryThumb(
  key: keyof typeof NDERTIM_INSTALIME_PEXELS_ID,
): string {
  return ndertimPexelsUrl(NDERTIM_INSTALIME_PEXELS_ID[key], 200);
}
