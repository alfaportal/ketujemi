/**
 * Builds static-pages-i18n-fr.ts from hand-maintained EN + phrase map.
 * Run: node ketujemi-2/scripts/build-static-fr.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyFrenchPhrases } from "./french-phrases.mjs";
import { STATIC_PAGE_FR } from "./static-page-fr-phrases.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vendiLib = path.join(__dirname, "..", "artifacts", "vendi", "src", "lib");
const enPath = path.join(vendiLib, "static-pages-i18n-en.ts");
const frPath = path.join(vendiLib, "static-pages-i18n-fr.ts");

const PLACEHOLDER_RE = /\{[a-zA-Z0-9_]+\}/g;

function translateEnToFr(text) {
  if (STATIC_PAGE_FR[text]) return STATIC_PAGE_FR[text];
  const tokens = [];
  const masked = text.replace(PLACEHOLDER_RE, (m) => {
    const id = `__PH${tokens.length}__`;
    tokens.push(m);
    return id;
  });
  let out = applyFrenchPhrases(masked);
  tokens.forEach((ph, i) => {
    out = out.split(`__PH${i}__`).join(ph);
  });
  return out;
}

function escapeTs(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");
}

function translateLiterals(chunk) {
  const tr = (inner) => escapeTs(translateEnToFr(inner.replace(/\\n/g, "\n").replace(/\\"/g, '"')));
  let out = chunk.replace(
    /^(\s+)(\w+):\s*"((?:\\.|[^"\\])*)"/gm,
    (_, indent, key, inner) => `${indent}${key}: "${tr(inner)}"`,
  );
  out = out.replace(
    /^(\s+)"((?:\\.|[^"\\])*)",?\s*$/gm,
    (_, indent, inner) => `${indent}"${tr(inner)}",`,
  );
  return out;
}

const enSrc = fs.readFileSync(enPath, "utf8");
const start = enSrc.indexOf("export const EN_STATIC_PAGES");
const block = enSrc.slice(start);
let frBlock = block
  .replace("export const EN_STATIC_PAGES", "export const FR_STATIC_PAGES")
  .replace(/EN_STATIC_PAGES/g, "FR_STATIC_PAGES");
frBlock = translateLiterals(frBlock);

fs.writeFileSync(
  frPath,
  `/** Hand-built from static-pages-i18n-en.ts — run ketujemi-2/scripts/build-static-fr.mjs */\nimport type { StaticPagesCopy } from "./static-pages-i18n";\n\n${frBlock}\n`,
  "utf8",
);
console.log(`Wrote ${frPath}`);
