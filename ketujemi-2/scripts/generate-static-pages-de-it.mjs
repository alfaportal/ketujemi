/**
 * Generates static-pages-i18n-de.ts and static-pages-i18n-it.ts from EN static pages.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { englishToGerman } from "./albanian-german.mjs";
import { englishToItalian } from "./albanian-italian.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vendiLib = path.join(__dirname, "..", "artifacts", "vendi", "src", "lib");
const enPath = path.join(vendiLib, "static-pages-i18n-en.ts");
let enSrc = fs.readFileSync(enPath, "utf8");

function translateSrc(src, trFn) {
  return src.replace(/"((?:\\.|[^"\\])*)"/g, (_, inner) => {
    const decoded = inner.replace(/\\n/g, "\n").replace(/\\"/g, '"');
    if (!/[A-Za-z]/.test(decoded)) return `"${inner}"`;
    return `"${trFn(decoded).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  }).replace(/`([\s\S]*?)`/g, (_, inner) => {
    const tr = trFn(inner);
    return `\`${tr.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")}\``;
  });
}

const deSrc = translateSrc(
  enSrc.replace("export const EN_STATIC_PAGES", "export const DE_STATIC_PAGES"),
  englishToGerman,
);
const itSrc = translateSrc(
  enSrc.replace("export const EN_STATIC_PAGES", "export const IT_STATIC_PAGES"),
  englishToItalian,
);

fs.writeFileSync(path.join(vendiLib, "static-pages-i18n-de.ts"), deSrc, "utf8");
fs.writeFileSync(path.join(vendiLib, "static-pages-i18n-it.ts"), itSrc, "utf8");
console.log("Wrote static-pages-i18n-de.ts + static-pages-i18n-it.ts");
