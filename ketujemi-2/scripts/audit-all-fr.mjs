import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const lib = path.join(__dirname, "..", "artifacts", "vendi", "src", "lib");

const ALB = /[ëçËÇ]/;
const SERB = /[čšžđćČŠŽĐĆ]/;
const EN_LEAK = /\b(Select|Search|Show|Choose|All|Price|Category|Subcategory|Listing|Shop|Store|Partner)\b/i;

function parseTsRecord(filePath, constName) {
  const src = fs.readFileSync(filePath, "utf8");
  const marker = `const ${constName}`;
  const start = src.indexOf(marker);
  if (start < 0) return [];
  const open = src.indexOf("{", start);
  let depth = 0;
  let body = "";
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) {
        body = src.slice(open + 1, i);
        break;
      }
    }
  }
  const entries = [];
  const re = /^\s+(\w+):\s*(?:"((?:\\.|[^"\\])*)"|`([\s\S]*?)`),?\s*$/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    entries.push({ key: m[1], value: (m[2] ?? m[3] ?? "").replace(/\\n/g, "\n") });
  }
  return entries;
}

function auditFile(label, entries) {
  const bad = [];
  for (const { key, value } of entries) {
    if (ALB.test(value) || SERB.test(value)) bad.push({ key, value, reason: "alb/serb" });
    else if (EN_LEAK.test(value) && !key.includes("brand") && !/^(nav_|home_|ui_)/.test(key)) {
      // French often has "Shop" in loanwords — only flag obvious EN
      if (/\b(Select|Search|Choose|Show|Listing|Subcategory|Category)\b/.test(value)) {
        bad.push({ key, value, reason: "english" });
      }
    }
  }
  console.log(`\n=== ${label}: ${bad.length} suspicious / ${entries.length} total ===`);
  for (const b of bad.slice(0, 25)) console.log(`  [${b.reason}] ${b.key} → ${b.value.slice(0, 90)}`);
  if (bad.length > 25) console.log(`  ... +${bad.length - 25} more`);
  return bad;
}

// app-extra FR
const frExtra = parseTsRecord(path.join(lib, "app-extra-i18n-fr.ts"), "FR_EXTRA");
auditFile("app-extra-i18n-fr.ts", frExtra);

// shop subcategory FR
const shopSubSrc = fs.readFileSync(path.join(lib, "shop-directory-subcategory-i18n.generated.ts"), "utf8");
const shopFr = [];
for (const m of shopSubSrc.matchAll(/SHOP_SUB_FR[^=]*=\s*\{([\s\S]*?)\};/g)) {
  const body = m[1];
  const re2 = /"([^"]+)":\s*"((?:\\.|[^"\\])*)"/g;
  let x;
  while ((x = re2.exec(body)) !== null) shopFr.push({ key: x[1], value: x[2] });
}
auditFile("shop-directory-subcategory FR", shopFr);

// shop page i18n files
for (const f of [
  "shop-detail-i18n.ts",
  "shop-application-i18n.ts",
  "shop-dashboard-i18n.ts",
  "open-shop-page-i18n.ts",
]) {
  const src = fs.readFileSync(path.join(lib, f), "utf8");
  const frBlock = src.match(/const FR[^=]*=\s*\{([\s\S]*?)\};/);
  if (!frBlock) continue;
  const entries = [];
  const re3 = /(\w+):\s*"((?:\\.|[^"\\])*)"/g;
  let m;
  while ((m = re3.exec(frBlock[1])) !== null) entries.push({ key: m[1], value: m[2] });
  auditFile(f, entries);
}

// category FR
const catFrSrc = fs.readFileSync(path.join(lib, "category-translations-fr.generated.ts"), "utf8");
const catFr = [];
for (const m of catFrSrc.matchAll(/"([^"]+)":\s*"((?:\\.|[^"\\])*)"/g)) {
  catFr.push({ key: m[1], value: m[2] });
}
auditFile("category-translations-fr", catFr);
