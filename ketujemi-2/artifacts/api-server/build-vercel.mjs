/**
 * Bundle Express API for Vercel serverless (repo root /api/*.mjs).
 * Run from ketujemi-2: node artifacts/api-server/build-vercel.mjs
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuildPkg from "esbuild";
import { mkdir } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const { build: esbuildBuild } = esbuildPkg;
const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const repoApiDir = path.resolve(artifactDir, "../../../api");

const banner = {
  js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);`,
};

const shared = {
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  logLevel: "info",
  banner,
  external: [
    "*.node",
    "sharp",
    "better-sqlite3",
    "sqlite3",
    "bcrypt",
    "pg-native",
    "puppeteer",
    "puppeteer-core",
    "electron",
  ],
};

await mkdir(path.join(repoApiDir, "cron"), { recursive: true });

await esbuildBuild({
  ...shared,
  entryPoints: [path.join(artifactDir, "src/vercel-handler.ts")],
  outfile: path.join(repoApiDir, "handler.mjs"),
  sourcemap: true,
});

await esbuildBuild({
  ...shared,
  entryPoints: [path.join(artifactDir, "src/vercel-cron.ts")],
  outfile: path.join(repoApiDir, "cron/jobs.mjs"),
  sourcemap: true,
});

console.info("[build-vercel] wrote api/handler.mjs and api/cron/jobs.mjs");
