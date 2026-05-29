import "./load-env.js";
import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { categoriesTable } from "./schema/categories.js";
import {
  FEMIJE_EXTENDED_GROUPS,
  FEMIJE_HUB_SLUG,
} from "./femije-subcategories-catalog.js";

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

async function main() {
  const hub = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, FEMIJE_HUB_SLUG))
    .limit(1);

  if (!hub[0]) {
    throw new Error(`Hub "${FEMIJE_HUB_SLUG}" not found — run parent seed first.`);
  }

  const hubId = hub[0].id;
  let groups = 0;
  let leaves = 0;

  for (const group of FEMIJE_EXTENDED_GROUPS) {
    const groupId = await ensureCategory({
      name: group.name,
      slug: group.slug,
      icon: "Baby",
      parent_id: hubId,
    });
    groups += 1;

    for (const leaf of group.leaves) {
      await ensureCategory({
        name: leaf.name,
        slug: leaf.slug,
        icon: "Baby",
        parent_id: groupId,
      });
      leaves += 1;
    }
  }

  console.log(
    `[seed:femije] Done under «${hub[0].name}» (id=${hubId}): ${groups} groups, ${leaves} leaves (existing femije-type-* rows unchanged).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
