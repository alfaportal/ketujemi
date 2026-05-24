import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyDatabaseUrlFromEnv } from "./normalize-database-url.js";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

/** Railway/CI inject DATABASE_URL — never overwrite with .env on server. */
const injected = process.env.DATABASE_URL?.trim();
if (injected) {
  applyDatabaseUrlFromEnv();
} else {
  config({ path: path.join(rootDir, ".env") });
  applyDatabaseUrlFromEnv();
}
