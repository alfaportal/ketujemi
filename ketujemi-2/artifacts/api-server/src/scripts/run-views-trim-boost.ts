/**
 * One-time: subtract ~20 views from boosted listings/shops (views >= 20).
 * Usage: pnpm -C ketujemi-2/artifacts/api-server run run:views-trim-boost
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

const { pool, ensureShopSchema } = await import("@workspace/db");
await ensureShopSchema(pool);

const { trimExcessBoostedViews } = await import("../lib/views-boost-trim.js");
const { logger } = await import("../lib/logger.js");

const result = await trimExcessBoostedViews();
logger.info(result, "views trim manual run finished");
console.log(JSON.stringify(result, null, 2));
process.exit(0);
