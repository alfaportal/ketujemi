/**
 * Writes {@link PARENT_CATEGORY_THUMB_BY_SLUG} into `categories.image_url` for parent rows.
 */
import "./load-env.js";
import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { categoriesTable } from "./schema/categories.js";
import { PARENT_CATEGORY_THUMB_BY_SLUG } from "./parent-category-images.js";

async function apply() {
  let n = 0;
  for (const [slug, image_url] of Object.entries(PARENT_CATEGORY_THUMB_BY_SLUG)) {
    const res = await db
      .update(categoriesTable)
      .set({ image_url })
      .where(eq(categoriesTable.slug, slug))
      .returning({ id: categoriesTable.id });
    if (res.length) n += 1;
    else console.warn(`[parent-images] No row for slug "${slug}" — skipped`);
  }
  console.log(`[parent-images] Updated ${n} parent categories with stable image_url.`);
}

apply()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
