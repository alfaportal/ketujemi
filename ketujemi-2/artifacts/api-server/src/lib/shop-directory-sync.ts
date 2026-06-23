import { db, pool, shopApplicationsTable, shopsTable } from "@workspace/db";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import {
  defaultSubcategoryForCategory,
  SHOP_DIRECTORY_CATEGORIES,
} from "../../../../lib/shop-directory-taxonomy.js";
import { resolveDirectoryCategorySlug, resolveDirectorySubcategorySlug } from "./shop-directory-resolve.js";

/** Copy missing directory slugs from approved applications onto shop rows. */
const SYNC_DIRECTORY_FROM_APPLICATIONS_SQL = `
UPDATE shops s
SET
  directory_category_slug = COALESCE(NULLIF(TRIM(s.directory_category_slug), ''), NULLIF(TRIM(a.directory_category_slug), '')),
  directory_subcategory_slug = COALESCE(NULLIF(TRIM(s.directory_subcategory_slug), ''), NULLIF(TRIM(a.directory_subcategory_slug), '')),
  directory_category_id = COALESCE(s.directory_category_id, a.directory_category_id),
  directory_subcategory_id = COALESCE(s.directory_subcategory_id, a.directory_subcategory_id)
FROM shop_applications a
WHERE a.shop_id = s.id
  AND a.status = 'approved'
  AND s.is_active = true
  AND (s.deleted_at IS NULL)
  AND (
    COALESCE(NULLIF(TRIM(s.directory_category_slug), ''), '') = ''
    OR COALESCE(NULLIF(TRIM(s.directory_subcategory_slug), ''), '') = ''
  )
  AND (
    COALESCE(NULLIF(TRIM(a.directory_category_slug), ''), '') <> ''
    OR a.directory_category_id IS NOT NULL
  );
`;

/** Match «Kategoria · Nënkategoria» label to taxonomy tables. */
const BACKFILL_CATEGORY_SLUG_FROM_LABEL_SQL = `
UPDATE shops s
SET directory_category_slug = c.slug
FROM shop_directory_categories c
WHERE s.is_active = true
  AND (s.deleted_at IS NULL)
  AND COALESCE(NULLIF(TRIM(s.directory_category_slug), ''), '') = ''
  AND TRIM(split_part(s.category, '·', 1)) ILIKE TRIM(c.name);
`;

const BACKFILL_SUBCATEGORY_SLUG_FROM_LABEL_SQL = `
UPDATE shops s
SET directory_subcategory_slug = sub.slug
FROM shop_directory_subcategories sub
INNER JOIN shop_directory_categories c ON c.id = sub.category_id
WHERE s.is_active = true
  AND (s.deleted_at IS NULL)
  AND s.directory_category_slug = c.slug
  AND COALESCE(NULLIF(TRIM(s.directory_subcategory_slug), ''), '') = ''
  AND s.category ILIKE '%' || sub.name || '%';
`;

const SYNC_APPLICATIONS_FROM_SHOPS_SQL = `
UPDATE shop_applications a
SET
  directory_category_slug = COALESCE(NULLIF(TRIM(a.directory_category_slug), ''), NULLIF(TRIM(s.directory_category_slug), '')),
  directory_subcategory_slug = COALESCE(NULLIF(TRIM(a.directory_subcategory_slug), ''), NULLIF(TRIM(s.directory_subcategory_slug), '')),
  directory_category_id = COALESCE(a.directory_category_id, s.directory_category_id),
  directory_subcategory_id = COALESCE(a.directory_subcategory_id, s.directory_subcategory_id)
FROM shops s
WHERE a.shop_id = s.id
  AND a.status = 'approved'
  AND s.is_active = true
  AND (s.deleted_at IS NULL)
  AND (
    COALESCE(NULLIF(TRIM(a.directory_category_slug), ''), '') = ''
    OR COALESCE(NULLIF(TRIM(a.directory_subcategory_slug), ''), '') = ''
  )
  AND (
    COALESCE(NULLIF(TRIM(s.directory_category_slug), ''), '') <> ''
    OR s.directory_category_id IS NOT NULL
  );
`;

let syncPromise: Promise<void> | null = null;
let lastSyncAt = 0;
const SYNC_TTL_MS = 15_000;

function guessSubcategoryFromCategoryLabel(categorySlug: string, categoryLabel: string): string | null {
  const parts = categoryLabel.split("·").map((s) => s.trim());
  const subPart = parts.length > 1 ? parts.slice(1).join("·").trim().toLowerCase() : "";
  if (!subPart) return defaultSubcategoryForCategory(categorySlug);

  const cat = SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat) return defaultSubcategoryForCategory(categorySlug);

  for (const sub of cat.subcategories) {
    if (subPart.includes(sub.nameSq.toLowerCase())) return sub.slug;
  }
  return defaultSubcategoryForCategory(categorySlug);
}

async function backfillMissingSlugsInTypescript(): Promise<void> {
  const missing = await db
    .select({
      id: shopsTable.id,
      category: shopsTable.category,
      directory_category_slug: shopsTable.directory_category_slug,
      directory_subcategory_slug: shopsTable.directory_subcategory_slug,
    })
    .from(shopsTable)
    .where(
      and(
        eq(shopsTable.is_active, true),
        isNull(shopsTable.deleted_at),
        or(
          isNull(shopsTable.directory_category_slug),
          sql`TRIM(${shopsTable.directory_category_slug}) = ''`,
          isNull(shopsTable.directory_subcategory_slug),
          sql`TRIM(${shopsTable.directory_subcategory_slug}) = ''`,
        ),
      ),
    );

  for (const shop of missing) {
    const catSlug =
      shop.directory_category_slug?.trim() ||
      resolveDirectoryCategorySlug({ category: shop.category }) ||
      "biznes-sherbime";
    const subSlug =
      shop.directory_subcategory_slug?.trim() ||
      guessSubcategoryFromCategoryLabel(catSlug, shop.category) ||
      resolveDirectorySubcategorySlug(catSlug, null);

    await db
      .update(shopsTable)
      .set({
        directory_category_slug: catSlug,
        directory_subcategory_slug: subSlug,
      })
      .where(eq(shopsTable.id, shop.id));

    await db
      .update(shopApplicationsTable)
      .set({
        directory_category_slug: catSlug,
        directory_subcategory_slug: subSlug,
      })
      .where(eq(shopApplicationsTable.shop_id, shop.id));
  }
}

async function runDirectorySyncQueries(): Promise<void> {
  try {
    await pool.query(SYNC_DIRECTORY_FROM_APPLICATIONS_SQL);
  } catch {
    /* applications may lack slug columns on very old DB */
  }

  try {
    await pool.query(BACKFILL_CATEGORY_SLUG_FROM_LABEL_SQL);
    await pool.query(BACKFILL_SUBCATEGORY_SLUG_FROM_LABEL_SQL);
    await pool.query(SYNC_APPLICATIONS_FROM_SHOPS_SQL);
  } catch {
    /* taxonomy tables may still be seeding */
  }

  await backfillMissingSlugsInTypescript();

  const { backfillAllActiveShopListingsIfStale } = await import("./shop-listing-lookup.js");
  await backfillAllActiveShopListingsIfStale().catch(() => undefined);
}

/** Ensure every active shop has directory slugs so /dyqanet lists it. */
export async function syncShopDirectoryFieldsFromApplications(): Promise<void> {
  const now = Date.now();
  if (syncPromise && now - lastSyncAt < SYNC_TTL_MS) {
    await syncPromise;
    return;
  }

  lastSyncAt = now;
  syncPromise = runDirectorySyncQueries().catch((err) => {
    syncPromise = null;
    throw err;
  });

  await syncPromise;
}
