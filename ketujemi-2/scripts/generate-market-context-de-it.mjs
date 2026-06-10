/**
 * Generates market-context-de.ts and market-context-it.ts from EN translations block.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { englishToGerman } from "./albanian-german.mjs";
import { englishToItalian } from "./albanian-italian.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vendiLib = path.join(__dirname, "..", "artifacts", "vendi", "src", "lib");
const mcPath = path.join(vendiLib, "market-context.tsx");
const src = fs.readFileSync(mcPath, "utf8");

const enStart = src.indexOf("\n  en: {");
const frStart = src.indexOf("\n  fr: FR_TRANSLATIONS");
if (enStart < 0 || frStart < 0) throw new Error("EN or FR block not found in market-context.tsx");

const enBody = src.slice(enStart + "\n  en: {".length, frStart);
const MARKET_OVERRIDES_DE = {
  markets: "KetuJemi auf 11 Märkten",
};
const MARKET_OVERRIDES_IT = {
  markets: "KetuJemi in 11 mercati",
};

const entries = [...enBody.matchAll(/(\w+):\s*(?:"((?:\\.|[^"\\])*)"|`([\s\S]*?)`)/g)].map((m) => ({
  key: m[1],
  value: (m[2] ?? m[3] ?? "").replace(/\\n/g, "\n").replace(/\\"/g, '"'),
}));

function escapeTs(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");
}

function formatBlock(locale, trFn) {
  const overrides = locale === "de" ? MARKET_OVERRIDES_DE : MARKET_OVERRIDES_IT;
  const lines = entries.map(({ key, value }) => {
    const translated = overrides[key] ?? trFn(value);
    const v =
      translated.includes("\n") || translated.length > 100
        ? `\`${translated.replace(/`/g, "\\`")}\``
        : `"${escapeTs(translated)}"`;
    return `  ${key}: ${v},`;
  });
  const constName = locale === "de" ? "DE_TRANSLATIONS" : "IT_TRANSLATIONS";
  return `/** ${locale === "de" ? "German" : "Italian"} UI strings — merged into TRANSLATIONS.${locale} in market-context.tsx */\nexport const ${constName}: Record<string, string> = {\n${lines.join("\n")}\n};\n`;
}

fs.writeFileSync(path.join(vendiLib, "market-context-de.ts"), formatBlock("de", englishToGerman), "utf8");
fs.writeFileSync(path.join(vendiLib, "market-context-it.ts"), formatBlock("it", englishToItalian), "utf8");
console.log(`Wrote market-context-de.ts + market-context-it.ts (${entries.length} keys each)`);
