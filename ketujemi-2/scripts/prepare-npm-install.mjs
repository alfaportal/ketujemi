/**
 * Replace pnpm-only "catalog:" versions with concrete semver for npm workspaces.
 * Used in Railway Docker builds (npm install, no corepack/pnpm).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const monorepoRoot = fs.existsSync(path.join(appRoot, "..", "pnpm-workspace.yaml"))
  ? path.resolve(appRoot, "..")
  : appRoot;
const root = appRoot;

function parseCatalog(yamlText) {
  const catalog = {};
  const lines = yamlText.split("\n");
  let inCatalog = false;
  for (const line of lines) {
    if (/^catalog:\s*$/.test(line)) {
      inCatalog = true;
      continue;
    }
    if (inCatalog) {
      if (/^\S/.test(line) && !line.startsWith(" ")) break;
      const m = line.match(/^\s+['"]?([^'"]+)['"]?\s*:\s*(.+?)\s*$/);
      if (m) catalog[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
    }
  }
  return catalog;
}

function patchPackageJson(filePath, catalog) {
  const raw = fs.readFileSync(filePath, "utf8");
  const pkg = JSON.parse(raw);
  let changed = false;

  for (const section of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    const deps = pkg[section];
    if (!deps || typeof deps !== "object") continue;

    for (const [name, version] of Object.entries(deps)) {
      if (typeof version !== "string") continue;
      if (version === "catalog:") {
        const resolved = catalog[name];
        if (!resolved) {
          throw new Error(`Missing catalog entry for ${name} in ${filePath}`);
        }
        deps[name] = resolved;
        changed = true;
      } else if (version.startsWith("catalog:")) {
        const key = version.slice("catalog:".length) || name;
        const resolved = catalog[key];
        if (!resolved) {
          throw new Error(`Missing catalog entry for ${key} in ${filePath}`);
        }
        deps[name] = resolved;
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`);
  }
}

function walkPackageJson(dir, catalog) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPackageJson(full, catalog);
      continue;
    }
    if (entry.name === "package.json") {
      patchPackageJson(full, catalog);
    }
  }
}

const workspaceYaml = fs.readFileSync(path.join(monorepoRoot, "pnpm-workspace.yaml"), "utf8");
const catalog = parseCatalog(workspaceYaml);
walkPackageJson(root, catalog);
console.log("[prepare-npm-install] catalog: entries resolved for npm");
