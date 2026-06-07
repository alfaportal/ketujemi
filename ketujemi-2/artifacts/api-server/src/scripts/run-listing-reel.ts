/**
 * Generate and post a listing slideshow Reel immediately (CLI / Railway one-off).
 * Usage: pnpm -C ketujemi-2 run run:listing-reel
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCliEnvFiles } from "./load-cli-env.js";

const ketujemi2Root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

loadCliEnvFiles(ketujemi2Root);

await import("@workspace/db");
const { initializeFacebookPageAccessToken } = await import("../services/socialMedia.js");
const { runListingReelPostNow } = await import("../lib/listing-reel-cron.js");
const { logger } = await import("../lib/logger.js");

await initializeFacebookPageAccessToken();

const result = await runListingReelPostNow();
logger.info(result, "listing reel manual run finished");
console.log(JSON.stringify(result, null, 2));
process.exit(result.posted ? 0 : 1);
