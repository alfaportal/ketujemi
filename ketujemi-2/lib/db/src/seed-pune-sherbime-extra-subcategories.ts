import "./load-env.js";
import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { categoriesTable } from "./schema/categories.js";
import {
  PUNE_SHERBIME_EXTRA_TAXONOMY,
  PUNE_SHERBIME_HUB_SLUG,
} from "./pune-sherbime-extra-subcategories-catalog.js";

const ICON = "Briefcase";

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

export async function seedPuneSherbimeExtraSubcategoriesAlways(): Promise<void> {
  const hub = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, PUNE_SHERBIME_HUB_SLUG))
    .limit(1);

  if (!hub[0]) {
    console.warn(
      `[seed] Skip Punë & Shërbime extra taxonomy — hub "${PUNE_SHERBIME_HUB_SLUG}" not found.`,
    );
    return;
  }

  const hubId = hub[0].id;
  let types = 0;
  let leaves = 0;

  for (const type of PUNE_SHERBIME_EXTRA_TAXONOMY) {
    const typeId = await ensureCategory({
      name: type.name,
      slug: type.slug,
      icon: ICON,
      parent_id: hubId,
    });
    types += 1;

    for (const leaf of type.leaves) {
      await ensureCategory({
        name: leaf.name,
        slug: leaf.slug,
        icon: ICON,
        parent_id: typeId,
      });
      leaves += 1;
    }
  }

  console.log(
    `[seed] Punë & Shërbime extra under «${hub[0].name}» (id=${hubId}): ${types} types, ${leaves} leaves.`,
  );
}

async function main() {
  await seedPuneSherbimeExtraSubcategoriesAlways();
}

const isDirectRun = process.argv[1]?.includes("seed-pune-sherbime-extra-subcategories");
if (isDirectRun) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
