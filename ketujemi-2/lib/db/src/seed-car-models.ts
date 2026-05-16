import "./load-env.js";
import { db, pool } from "./index.js";
import { carModelsTable } from "./schema/car-models.js";
import { CAR_MODEL_SEED_ROWS } from "./data/car-model-seed-rows.js";

async function seedCarModels(): Promise<void> {
  console.log("[seed-car-models] Replacing reference car_models…");
  await db.delete(carModelsTable);
  await db.insert(carModelsTable).values([...CAR_MODEL_SEED_ROWS]);
  console.log(`[seed-car-models] Inserted ${CAR_MODEL_SEED_ROWS.length} rows.`);
}

seedCarModels()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
