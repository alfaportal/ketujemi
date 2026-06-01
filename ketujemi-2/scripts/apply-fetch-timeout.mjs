import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "artifacts", "vendi", "src");
const IMPORT_LINE = `import { fetchWithTimeout } from "@/lib/fetch-with-timeout";\n`;

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (/\.(ts|tsx)$/.test(name) && !name.includes("fetch-with-timeout")) files.push(p);
  }
  return files;
}

for (const file of walk(root)) {
  let src = fs.readFileSync(file, "utf8");
  if (!/(?<![\w.])fetch\s*\(/.test(src)) continue;
  if (src.includes("fetch-with-timeout")) {
    src = src.replace(/(?<![\w.])fetch\s*\(/g, "fetchWithTimeout(");
  } else {
    src = src.replace(/(?<![\w.])fetch\s*\(/g, "fetchWithTimeout(");
    const importMatch = src.match(/^import .+;\r?\n/m);
    if (importMatch) {
      const idx = importMatch.index + importMatch[0].length;
      src = src.slice(0, idx) + IMPORT_LINE + src.slice(idx);
    } else {
      src = IMPORT_LINE + src;
    }
  }
  fs.writeFileSync(file, src);
  console.log("updated", path.relative(root, file));
}
