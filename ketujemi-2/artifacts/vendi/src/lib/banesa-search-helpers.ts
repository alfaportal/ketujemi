/** Top-level hub property rows (`banesa-type-*`). */
export function getBanesaLeafCategoryIds(
  categories: { id: number; parent_id: number | null | undefined; slug: string | null | undefined }[],
  banesaHubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === banesaHubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("banesa-type-"),
    )
    .map((c) => c.id);
}

export function resolveBanesaCategoryIdBySlug(
  categories: { id: number; parent_id: number | null | undefined; slug: string | null | undefined }[],
  banesaHubId: number,
  targetSlug: string,
): number | null {
  const row = categories.find(
    (c) => c.parent_id === banesaHubId && c.slug === targetSlug,
  );
  return row?.id ?? null;
}
