/**
 * Trim 13–14.06 listings, then boost all other low-view listings + shops.
 * Usage: pnpm -C ketujemi-2/artifacts/api-server run run:views-rebalance
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
const { boostLowViewCounts } = await import("../lib/views-boost.js");
const { logger } = await import("../lib/logger.js");

const trim = await trimExcessBoostedViews();
const boost = await boostLowViewCounts();
const result = { trim, boost };
logger.info(result, "views rebalance finished");
console.log(JSON.stringify(result, null, 2));
process.exit(0);
