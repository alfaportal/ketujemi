import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(root, "src/lib/app-extra-i18n.ts"), "utf8");

function extractBlock(name) {
  const start = src.indexOf(`const ${name}: Record<string, string> = {`);
  if (start < 0) throw new Error(`Block ${name} not found`);
  let i = start + `const ${name}: Record<string, string> = {`.length;
  let depth = 1;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }
  const body = src.slice(start, i);
  const keys = [...body.matchAll(/^\s+([a-zA-Z0-9_]+):/gm)].map((m) => m[1]);
  return new Set(keys);
}

const ks = extractBlock("KS_EXTRA");
const mk = extractBlock("MK_EXTRA");
const mne = extractBlock("MNE_EXTRA");

const missMk = [...ks].filter((k) => !mk.has(k)).sort();
const missMne = [...ks].filter((k) => !mne.has(k)).sort();

console.log("KS_EXTRA:", ks.size);
console.log("MK_EXTRA:", mk.size, "| missing:", missMk.length);
console.log("MNE_EXTRA:", mne.size, "| missing:", missMne.length);

if (missMk.length) {
  console.log("\nMK missing keys:");
  console.log(missMk.join("\n"));
}
if (missMne.length) {
  console.log("\nMNE missing keys:");
  console.log(missMne.join("\n"));
}

const mcPath = path.join(root, "src/lib/market-context.tsx");
const mc = fs.readFileSync(mcPath, "utf8");
for (const lang of ["ks", "mk", "mne"]) {
  const re = new RegExp(`\\n  ${lang}: \\{([\\s\\S]*?)\\n  \\},\\n  [a-z]+: \\{`, "m");
  const m = mc.match(re);
  if (!m) {
    console.log(`\nmarket-context ${lang}: block not found`);
    continue;
  }
  const keys = [...m[1].matchAll(/^\s+([a-zA-Z0-9_]+):/gm)].map((x) => x[1]);
  console.log(`\nmarket-context ${lang}:`, keys.length, "keys");
}

process.exit(missMk.length + missMne.length > 0 ? 1 : 0);
