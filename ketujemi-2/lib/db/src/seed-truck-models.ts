import "./load-env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { truckModelsTable } from "./schema/truck-models";
import { TRUCK_MODEL_SEED_ROWS } from "./data/truck-model-seed-rows";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { truckModelsTable } });
  console.log("[seed-truck-models] Clearing truck_models...");
  await db.delete(truckModelsTable);
  console.log(`[seed-truck-models] Inserting ${TRUCK_MODEL_SEED_ROWS.length} rows…`);
  for (const row of TRUCK_MODEL_SEED_ROWS) {
    await db.insert(truckModelsTable).values(row);
  }
  await pool.end();
  console.log("[seed-truck-models] Done.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
