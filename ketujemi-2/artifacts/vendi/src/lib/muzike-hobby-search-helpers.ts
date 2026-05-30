import { MUZIKE_HOBBY_SUBCATEGORY_IMAGE_URL_BY_SLUG } from "./muzike-hobby-hub-subcategory-photos";

function isUsableCategoryImageUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Muzikë & Hobby hub slug (matches seeded category). */
export const MUZIKE_HOBBY_HUB_SLUG = "muzike-hobby";

export const MUZIKE_HOBBY_HERO_PHOTO =
  "https://images.pexels.com/photos/210764/pexels-photo-210764.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

/** Hub photo grid order (matches taxonomy spec). */
export const MUZIKE_TYPE_SLUG_ORDER: readonly string[] = [
  "muzike-type-instrumente-muzikore",
  "muzike-type-studio-audio",
  "muzike-type-art-kreativitet",
  "muzike-type-foto-video",
  "muzike-type-libra-koleksione",
];

export type MuzikeHobbyCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
  image_url?: string | null;
};

export function getMuzikeHobbyTypeRows(
  categories: MuzikeHobbyCategoryRow[],
  hubId: number,
): MuzikeHobbyCategoryRow[] {
  const hub = Number(hubId);
  const rows = categories.filter(
    (c) =>
      Number(c.parent_id) === hub &&
      typeof c.slug === "string" &&
      c.slug.startsWith("muzike-type-") &&
      MUZIKE_TYPE_SLUG_ORDER.includes(c.slug),
  );
  const rank = new Map(MUZIKE_TYPE_SLUG_ORDER.map((slug, i) => [slug, i]));
  return [...rows].sort(
    (a, b) =>
      (rank.get(a.slug ?? "") ?? 999) - (rank.get(b.slug ?? "") ?? 999) ||
      a.name.localeCompare(b.name, "sq"),
  );
}

export function getMuzikeHobbyGroupRows(
  categories: MuzikeHobbyCategoryRow[],
  typeId: number,
): MuzikeHobbyCategoryRow[] {
  return [...categories]
    .filter(
      (c) =>
        Number(c.parent_id) === Number(typeId) &&
        typeof c.slug === "string" &&
        c.slug.startsWith("muzike-grp-"),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "sq"));
}

export function getMuzikeHobbyLeafRows(
  categories: MuzikeHobbyCategoryRow[],
  groupId: number,
): MuzikeHobbyCategoryRow[] {
  return [...categories]
    .filter(
      (c) =>
        Number(c.parent_id) === Number(groupId) &&
        typeof c.slug === "string" &&
        c.slug.startsWith("muzike-leaf-"),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "sq"));
}

export function getMuzikeHobbyGroupLeafIds(
  categories: MuzikeHobbyCategoryRow[],
  groupId: number,
): number[] {
  return getMuzikeHobbyLeafRows(categories, groupId).map((c) => c.id);
}

export function getMuzikeHobbyLeafCategoryIds(
  categories: MuzikeHobbyCategoryRow[],
  hubId: number,
): number[] {
  const ids = getMuzikeHobbyTypeRows(categories, hubId).flatMap((type) =>
    getMuzikeHobbyGroupRows(categories, type.id).flatMap((group) =>
      getMuzikeHobbyGroupLeafIds(categories, group.id),
    ),
  );
  return [...new Set(ids)];
}

export function muzikeSubcategoryPhoto(
  slug: string | null | undefined,
  imageUrl?: string | null,
  categories?: MuzikeHobbyCategoryRow[],
): string {
  const fromDbRaw = typeof imageUrl === "string" ? imageUrl.trim() : "";
  const fromDb = fromDbRaw && isUsableCategoryImageUrl(fromDbRaw) ? fromDbRaw : "";
  if (fromDb) return fromDb;

  if (slug && MUZIKE_HOBBY_SUBCATEGORY_IMAGE_URL_BY_SLUG[slug]) {
    return MUZIKE_HOBBY_SUBCATEGORY_IMAGE_URL_BY_SLUG[slug];
  }

  if (slug?.startsWith("muzike-leaf-") && categories?.length) {
    const leaf = categories.find((c) => c.slug === slug);
    if (leaf?.parent_id) {
      const group = categories.find((c) => c.id === leaf.parent_id);
      if (group?.slug && MUZIKE_HOBBY_SUBCATEGORY_IMAGE_URL_BY_SLUG[group.slug]) {
        return MUZIKE_HOBBY_SUBCATEGORY_IMAGE_URL_BY_SLUG[group.slug];
      }
      if (group?.parent_id) {
        const type = categories.find((c) => c.id === group.parent_id);
        if (type?.slug && MUZIKE_HOBBY_SUBCATEGORY_IMAGE_URL_BY_SLUG[type.slug]) {
          return MUZIKE_HOBBY_SUBCATEGORY_IMAGE_URL_BY_SLUG[type.slug];
        }
      }
    }
  }

  return MUZIKE_HOBBY_HERO_PHOTO;
}
