/** Find DE/IT market-context keys still identical to EN (likely leaks). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lib = path.join(root, "artifacts/vendi/src/lib");

function parseRecord(src) {
  const o = {};
  for (const m of src.matchAll(/^\s+(\w+):\s*(?:"((?:\\.|[^"\\])*)"|`([\s\S]*?)`)/gm)) {
    o[m[1]] = (m[2] ?? m[3] ?? "").replace(/\\n/g, "\n").replace(/\\"/g, '"');
  }
  return o;
}

const mc = fs.readFileSync(path.join(lib, "market-context.tsx"), "utf8");
const enStart = mc.indexOf("\n  en: {");
const frStart = mc.indexOf("\n  fr: FR_TRANSLATIONS");
const en = parseRecord(mc.slice(enStart, frStart));
const de = parseRecord(fs.readFileSync(path.join(lib, "market-context-de.ts"), "utf8"));
const it = parseRecord(fs.readFileSync(path.join(lib, "market-context-it.ts"), "utf8"));

function leaks(label, loc) {
  const bad = Object.keys(en).filter((k) => loc[k] === en[k] && /[A-Za-z]{3}/.test(en[k]));
  console.log(`\n${label}: ${bad.length} keys identical to EN`);
  for (const k of bad) console.log(`  ${k}`);
  return bad.length;
}

const total = leaks("DE", de) + leaks("IT", it);
process.exit(total > 0 ? 1 : 0);
