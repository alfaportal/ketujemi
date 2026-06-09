/** Audit generated SHOP_SUB_FR — flag labels identical to EN. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(
  join(root, "artifacts/vendi/src/lib/shop-directory-subcategory-i18n.generated.ts"),
  "utf8",
);
const en = Object.fromEntries([...src.matchAll(/SHOP_SUB_EN[\s\S]*?"([^"]+)": "([^"]+)"/g)].slice(1).map((m) => [m[1], m[2]]));
const frBlock = src.slice(src.indexOf("SHOP_SUB_FR"), src.indexOf("SHOP_SUB_MK"));
const fr = Object.fromEntries([...frBlock.matchAll(/"([^"]+)": "([^"]+)"/g)].map((m) => [m[1], m[2]]));

const bad = Object.keys(en).filter((slug) => fr[slug] === en[slug] && /[A-Za-z]{4,}/.test(en[slug]));
console.log("shop fr===en", bad.length);
for (const slug of bad.slice(0, 15)) console.log(slug, en[slug]);
