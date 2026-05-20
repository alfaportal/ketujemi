/**
 * Separate config for `pnpm run introspect` — drizzle-kit forbids mixing
 * `--config` with `--out` on the CLI; `out` must live in this file.
 */
import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";

const dbDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dbDir, "..", "..");
loadEnv({ path: path.join(rootDir, ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set (ketujemi-2/.env)");
}

export default defineConfig({
  out: "./drizzle/introspected",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
