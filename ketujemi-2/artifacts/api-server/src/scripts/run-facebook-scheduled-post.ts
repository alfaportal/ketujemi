/**
 * Run one Facebook scheduled-post cron cycle immediately (CLI / Railway one-off).
 * Usage: pnpm -C ketujemi-2 run run:facebook-scheduled-post
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
const { runFacebookScheduledPostNow } = await import("../lib/facebook-scheduled-post-cron.js");
const { logger } = await import("../lib/logger.js");

await initializeFacebookPageAccessToken();
const result = await runFacebookScheduledPostNow();
logger.info({ result }, "facebook scheduled post manual run finished");
console.log(JSON.stringify(result, null, 2));
process.exit(result.posted ? 0 : 1);
