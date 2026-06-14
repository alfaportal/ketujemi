/**
 * One-time views boost for active listings/shops with views < 30.
 * Usage: pnpm -C ketujemi-2/artifacts/api-server run run:views-boost
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

const { boostLowViewCounts } = await import("../lib/views-boost.js");
const { logger } = await import("../lib/logger.js");

const result = await boostLowViewCounts();
logger.info(result, "views boost manual run finished");
console.log(JSON.stringify(result, null, 2));
process.exit(0);
