/**
 * Generates shop-directory-subcategory-photos-data.mjs from curated mappings.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SHOP_DIRECTORY_CATEGORIES } from "../lib/shop-directory-taxonomy.ts";
import { CURATED_SHOP_SUBCATEGORY_PHOTOS } from "./curated-shop-subcategory-photos.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const expectedKeys = [];
for (const cat of SHOP_DIRECTORY_CATEGORIES) {
  for (const sub of cat.subcategories) {
    expectedKeys.push(`${cat.slug}/${sub.slug}`);
  }
}

if (expectedKeys.length !== 291) {
  console.error(`Expected 291 taxonomy keys, got ${expectedKeys.length}`);
  process.exit(1);
}

const missing = expectedKeys.filter((k) => !CURATED_SHOP_SUBCATEGORY_PHOTOS[k]);
if (missing.length) {
  console.error("Missing curated photo IDs for:", missing);
  process.exit(1);
}

const extra = Object.keys(CURATED_SHOP_SUBCATEGORY_PHOTOS).filter((k) => !expectedKeys.includes(k));
if (extra.length) {
  console.error("Unknown keys in curated photos:", extra);
  process.exit(1);
}

const ids = Object.values(CURATED_SHOP_SUBCATEGORY_PHOTOS);
if (new Set(ids).size !== ids.length) {
  const seen = new Set();
  const dupes = ids.filter((id) => {
    if (seen.has(id)) return true;
    seen.add(id);
    return false;
  });
  console.error("Duplicate Unsplash IDs:", [...new Set(dupes)]);
  process.exit(1);
}

const flat = {};
for (const key of expectedKeys) {
  flat[key] = CURATED_SHOP_SUBCATEGORY_PHOTOS[key];
}

const out = `/** Auto-generated — scripts/generate-shop-subcategory-photos.mjs */
export const SUBCATEGORY_UNSPLASH_IDS = ${JSON.stringify(flat, null, 2)};
`;

writeFileSync(join(__dirname, "shop-directory-subcategory-photos-data.mjs"), out, "utf8");
console.log("Wrote", Object.keys(flat).length, "unique subcategory photos");
