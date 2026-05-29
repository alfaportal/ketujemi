/**
 * Writes {@link FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG} into `categories.image_url`
 * for the 19 Fëmijë hub subcategories (matched by slug).
 */
import "./load-env.js";
import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { categoriesTable } from "./schema/categories.js";
import { FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG } from "./femije-hub-subcategory-photos.js";

async function apply() {
  let n = 0;
  for (const [slug, image_url] of Object.entries(FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG)) {
    const res = await db
      .update(categoriesTable)
      .set({ image_url })
      .where(eq(categoriesTable.slug, slug))
      .returning({ id: categoriesTable.id });
    if (res.length) n += 1;
    else console.warn(`[femije-hub-photos] No row for slug "${slug}" — skipped`);
  }
  console.log(`[femije-hub-photos] Updated ${n} Fëmijë hub subcategories with image_url.`);
}

apply()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
