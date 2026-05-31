/** Shared drill-down navigation for category hub search panels. */

export const HUB_LEAF_QUERY_PARAM = "opsioni";

export function parseHubLeafFromSearch(search: string): string | null {
  const raw = new URLSearchParams(search).get(HUB_LEAF_QUERY_PARAM)?.trim();
  return raw || null;
}

export function hubLeafPath(categoryPath: string, leafKey: string): string {
  return `${categoryPath}?${HUB_LEAF_QUERY_PARAM}=${encodeURIComponent(leafKey)}`;
}

export function resolveTypeKeyFromSlugMap<T extends string>(
  slug: string | null | undefined,
  dbSlugMap: Record<T, string>,
): T | null {
  if (!slug) return null;
  for (const key of Object.keys(dbSlugMap) as T[]) {
    if (dbSlugMap[key] === slug) return key;
  }
  return null;
}

export function resolveTypeCategoryId(
  categories: { id: number; slug: string | null; parent_id: number | null }[],
  hubId: number,
  dbSlug: string,
): number | undefined {
  return categories.find((c) => c.parent_id === hubId && c.slug === dbSlug)?.id;
}

export function isHubTypePage(
  hubSlug: string,
  parentCategory: { slug?: string | null } | null | undefined,
  currentCategory: { parent_id?: number | null } | null | undefined,
): boolean {
  return !!(
    parentCategory?.slug === hubSlug &&
    currentCategory?.parent_id != null
  );
}

export function resolveHubCategoryId(
  hubSlug: string,
  isHub: boolean,
  categoryId: number,
  parentCategory: { slug?: string | null; id?: number } | null | undefined,
): number {
  if (isHub) return categoryId;
  if (parentCategory?.slug === hubSlug && parentCategory.id) return parentCategory.id;
  return categoryId;
}

export type HubDrillDownVariant = "hub" | "type" | "leaf";

export type HubTypePickerConfig<T extends string = string> = {
  hubSlug: string;
  typeKeys: readonly T[];
  typeDbSlug: Record<T, string>;
  typePhotos: Record<T, string>;
  typeLabelKey: Record<T, string>;
  titleI18nKey: string;
  hintI18nKey: string;
  introI18nKey?: Partial<Record<T, string>>;
};
