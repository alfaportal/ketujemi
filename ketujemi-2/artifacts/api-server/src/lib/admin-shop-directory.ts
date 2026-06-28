import {
  db,
  ensureShopDirectoryTaxonomyTables,
  pool,
  shopDirectoryCategoriesTable,
  shopDirectorySubcategoriesTable,
  type ShopDirectorySeedCategory,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { SHOP_DIRECTORY_CATEGORIES } from "../../../../lib/shop-directory-taxonomy.js";
import {
  SHOP_STOREFRONT_BLOCKED_SUBCATEGORY_SLUGS,
  filterStorefrontDirectoryCategories,
} from "../../../../lib/shop-storefront-policy.js";

let adminDirectorySeedCache: ShopDirectorySeedCategory[] | null = null;

export async function adminShopDirectorySeed(): Promise<ShopDirectorySeedCategory[]> {
  if (adminDirectorySeedCache) return adminDirectorySeedCache;
  const { SHOP_DIRECTORY_CATEGORY_IMAGE_URLS } = await import(
    "../../../../lib/shop-directory-category-images.js"
  );
  adminDirectorySeedCache = SHOP_DIRECTORY_CATEGORIES.map((cat) => ({
    slug: cat.slug,
    emoji: cat.emoji,
    nameSq: cat.nameSq,
    imageUrl: SHOP_DIRECTORY_CATEGORY_IMAGE_URLS[cat.slug],
    subcategories: cat.subcategories,
  }));
  return adminDirectorySeedCache;
}

const CATEGORY_BY_SLUG = new Map(SHOP_DIRECTORY_CATEGORIES.map((c) => [c.slug, c]));

export type ResolvedAdminShopDirectory = {
  directory_category_slug: string;
  directory_subcategory_slug: string;
  directory_category_id: number | null;
  directory_subcategory_id: number | null;
  category_label: string;
};

export function validateAdminShopDirectorySlugs(
  categorySlug: string | null | undefined,
  subcategorySlug: string | null | undefined,
): string | null {
  const cat = categorySlug?.trim();
  const sub = subcategorySlug?.trim();
  if (!cat || !sub) return "Zgjidhni kategorinë dhe nënkategorinë e dyqanit.";
  const catDef = CATEGORY_BY_SLUG.get(cat);
  if (!catDef) return "Kategoria e dyqanit nuk është e vlefshme.";
  if (!catDef.subcategories.some((s) => s.slug === sub)) {
    return "Nënkategoria nuk i përket kësaj kategorie.";
  }
  return null;
}

/** Reject job/restaurant directory types — no product storefront allowed. */
export function validateShopStorefrontDirectorySlugs(
  categorySlug: string | null | undefined,
  subcategorySlug: string | null | undefined,
): string | null {
  const base = validateAdminShopDirectorySlugs(categorySlug, subcategorySlug);
  if (base) return base;
  const sub = subcategorySlug?.trim();
  if (sub && SHOP_STOREFRONT_BLOCKED_SUBCATEGORY_SLUGS.has(sub)) {
    return "Kjo kategori (punë ose restorant/catering) nuk lejon dyqan me webfaqe produktesh. Zgjidhni kategori shitje/shërbimi.";
  }
  return null;
}

export function storefrontDirectoryCategoriesForForms() {
  return filterStorefrontDirectoryCategories(SHOP_DIRECTORY_CATEGORIES);
}

export function adminShopDirectoryLabel(categorySlug: string, subcategorySlug: string): string {
  const catDef = CATEGORY_BY_SLUG.get(categorySlug);
  const subDef = catDef?.subcategories.find((s) => s.slug === subcategorySlug);
  if (!catDef || !subDef) return "Dyqan";
  return `${catDef.nameSq} · ${subDef.nameSq}`;
}

/** Slugs are source of truth; IDs are optional cache from DB taxonomy tables. */
export async function resolveAdminShopDirectory(
  categorySlug: string,
  subcategorySlug: string,
): Promise<ResolvedAdminShopDirectory> {
  const slugErr = validateAdminShopDirectorySlugs(categorySlug, subcategorySlug);
  if (slugErr) throw new Error(slugErr);

  const cat = categorySlug.trim();
  const sub = subcategorySlug.trim();

  let directory_category_id: number | null = null;
  let directory_subcategory_id: number | null = null;

  const [catRow] = await db
    .select({ id: shopDirectoryCategoriesTable.id })
    .from(shopDirectoryCategoriesTable)
    .where(eq(shopDirectoryCategoriesTable.slug, cat))
    .limit(1);
  if (catRow) directory_category_id = catRow.id;

  if (directory_category_id) {
    const [subRow] = await db
      .select({ id: shopDirectorySubcategoriesTable.id })
      .from(shopDirectorySubcategoriesTable)
      .where(
        and(
          eq(shopDirectorySubcategoriesTable.category_id, directory_category_id),
          eq(shopDirectorySubcategoriesTable.slug, sub),
        ),
      )
      .limit(1);
    if (subRow) directory_subcategory_id = subRow.id;
  }

  return {
    directory_category_slug: cat,
    directory_subcategory_slug: sub,
    directory_category_id,
    directory_subcategory_id,
    category_label: adminShopDirectoryLabel(cat, sub),
  };
}

/** Ensure taxonomy tables exist, then resolve slugs (no full seed — that runs on server boot). */
export async function resolveAdminShopDirectoryWithEnsure(
  categorySlug: string,
  subcategorySlug: string,
): Promise<ResolvedAdminShopDirectory> {
  try {
    await ensureShopDirectoryTaxonomyTables(pool);
  } catch {
    /* slug-only save still works */
  }
  return resolveAdminShopDirectory(categorySlug, subcategorySlug);
}

function trimOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}

function requiredString(v: unknown, field: string): string | null {
  const t = trimOrNull(v);
  if (!t) return `Fusha «${field}» është e detyrueshme.`;
  return null;
}

/** Shared validation for admin create/update shop payloads (slug-based directory). */
export function collectAdminShopValidationErrors(body: Record<string, unknown>): string[] {
  const errors: string[] = [];
  for (const [key, label] of [
    ["shop_name", "Emri i dyqanit"],
    ["logo_url", "Logo"],
    ["description", "Përshkrimi"],
    ["country", "Shteti"],
    ["city", "Qyteti"],
    ["address", "Adresa"],
    ["contact_name", "Emri i kontaktit"],
    ["phone", "Telefoni"],
    ["email", "Email"],
  ] as const) {
    const err = requiredString(body[key], label);
    if (err) errors.push(err);
  }

  const facebook = trimOrNull(body.facebook);
  const instagram = trimOrNull(body.instagram);
  const tiktok = trimOrNull(body.tiktok);
  const whatsapp = trimOrNull(body.whatsapp);
  const website = trimOrNull(body.website);
  if (!facebook && !instagram && !tiktok && !whatsapp && !website) {
    errors.push("Plotësoni të paktën një rrjet social.");
  }

  const dirErr = validateShopStorefrontDirectorySlugs(
    trimOrNull(body.directory_category_slug),
    trimOrNull(body.directory_subcategory_slug),
  );
  if (dirErr) errors.push(dirErr);

  return errors;
}

export function readAdminShopDirectorySlugs(
  body: Record<string, unknown>,
  fallback?: { category?: string | null; subcategory?: string | null },
): { categorySlug: string; subcategorySlug: string } | null {
  const categorySlug =
    trimOrNull(body.directory_category_slug) ?? trimOrNull(fallback?.category) ?? null;
  const subcategorySlug =
    trimOrNull(body.directory_subcategory_slug) ?? trimOrNull(fallback?.subcategory) ?? null;
  if (!categorySlug || !subcategorySlug) return null;
  return { categorySlug, subcategorySlug };
}
