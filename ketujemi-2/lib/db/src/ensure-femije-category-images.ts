import type pg from "pg";
import { FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG } from "./femije-hub-subcategory-photos.js";

/** Syncs Fëmijë group + leaf image_url from catalog (overrides stale Unsplash rows). */
export async function ensureFemijeCategoryImages(pool: pg.Pool): Promise<void> {
  for (const [slug, image_url] of Object.entries(FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG)) {
    await pool.query(`UPDATE categories SET image_url = $1 WHERE slug = $2`, [image_url, slug]);
  }
}
