import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Gjen ketujemi-2 pavarësisht nëse Railway root është repo root apo ketujemi-2/. */
export function resolveAppRoot() {
  const candidates = [
    process.cwd(),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "ketujemi-2"),
    path.resolve(process.cwd(), "ketujemi-2"),
  ];

  for (const dir of candidates) {
    const pkg = path.join(dir, "package.json");
    const vendi = path.join(dir, "artifacts", "vendi", "package.json");
    if (fs.existsSync(pkg) && fs.existsSync(vendi)) return dir;
  }

  throw new Error(
    "S'u gjet ketujemi-2. Vendos Railway Root Directory = ketujemi-2 ose build nga monorepo root.",
  );
}
