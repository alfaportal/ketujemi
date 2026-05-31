import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function extractObjectKeys(filePath, startMarker) {
  const src = fs.readFileSync(filePath, "utf8");
  const start = src.indexOf(startMarker);
  if (start < 0) return null;
  let i = start + startMarker.length;
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

function compareSets(name, base, other, otherName) {
  const missing = [...base].filter((k) => !other.has(k)).sort();
  if (missing.length) {
    console.log(`\n${name} → ${otherName}: ${missing.length} missing`);
    console.log(missing.slice(0, 20).join(", ") + (missing.length > 20 ? "…" : ""));
    return missing.length;
  }
  console.log(`${name} → ${otherName}: OK (${base.size} keys)`);
  return 0;
}

let issues = 0;

// app-extra-i18n
const extraPath = path.join(root, "src/lib/app-extra-i18n.ts");
const ksExtra = extractObjectKeys(extraPath, "const KS_EXTRA: Record<string, string> = {");
const mkExtra = extractObjectKeys(extraPath, "const MK_EXTRA: Record<string, string> = {");
const mneExtra = extractObjectKeys(extraPath, "const MNE_EXTRA: Record<string, string> = {");
if (ksExtra && mkExtra && mneExtra) {
  issues += compareSets("KS_EXTRA", ksExtra, mkExtra, "MK_EXTRA");
  issues += compareSets("KS_EXTRA", ksExtra, mneExtra, "MNE_EXTRA");
}

// market-context base translations
const mcPath = path.join(root, "src/lib/market-context.tsx");
const mc = fs.readFileSync(mcPath, "utf8");
for (const base of ["ks"]) {
  const others = ["mk", "mne"];
  const baseKeys = extractObjectKeys(mcPath, `\n  ${base}: {`);
  if (!baseKeys) {
    console.log(`market-context ${base}: not found`);
    continue;
  }
  for (const lang of others) {
    const langKeys = extractObjectKeys(mcPath, `\n  ${lang}: {`);
    if (langKeys) issues += compareSets(`TRANSLATIONS.${base}`, baseKeys, langKeys, lang);
  }
}

// arsim form i18n
const akPath = path.join(root, "src/lib/arsim-kurse-form-i18n.ts");
const ksAk = extractObjectKeys(akPath, "const KS: Record<string, string> = {");
const mkAk = extractObjectKeys(akPath, "const MK: Record<string, string> = {");
const mneAk = extractObjectKeys(akPath, "const MNE: Record<string, string> = {");
if (ksAk && mkAk && mneAk) {
  issues += compareSets("AK_FORM KS", ksAk, mkAk, "MK");
  issues += compareSets("AK_FORM KS", ksAk, mneAk, "MNE");
}

console.log(issues === 0 ? "\n✓ All checked bundles in sync." : `\n✗ ${issues} bundle gaps found.`);
process.exit(issues > 0 ? 1 : 0);
