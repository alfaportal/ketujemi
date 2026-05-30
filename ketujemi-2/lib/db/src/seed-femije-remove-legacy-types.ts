import "./load-env.js";
import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { categoriesTable } from "./schema/categories.js";
import {
  FEMIJE_HUB_SLUG,
  FEMIJE_REMOVED_TYPE_SLUGS,
} from "./femije-remove-legacy-types-catalog.js";

async function removeCategoryTreeBySlug(slug: string): Promise<number> {
  const root = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug))
    .limit(1);

  if (!root[0]) return 0;

  const toDelete: number[] = [];
  const queue = [root[0].id];

  while (queue.length) {
    const parentId = queue.shift()!;
    toDelete.push(parentId);
    const children = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(eq(categoriesTable.parent_id, parentId));

    for (const child of children) {
      queue.push(child.id);
    }
  }

  for (let i = toDelete.length - 1; i >= 0; i -= 1) {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, toDelete[i]!));
  }

  if (toDelete.length) {
    console.log(
      `[seed] Removed «${root[0].name}» (${slug}) and descendants: ${toDelete.length} row(s).`,
    );
  }

  return toDelete.length;
}

export async function seedFemijeRemoveLegacyTypesAlways(): Promise<void> {
  const hub = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, FEMIJE_HUB_SLUG))
    .limit(1);

  if (!hub[0]) {
    console.warn(`[seed] Skip Fëmijë legacy removal — hub "${FEMIJE_HUB_SLUG}" not found.`);
    return;
  }

  let removed = 0;
  for (const slug of FEMIJE_REMOVED_TYPE_SLUGS) {
    removed += await removeCategoryTreeBySlug(slug);
  }

  console.log(
    `[seed] Fëmijë under «${hub[0].name}» (id=${hub[0].id}): removed ${removed} category row(s) for ${FEMIJE_REMOVED_TYPE_SLUGS.length} legacy types.`,
  );
}

async function main() {
  await seedFemijeRemoveLegacyTypesAlways();
}

const isDirectRun = process.argv[1]?.includes("seed-femije-remove-legacy-types");
if (isDirectRun) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
