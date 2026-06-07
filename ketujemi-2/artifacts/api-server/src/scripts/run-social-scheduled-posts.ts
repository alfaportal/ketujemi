/**
 * Run Facebook + Instagram scheduled-post cron cycles immediately (CLI / Railway one-off).
 * Usage: pnpm -C ketujemi-2 run run:social-scheduled-posts
 * Railway: pnpm -C ketujemi-2 run run:social-scheduled-posts:railway
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
const { runInstagramScheduledPostNow } = await import("../lib/instagram-scheduled-post-cron.js");
const { logger } = await import("../lib/logger.js");

await initializeFacebookPageAccessToken();

const facebook = await runFacebookScheduledPostNow();
const instagram = await runInstagramScheduledPostNow();

const payload = { facebook, instagram };
logger.info(payload, "social scheduled posts manual run finished");
console.log(JSON.stringify(payload, null, 2));

const anyPosted = facebook.posted || instagram.posted;
process.exit(anyPosted ? 0 : 1);
