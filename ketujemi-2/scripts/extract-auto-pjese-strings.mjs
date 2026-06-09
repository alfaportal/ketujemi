import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(
  path.join(__dirname, "..", "artifacts", "vendi", "src", "lib", "auto-pjese-search-helpers.ts"),
  "utf8",
);
const strings = new Set();
for (const m of src.matchAll(/label:\s*"([^"]+)"/g)) strings.add(m[1]);
for (const m of src.matchAll(/items:\s*\[([\s\S]*?)\]/g)) {
  for (const s of m[1].matchAll(/"([^"]+)"/g)) strings.add(s[1]);
}
const sorted = [...strings].sort();
fs.writeFileSync(
  path.join(__dirname, "auto-pjese-strings.json"),
  JSON.stringify(sorted, null, 2),
  "utf8",
);
console.log("strings", sorted.length);
