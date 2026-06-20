/**
 * Idempotent full category tree restore (parents → subcats → models → images).
 * Safe to re-run; does not touch users, listings, or shops.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveAppRoot, resolveMonorepoRoot } from "./resolve-app-root.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = resolveAppRoot();
const monorepoRoot = resolveMonorepoRoot(appRoot);
const dbPkgDir = path.join(appRoot, "lib", "db");

const FILTER_SEEDS = [
  "seed",
  "seed:femije-subcats",
  "seed:arsim-kurse-subcats",
  "seed:muzike-hobby-subcats",
  "seed:auto-pjese-extra-types",
  "seed:car-models",
  "seed:motor-models",
  "seed:truck-models",
  "seed:category-images",
  "seed:parent-images",
  "seed:femije-hub-photos",
];

const TSX_SEEDS = [
  "seed-rroba-kepuce-subcategories.ts",
  "seed-pune-sherbime-extra-subcategories.ts",
];

function runStep(label, args, cwd) {
  console.log(`[seed-all-categories] → ${label}`);
  const result = spawnSync("pnpm", args, {
    cwd,
    env: { ...process.env, CI: "true" },
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(`${label} failed (exit ${result.status ?? 1})`);
  }
}

export function seedAllCategories() {
  console.log("[seed-all-categories] monorepo root:", monorepoRoot);

  for (const script of FILTER_SEEDS) {
    runStep(script, ["--filter", "@workspace/db", "run", script], monorepoRoot);
  }

  for (const file of TSX_SEEDS) {
    runStep(file, ["exec", "tsx", `./src/${file}`], dbPkgDir);
  }

  console.log("[seed-all-categories] done — category tree restored.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    seedAllCategories();
    process.exit(0);
  } catch (err) {
    console.error("[seed-all-categories]", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
