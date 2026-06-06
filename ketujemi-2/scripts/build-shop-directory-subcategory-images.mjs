import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SHOP_DIRECTORY_CATEGORIES } from "../lib/shop-directory-taxonomy.ts";
import { SUBCATEGORY_UNSPLASH_IDS } from "./shop-directory-subcategory-photos-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const u = (id, w = 200) => `https://images.unsplash.com/photo-${id}?w=${w}`;

const expectedKeys = [];
for (const cat of SHOP_DIRECTORY_CATEGORIES) {
  for (const sub of cat.subcategories) {
    expectedKeys.push(`${cat.slug}/${sub.slug}`);
  }
}

const missing = expectedKeys.filter((k) => !SUBCATEGORY_UNSPLASH_IDS[k]);
if (missing.length) {
  console.error("Missing photo IDs for:", missing);
  process.exit(1);
}

const extra = Object.keys(SUBCATEGORY_UNSPLASH_IDS).filter((k) => !expectedKeys.includes(k));
if (extra.length) {
  console.error("Unknown keys in photo data:", extra);
  process.exit(1);
}

const byUrl = new Map();
for (const [key, id] of Object.entries(SUBCATEGORY_UNSPLASH_IDS)) {
  const url = u(id);
  const prev = byUrl.get(url);
  if (prev) {
    console.error(`Duplicate photo: ${key} and ${prev} both use ${id}`);
    process.exit(1);
  }
  byUrl.set(url, key);
}

const map = {};
for (const key of expectedKeys) {
  map[key] = u(SUBCATEGORY_UNSPLASH_IDS[key]);
}

const out = `/** Auto-generated — run ketujemi-2/scripts/build-shop-directory-subcategory-images.mjs */
export const SHOP_DIRECTORY_SUBCATEGORY_IMAGE_URLS: Record<string, string> = ${JSON.stringify(map, null, 2)};

export function shopDirectorySubcategoryImageUrl(
  categorySlug: string,
  subSlug: string,
): string | undefined {
  return SHOP_DIRECTORY_SUBCATEGORY_IMAGE_URLS[\`\${categorySlug}/\${subSlug}\`];
}
`;

writeFileSync(join(__dirname, "../lib/shop-directory-subcategory-images.ts"), out, "utf8");
console.log("Wrote shop-directory-subcategory-images.ts with", Object.keys(map).length, "unique entries");
