/** Ndërtim & Instalime hub slug (matches seeded category). */
export const NDERTIM_INSTALIME_HUB_SLUG = "ndertim-instalime";

export const NDERTIM_INSTALIME_HERO_PHOTO =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80&auto=format&fit=crop";

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?w=400&q=80&auto=format&fit=crop`;

export const NI_TYPE_KEYS = [
  "ndertim_murature",
  "gipsi_suvatime",
  "pllakosje_mozaik",
  "bojatisje_dekorim",
  "riparim_catie",
  "riparim_dyshemeje",
  "riparim_dritaresh",
  "instalime_ngrohje",
  "instalime_kamera",
  "instalime_solar",
  "levizje_transport",
  "mirembajtje",
] as const;

export type NiTypeKey = (typeof NI_TYPE_KEYS)[number];

export const NI_TYPE_DB_SLUG: Record<NiTypeKey, string> = {
  ndertim_murature: "ndertim-type-ndertim-murature",
  gipsi_suvatime: "ndertim-type-gipsi-suvatime",
  pllakosje_mozaik: "ndertim-type-pllakosje-mozaik",
  bojatisje_dekorim: "ndertim-type-bojatisje-dekorim",
  riparim_catie: "ndertim-type-riparim-catie-izolim",
  riparim_dyshemeje: "ndertim-type-riparim-dyshemeje-parket",
  riparim_dritaresh: "ndertim-type-riparim-dritaresh-dyerve",
  instalime_ngrohje: "ndertim-type-instalime-ngrohje-klima",
  instalime_kamera: "ndertim-type-instalime-kamera-alarme",
  instalime_solar: "ndertim-type-instalime-solar-panele",
  levizje_transport: "ndertim-type-levizje-transport",
  mirembajtje: "ndertim-type-mirembajtje-riparime",
};

export const NI_TYPE_PHOTOS: Record<NiTypeKey, string> = {
  ndertim_murature: unsplash("1504307651254-35680f356dfd"),
  gipsi_suvatime: unsplash("1503387762-592deb58ef03"),
  pllakosje_mozaik: unsplash("1581858722598-fac7e3027fb2"),
  bojatisje_dekorim: unsplash("1615875605825-4b0c4c4c4c4c"),
  riparim_catie: unsplash("1486262715619-67b85e0b08d3"),
  riparim_dyshemeje: unsplash("1486262715619-67b85e0b08d3"),
  riparim_dritaresh: unsplash("1600607687644-c7171b42498b"),
  instalime_ngrohje: unsplash("1631545461158-1f38d7d1a423"),
  instalime_kamera: unsplash("1606983340126-99e4eada4d24"),
  instalime_solar: unsplash("1621905251189-08b45d6a269e"),
  levizje_transport: unsplash("1601584115197-04ecc0da31d7"),
  mirembajtje: unsplash("1486262715619-67b85e0b08d3"),
};

export const NI_TYPE_LABEL_KEY: Record<NiTypeKey, string> = {
  ndertim_murature: "ni_type_ndertim_murature",
  gipsi_suvatime: "ni_type_gipsi_suvatime",
  pllakosje_mozaik: "ni_type_pllakosje_mozaik",
  bojatisje_dekorim: "ni_type_bojatisje_dekorim",
  riparim_catie: "ni_type_riparim_catie",
  riparim_dyshemeje: "ni_type_riparim_dyshemeje",
  riparim_dritaresh: "ni_type_riparim_dritaresh",
  instalime_ngrohje: "ni_type_instalime_ngrohje",
  instalime_kamera: "ni_type_instalime_kamera",
  instalime_solar: "ni_type_instalime_solar",
  levizje_transport: "ni_type_levizje_transport",
  mirembajtje: "ni_type_mirembajtje",
};

export type NdertimInstalimeCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getNdertimInstalimeLeafCategoryIds(
  categories: NdertimInstalimeCategoryRow[],
  hubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === hubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("ndertim-type-"),
    )
    .map((c) => c.id);
}

export function resolveNdertimInstalimeTypeCategoryId(
  categories: NdertimInstalimeCategoryRow[],
  hubId: number,
  typeKey: NiTypeKey,
): number | undefined {
  const slug = NI_TYPE_DB_SLUG[typeKey];
  const row = categories.find((c) => c.parent_id === hubId && c.slug === slug);
  return row?.id;
}
