import { ARSIM_KURSE_SUBCATEGORY_IMAGE_URL_BY_SLUG } from "./arsim-kurse-hub-subcategory-photos";

function isUsableCategoryImageUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Arsim & Kurse hub slug (matches seeded category). */
export const ARSIM_KURSE_HUB_SLUG = "arsim-kurse";

export const ARSIM_KURSE_HERO_PHOTO =
  "https://images.pexels.com/photos/5212342/pexels-photo-5212342.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

/** Hub photo row order (matches taxonomy spec, not alphabetical). */
export const ARSIM_TYPE_SLUG_ORDER: readonly string[] = [
  "arsim-type-parashkollor",
  "arsim-type-mesime-private",
  "arsim-type-gjuhe-huaja",
  "arsim-type-trajnime-it",
  "arsim-type-kurse-prof",
  "arsim-type-kurse-teknike",
  "arsim-type-shendet-mireqenie",
  "arsim-type-arte-kreativitet",
  "arsim-type-certifikata-diploma",
  "arsim-type-universitet-bursa",
];

export type ArsimKurseCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
  image_url?: string | null;
};

function sortByName(rows: ArsimKurseCategoryRow[]): ArsimKurseCategoryRow[] {
  return [...rows].sort((a, b) => a.name.localeCompare(b.name, "sq"));
}

export function getArsimKurseTypeRows(
  categories: ArsimKurseCategoryRow[],
  hubId: number,
): ArsimKurseCategoryRow[] {
  const hub = Number(hubId);
  const rows = categories.filter(
    (c) =>
      Number(c.parent_id) === hub &&
      typeof c.slug === "string" &&
      c.slug.startsWith("arsim-type-"),
  );
  const rank = new Map(ARSIM_TYPE_SLUG_ORDER.map((slug, i) => [slug, i]));
  return [...rows].sort(
    (a, b) =>
      (rank.get(a.slug ?? "") ?? 999) - (rank.get(b.slug ?? "") ?? 999) ||
      a.name.localeCompare(b.name, "sq"),
  );
}

export function getArsimKurseGroupRows(
  categories: ArsimKurseCategoryRow[],
  typeId: number,
): ArsimKurseCategoryRow[] {
  return sortByName(
    categories.filter(
      (c) =>
        Number(c.parent_id) === Number(typeId) &&
        typeof c.slug === "string" &&
        c.slug.startsWith("arsim-grp-"),
    ),
  );
}

export function getArsimKurseLeafRows(
  categories: ArsimKurseCategoryRow[],
  groupId: number,
): ArsimKurseCategoryRow[] {
  return sortByName(
    categories.filter(
      (c) =>
        Number(c.parent_id) === Number(groupId) &&
        typeof c.slug === "string" &&
        c.slug.startsWith("arsim-leaf-"),
    ),
  );
}

export function getArsimKurseGroupLeafIds(
  categories: ArsimKurseCategoryRow[],
  groupId: number,
): number[] {
  return getArsimKurseLeafRows(categories, groupId).map((c) => c.id);
}

export function getArsimKurseLeafCategoryIds(
  categories: ArsimKurseCategoryRow[],
  hubId: number,
): number[] {
  const ids = getArsimKurseTypeRows(categories, hubId).flatMap((type) =>
    getArsimKurseGroupRows(categories, type.id).flatMap((group) =>
      getArsimKurseGroupLeafIds(categories, group.id),
    ),
  );
  return [...new Set(ids)];
}

export function arsimSubcategoryPhoto(
  slug: string | null | undefined,
  imageUrl?: string | null,
  categories?: ArsimKurseCategoryRow[],
): string {
  const fromDbRaw = typeof imageUrl === "string" ? imageUrl.trim() : "";
  const fromDb = fromDbRaw && isUsableCategoryImageUrl(fromDbRaw) ? fromDbRaw : "";
  if (fromDb) return fromDb;

  if (slug && ARSIM_KURSE_SUBCATEGORY_IMAGE_URL_BY_SLUG[slug]) {
    return ARSIM_KURSE_SUBCATEGORY_IMAGE_URL_BY_SLUG[slug];
  }

  if (slug?.startsWith("arsim-leaf-") && categories?.length) {
    const leaf = categories.find((c) => c.slug === slug);
    if (leaf?.parent_id) {
      const group = categories.find((c) => c.id === leaf.parent_id);
      if (group?.slug && ARSIM_KURSE_SUBCATEGORY_IMAGE_URL_BY_SLUG[group.slug]) {
        return ARSIM_KURSE_SUBCATEGORY_IMAGE_URL_BY_SLUG[group.slug];
      }
      if (group?.parent_id) {
        const type = categories.find((c) => c.id === group.parent_id);
        if (type?.slug && ARSIM_KURSE_SUBCATEGORY_IMAGE_URL_BY_SLUG[type.slug]) {
          return ARSIM_KURSE_SUBCATEGORY_IMAGE_URL_BY_SLUG[type.slug];
        }
      }
    }
  }

  return ARSIM_KURSE_HERO_PHOTO;
}
