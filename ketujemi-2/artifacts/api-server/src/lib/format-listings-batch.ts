import { db, categoriesTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { finalizeListingsForApi } from "./shop-listing-lookup";
import {
  applyViewerContact,
  buildCategoryRootSlugMap,
  formatListing,
} from "../routes/listings-format";

export async function formatListingsBatch(
  rows: Parameters<typeof formatListing>[0][],
  viewer: User | null,
) {
  const cats = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      parent_id: categoriesTable.parent_id,
    })
    .from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  const catRootSlugMap = buildCategoryRootSlugMap(cats);

  return finalizeListingsForApi(
    rows.map((l) =>
      applyViewerContact(
        formatListing(l, catMap.get(l.category_id) ?? null, catRootSlugMap.get(l.category_id) ?? null),
        viewer,
      ),
    ),
  );
}
