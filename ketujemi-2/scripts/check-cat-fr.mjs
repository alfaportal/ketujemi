import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const path = join(dirname(fileURLToPath(import.meta.url)), "../artifacts/vendi/src/lib/category-translations-fr.generated.ts");
const s = readFileSync(path, "utf8");
const ALB = /[ëçËÇ]/;
const bad = [...s.matchAll(/"((?:\\.|[^"\\])+)"\s*:\s*"((?:\\.|[^"\\])+)"\s*,/g)]
  .map(([, k, v]) => [k.replace(/\\"/g, '"'), v.replace(/\\"/g, '"')])
  .filter(([k, v]) => ALB.test(v) || (v === k && /[A-Za-z]/.test(k)));

const albOnly = bad.filter(([, v]) => ALB.test(v));
console.log("remaining:", bad.length, "albanian in value:", albOnly.length);
for (const [k, v] of albOnly) console.log(`${k} -> ${v}`);
