import { db, shopDirectoryCategoriesTable, shopDirectorySubcategoriesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  resolveDirectoryCategorySlug,
  resolveDirectorySubcategorySlug,
} from "./shop-directory-resolve";

export type DirectoryPatchInput = {
  directory_category_id?: number | null;
  directory_subcategory_id?: number | null;
  directory_category_slug?: string | null;
  directory_subcategory_slug?: string | null;
  category_id?: number | null;
  category?: string | null;
};

export async function resolveDirectoryFields(
  input: DirectoryPatchInput,
  existing?: {
    directory_category_slug?: string | null;
    directory_subcategory_slug?: string | null;
    directory_category_id?: number | null;
    directory_subcategory_id?: number | null;
    category_id?: number | null;
    category?: string | null;
  },
): Promise<{
  directory_category_slug: string | null;
  directory_subcategory_slug: string | null;
  directory_category_id: number | null;
  directory_subcategory_id: number | null;
}> {
  const bodyCategoryId = Number(input.directory_category_id);
  const bodySubcategoryId = Number(input.directory_subcategory_id);

  let directoryCategoryId: number | null =
    Number.isFinite(bodyCategoryId) && bodyCategoryId > 0
      ? bodyCategoryId
      : (existing?.directory_category_id ?? null);
  let directorySubcategoryId: number | null =
    Number.isFinite(bodySubcategoryId) && bodySubcategoryId > 0
      ? bodySubcategoryId
      : (existing?.directory_subcategory_id ?? null);

  let directoryCategorySlug =
    typeof input.directory_category_slug === "string"
      ? input.directory_category_slug.trim() || null
      : null;
  let directorySubcategorySlug =
    typeof input.directory_subcategory_slug === "string"
      ? input.directory_subcategory_slug.trim() || null
      : null;

  if (directoryCategoryId) {
    const [catRow] = await db
      .select({ slug: shopDirectoryCategoriesTable.slug })
      .from(shopDirectoryCategoriesTable)
      .where(eq(shopDirectoryCategoriesTable.id, directoryCategoryId))
      .limit(1);
    if (catRow) directoryCategorySlug = catRow.slug;
  }

  if (!directoryCategorySlug) {
    directoryCategorySlug = resolveDirectoryCategorySlug({
      directory_category_slug: existing?.directory_category_slug,
      category_id: input.category_id ?? existing?.category_id,
      category: input.category ?? existing?.category,
    });
  }

  if (directorySubcategoryId) {
    const [subRow] = await db
      .select({
        slug: shopDirectorySubcategoriesTable.slug,
        category_id: shopDirectorySubcategoriesTable.category_id,
      })
      .from(shopDirectorySubcategoriesTable)
      .where(eq(shopDirectorySubcategoriesTable.id, directorySubcategoryId))
      .limit(1);
    if (subRow) {
      directorySubcategorySlug = subRow.slug;
      if (!directoryCategoryId) {
        directoryCategoryId = subRow.category_id;
        const [catRow] = await db
          .select({ slug: shopDirectoryCategoriesTable.slug })
          .from(shopDirectoryCategoriesTable)
          .where(eq(shopDirectoryCategoriesTable.id, subRow.category_id))
          .limit(1);
        if (catRow) directoryCategorySlug = catRow.slug;
      }
    }
  }

  if (!directorySubcategorySlug) {
    directorySubcategorySlug = resolveDirectorySubcategorySlug(
      directoryCategorySlug,
      existing?.directory_subcategory_slug,
    );
  }

  if (!directoryCategoryId && directoryCategorySlug) {
    const [catRow] = await db
      .select({ id: shopDirectoryCategoriesTable.id })
      .from(shopDirectoryCategoriesTable)
      .where(eq(shopDirectoryCategoriesTable.slug, directoryCategorySlug))
      .limit(1);
    if (catRow) directoryCategoryId = catRow.id;
  }

  if (!directorySubcategoryId && directoryCategoryId && directorySubcategorySlug) {
    const [subRow] = await db
      .select({ id: shopDirectorySubcategoriesTable.id })
      .from(shopDirectorySubcategoriesTable)
      .where(
        and(
          eq(shopDirectorySubcategoriesTable.category_id, directoryCategoryId),
          eq(shopDirectorySubcategoriesTable.slug, directorySubcategorySlug),
        ),
      )
      .limit(1);
    if (subRow) directorySubcategoryId = subRow.id;
  }

  return {
    directory_category_slug: directoryCategorySlug,
    directory_subcategory_slug: directorySubcategorySlug,
    directory_category_id: directoryCategoryId,
    directory_subcategory_id: directorySubcategoryId,
  };
}
