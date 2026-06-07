/**
 * Generate and post a listing slideshow Reel immediately (CLI / Railway one-off).
 * Usage: pnpm -C ketujemi-2 run run:listing-reel
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ketujemi2Root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = val;
    }
  }
}

loadEnvFile(path.join(ketujemi2Root, ".env.staging"));
loadEnvFile(path.join(ketujemi2Root, ".env"));

await import("@workspace/db");
const { initializeFacebookPageAccessToken } = await import("../services/socialMedia.js");
const { runListingReelPostNow } = await import("../lib/listing-reel-cron.js");
const { logger } = await import("../lib/logger.js");

await initializeFacebookPageAccessToken();

const result = await runListingReelPostNow();
logger.info(result, "listing reel manual run finished");
console.log(JSON.stringify(result, null, 2));
process.exit(result.posted ? 0 : 1);
