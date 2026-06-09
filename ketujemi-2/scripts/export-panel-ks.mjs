import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(__dirname, "..", "artifacts", "vendi", "src", "lib", "app-extra-i18n.ts"), "utf8");
const start = src.indexOf("const KS_EXTRA");
const open = src.indexOf("{", start);
let depth = 0;
let ksBody = "";
for (let i = open; i < src.length; i++) {
  if (src[i] === "{") depth++;
  else if (src[i] === "}") {
    depth--;
    if (depth === 0) {
      ksBody = src.slice(open + 1, i);
      break;
    }
  }
}
const prefixes = ["ak_", "lz_", "so_", "mh_", "ps_", "rk_", "ksh_", "bb_", "ep_", "md_", "ni_", "kl_", "tel_"];
const re = /^\s+(\w+):\s*(?:"((?:\\.|[^"\\])*)"|`([\s\S]*?)`),?\s*$/gm;
const out = {};
let m;
while ((m = re.exec(ksBody)) !== null) {
  const key = m[1];
  const val = (m[2] ?? m[3] ?? "").replace(/\\n/g, "\n").replace(/\\"/g, '"');
  for (const p of prefixes) {
    if (key.startsWith(p)) {
      if (!out[p]) out[p] = {};
      out[p][key] = val;
    }
  }
}
const outPath = path.join(__dirname, "panel-ks-source.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
for (const p of prefixes) console.log(p, Object.keys(out[p] ?? {}).length);
