import "./load-env.js";
import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { categoriesTable } from "./schema/categories.js";
import {
  ARSIM_KURSE_HUB_SLUG,
  ARSIM_KURSE_TAXONOMY,
} from "./arsim-kurse-subcategories-catalog.js";

const ICON = "GraduationCap";

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

export async function seedArsimKurseSubcategoriesAlways(): Promise<void> {
  const hub = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, ARSIM_KURSE_HUB_SLUG))
    .limit(1);

  if (!hub[0]) {
    console.warn(
      `[seed] Skip Arsim & Kurse taxonomy — hub "${ARSIM_KURSE_HUB_SLUG}" not found.`,
    );
    return;
  }

  const hubId = hub[0].id;
  let types = 0;
  let groups = 0;
  let leaves = 0;

  for (const type of ARSIM_KURSE_TAXONOMY) {
    const typeId = await ensureCategory({
      name: type.name,
      slug: type.slug,
      icon: ICON,
      parent_id: hubId,
    });
    types += 1;

    for (const group of type.groups) {
      const groupId = await ensureCategory({
        name: group.name,
        slug: group.slug,
        icon: ICON,
        parent_id: typeId,
      });
      groups += 1;

      for (const leaf of group.leaves) {
        await ensureCategory({
          name: leaf.name,
          slug: leaf.slug,
          icon: ICON,
          parent_id: groupId,
        });
        leaves += 1;
      }
    }
  }

  console.log(
    `[seed] Arsim & Kurse under «${hub[0].name}» (id=${hubId}): ${types} types, ${groups} groups, ${leaves} leaves.`,
  );
}

async function main() {
  await seedArsimKurseSubcategoriesAlways();
}

const isDirectRun = process.argv[1]?.includes("seed-arsim-kurse-subcategories");
if (isDirectRun) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
