import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PANEL_FR } from "./panel-i18n.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frSrc = fs.readFileSync(
  path.join(__dirname, "..", "artifacts", "vendi", "src", "lib", "app-extra-i18n-fr.ts"),
  "utf8",
);
const ks = JSON.parse(fs.readFileSync(path.join(__dirname, "panel-ks-source.json"), "utf8"));
const prefixes = Object.keys(ks);
const ALB = /[ëçËÇ]/;
const SERB = /[čšžđćČŠŽĐĆ]/;
const re = /^\s+(\w+):\s*(?:"((?:\\.|[^"\\])*)"|`([\s\S]*?)`),?\s*$/gm;
const frMap = new Map();
let m;
while ((m = re.exec(frSrc)) !== null) {
  frMap.set(m[1], (m[2] ?? m[3] ?? "").replace(/\\n/g, "\n"));
}
let missingOverride = 0;
let bad = 0;
for (const p of prefixes) {
  let pBad = 0;
  for (const key of Object.keys(ks[p])) {
    if (!PANEL_FR[key]) missingOverride++;
    const val = frMap.get(key) ?? "";
    if (ALB.test(val) || SERB.test(val)) {
      bad++;
      pBad++;
      if (pBad <= 3) console.log("BAD", key, "→", val.slice(0, 70));
    }
  }
  console.log(`${p} bad=${pBad}`);
}
console.log(`Missing in PANEL_FR: ${missingOverride}, Total bad FR: ${bad}`);
