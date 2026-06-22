import { db, shopDirectoryCategoriesTable, shopDirectorySubcategoriesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { SHOP_DIRECTORY_CATEGORIES } from "../../../../lib/shop-directory-taxonomy.js";

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

  const dirErr = validateAdminShopDirectorySlugs(
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
