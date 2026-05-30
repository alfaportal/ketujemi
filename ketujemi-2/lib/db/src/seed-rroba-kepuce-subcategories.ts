import "./load-env.js";
import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { categoriesTable } from "./schema/categories.js";
import {
  RROBA_KEPUCE_HUB_SLUG,
  RROBA_KEPUCE_REMOVED_TYPE_SLUG,
  RROBA_KEPUCE_TAXONOMY,
} from "./rroba-kepuce-subcategories-catalog.js";

const ICON = "Shirt";

async function ensureCategory(data: {
  name: string;
  slug: string;
  icon: string;
  parent_id?: number | null;
}): Promise<number> {
  const existing = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, data.slug))
    .limit(1);

  if (existing[0]) {
    if (existing[0].name !== data.name) {
      await db
        .update(categoriesTable)
        .set({ name: data.name, icon: data.icon, parent_id: data.parent_id ?? null })
        .where(eq(categoriesTable.id, existing[0].id));
    }
    return existing[0].id;
  }

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

  const removed = toDelete.length;

  if (removed) {
    console.log(`[seed] Removed «${root[0].name}» (${slug}) and descendants: ${removed} row(s).`);
  }

  return removed;
}

export async function seedRrobaKepuceSubcategoriesAlways(): Promise<void> {
  const hub = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, RROBA_KEPUCE_HUB_SLUG))
    .limit(1);

  if (!hub[0]) {
    console.warn(
      `[seed] Skip Rroba & Këpucë taxonomy — hub "${RROBA_KEPUCE_HUB_SLUG}" not found.`,
    );
    return;
  }

  const hubId = hub[0].id;
  await removeCategoryTreeBySlug(RROBA_KEPUCE_REMOVED_TYPE_SLUG);

  let types = 0;
  let leaves = 0;

  for (const type of RROBA_KEPUCE_TAXONOMY) {
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
    `[seed] Rroba & Këpucë under «${hub[0].name}» (id=${hubId}): ${types} types, ${leaves} leaves.`,
  );
}

async function main() {
  await seedRrobaKepuceSubcategoriesAlways();
}

const isDirectRun = process.argv[1]?.includes("seed-rroba-kepuce-subcategories");
if (isDirectRun) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
