/**
 * Generates static-pages-i18n-de.ts and static-pages-i18n-it.ts from FR template
 * (hand-maintained quality) by swapping French strings for DE/IT via phrase maps.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STATIC_PAGE_FR } from "./static-page-fr-phrases.mjs";
import { STATIC_PAGE_DE } from "./static-page-de-phrases.mjs";
import { STATIC_PAGE_IT } from "./static-page-it-phrases.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vendiLib = path.join(__dirname, "..", "artifacts", "vendi", "src", "lib");
const frPath = path.join(vendiLib, "static-pages-i18n-fr.ts");
const frSrc = fs.readFileSync(frPath, "utf8");

function buildFromFr(targetMap, exportName, localeComment) {
  let out = frSrc
    .replace(
      "/** French static pages — hand-maintained (do not auto-overwrite). */",
      `/** ${localeComment} static pages — generated from FR template + phrase map. */`,
    )
    .replace("export const FR_STATIC_PAGES", `export const ${exportName}`);

  const pairs = Object.entries(STATIC_PAGE_FR)
    .map(([en, fr]) => [fr, targetMap[en] ?? en])
    .filter(([fr, tr]) => fr !== tr)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [fr, tr] of pairs) {
    out = out.split(fr).join(tr);
  }
  return out;
}

fs.writeFileSync(
  path.join(vendiLib, "static-pages-i18n-de.ts"),
  buildFromFr(STATIC_PAGE_DE, "DE_STATIC_PAGES", "German"),
  "utf8",
);
fs.writeFileSync(
  path.join(vendiLib, "static-pages-i18n-it.ts"),
  buildFromFr(STATIC_PAGE_IT, "IT_STATIC_PAGES", "Italian"),
  "utf8",
);
console.log("Wrote static-pages-i18n-de.ts + static-pages-i18n-it.ts (from FR template)");
