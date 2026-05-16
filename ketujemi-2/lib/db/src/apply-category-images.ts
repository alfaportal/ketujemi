/**
 * Applies curated Pexels JPEG URLs from {@link SUBCATEGORY_IMAGE_URL_BY_SLUG}
 * to `categories.image_url` matched by slug.
 */
import "./load-env.js";
import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { categoriesTable } from "./schema/categories.js";
import { SUBCATEGORY_IMAGE_URL_BY_SLUG } from "./category-pexels-urls.js";

async function apply() {
  let n = 0;
  for (const [slug, image_url] of Object.entries(SUBCATEGORY_IMAGE_URL_BY_SLUG)) {
    const res = await db
      .update(categoriesTable)
      .set({ image_url })
      .where(eq(categoriesTable.slug, slug))
      .returning({ id: categoriesTable.id });
    if (res.length) n += 1;
    else console.warn(`[category-images] No row for slug "${slug}" — skipped`);
  }
  console.log(`[category-images] Updated ${n} categories with image_url.`);
}

apply()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
