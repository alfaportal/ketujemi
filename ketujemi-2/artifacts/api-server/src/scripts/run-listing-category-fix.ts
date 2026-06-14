/**
 * One-off: fix listing category by id or title substring.
 * Usage: pnpm -C ketujemi-2/artifacts/api-server run run:listing-category-fix -- --id=48 --slug=lokale-type-industriale
 *    or: pnpm ... run run:listing-category-fix -- --title="Objekt Industrial" --slug=lokale-type-industriale
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

const args = process.argv.slice(2);
const idArg = args.find((a) => a.startsWith("--id="))?.slice(5);
const titleArg = args.find((a) => a.startsWith("--title="))?.slice(8);
const slugArg = args.find((a) => a.startsWith("--slug="))?.slice(7);

if (!slugArg) {
  console.error("Provide --slug= (category slug, e.g. lokale-type-industriale)");
  process.exit(1);
}
if (!idArg && !titleArg) {
  console.error("Provide --id= or --title=");
  process.exit(1);
}

const { db, listingsTable, categoriesTable } = await import("@workspace/db");
const { eq, ilike } = await import("drizzle-orm");

const catRows = await db
  .select({
    id: categoriesTable.id,
    name: categoriesTable.name,
    slug: categoriesTable.slug,
    parent_id: categoriesTable.parent_id,
  })
  .from(categoriesTable)
  .where(eq(categoriesTable.slug, slugArg))
  .limit(1);

const targetCat = catRows[0];
if (!targetCat) {
  console.error(`Category slug not found: ${slugArg}`);
  process.exit(1);
}

let parentId = targetCat.parent_id;
if (!parentId) {
  console.error(`Slug ${slugArg} is a parent hub, not a subcategory`);
  process.exit(1);
}

let rows: { id: number; title: string; category_id: number }[];

if (idArg) {
  const id = Number(idArg);
  rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      category_id: listingsTable.category_id,
    })
    .from(listingsTable)
    .where(eq(listingsTable.id, id));
} else {
  rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      category_id: listingsTable.category_id,
    })
    .from(listingsTable)
    .where(ilike(listingsTable.title, `%${titleArg}%`));
}

if (rows.length === 0) {
  console.error("No listing found");
  process.exit(1);
}
if (rows.length > 1) {
  console.error("Multiple matches — use --id=:", rows);
  process.exit(1);
}

const row = rows[0]!;
const [updated] = await db
  .update(listingsTable)
  .set({
    category_id: targetCat.id,
  })
  .where(eq(listingsTable.id, row.id))
  .returning({
    id: listingsTable.id,
    title: listingsTable.title,
    category_id: listingsTable.category_id,
  });

console.log(
  JSON.stringify(
    {
      listing_id: updated?.id,
      title: updated?.title,
      before: { category_id: row.category_id },
      after: {
        category_id: updated?.category_id,
        parent_category_id: parentId,
        category_slug: slugArg,
        category_name: targetCat.name,
      },
    },
    null,
    2,
  ),
);
process.exit(0);
