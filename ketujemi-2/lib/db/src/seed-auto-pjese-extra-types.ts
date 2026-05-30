import "./load-env.js";
import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { categoriesTable } from "./schema/categories.js";
import {
  AUTO_PJESE_EXTRA_TYPES,
  AUTO_PJESE_HUB_SLUG,
} from "./auto-pjese-extra-types-catalog.js";

const ICON = "Wrench";

async function ensureCategory(data: {
  name: string;
  slug: string;
  icon: string;
  parent_id?: number | null;
}): Promise<number> {
  const existing = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, data.slug))
    .limit(1);

  if (existing[0]) return existing[0].id;

  const [row] = await db
    .insert(categoriesTable)
    .values({
      name: data.name,
      slug: data.slug,
      icon: data.icon,
      parent_id: data.parent_id ?? null,
    })
    .returning({ id: categoriesTable.id });

  return row.id;
}

export async function seedAutoPjeseExtraTypesAlways(): Promise<void> {
  const hub = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, AUTO_PJESE_HUB_SLUG))
    .limit(1);

  if (!hub[0]) {
    console.warn(
      `[seed] Skip Auto Pjesë extra types — hub "${AUTO_PJESE_HUB_SLUG}" not found.`,
    );
    return;
  }

  const hubId = hub[0].id;
  let types = 0;

  for (const type of AUTO_PJESE_EXTRA_TYPES) {
    await ensureCategory({
      name: type.name,
      slug: type.slug,
      icon: ICON,
      parent_id: hubId,
    });
    types += 1;
  }

  console.log(
    `[seed] Auto Pjesë extra under «${hub[0].name}» (id=${hubId}): ${types} types.`,
  );
}

async function main() {
  await seedAutoPjeseExtraTypesAlways();
}

const isDirectRun = process.argv[1]?.includes("seed-auto-pjese-extra-types");
if (isDirectRun) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
