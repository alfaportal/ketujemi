import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lib = path.join(root, "artifacts/vendi/src/lib");

function parseValues(file) {
  const src = fs.readFileSync(path.join(lib, file), "utf8");
  const out = {};
  for (const m of src.matchAll(/"((?:\\.|[^"\\])+)": "((?:\\.|[^"\\])*)"/g)) {
    out[m[1].replace(/\\"/g, '"')] = m[2].replace(/\\"/g, '"');
  }
  return out;
}

const de = parseValues("category-translations-de.generated.ts");
const it = parseValues("category-translations-it.generated.ts");
const en = parseValues("category-translations-en.generated.ts");
const ALB = /[ëçËÇ]/;

let issues = 0;
for (const [label, obj] of [
  ["DE", de],
  ["IT", it],
]) {
  const alb = Object.entries(obj).filter(([, v]) => ALB.test(v));
  const sameEn = Object.entries(obj).filter(([k, v]) => en[k] === v);
  console.log(`\n${label}: ${Object.keys(obj).length} labels, ${alb.length} Albanian leaks in values, ${sameEn.length} identical to EN`);
  for (const [k, v] of alb.slice(0, 15)) {
    console.log(`  ALB  ${k} → ${v}`);
    issues++;
  }
}
process.exit(issues > 0 ? 1 : 0);
