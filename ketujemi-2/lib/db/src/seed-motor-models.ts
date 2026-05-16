import "./load-env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { motorModelsTable } from "./schema/motor-models";
import { MOTOR_MODEL_SEED_ROWS } from "./data/motor-model-seed-rows";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { motorModelsTable } });
  console.log("[seed-motor-models] Clearing motor_models...");
  await db.delete(motorModelsTable);
  console.log(`[seed-motor-models] Inserting ${MOTOR_MODEL_SEED_ROWS.length} rows…`);
  for (const row of MOTOR_MODEL_SEED_ROWS) {
    await db.insert(motorModelsTable).values(row);
  }
  await pool.end();
  console.log("[seed-motor-models] Done.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
