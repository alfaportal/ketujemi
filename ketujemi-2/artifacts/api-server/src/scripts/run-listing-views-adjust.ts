/**
 * One-off: add views to a listing by id or title substring.
 * Usage: pnpm -C ketujemi-2/artifacts/api-server run run:listing-views-adjust -- --id=123 --add=40
 *    or: pnpm ... run run:listing-views-adjust -- --title="Qendrimi ditor" --add=40
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
const addArg = args.find((a) => a.startsWith("--add="))?.slice(6);
const add = Number(addArg ?? "0");

if (!Number.isFinite(add) || add === 0) {
  console.error("Provide --add=N (non-zero integer)");
  process.exit(1);
}
if (!idArg && !titleArg) {
  console.error("Provide --id= or --title=");
  process.exit(1);
}

const { db, listingsTable } = await import("@workspace/db");
const { eq, ilike, sql } = await import("drizzle-orm");

let rows: { id: number; title: string; views: number }[];

if (idArg) {
  const id = Number(idArg);
  rows = await db
    .select({ id: listingsTable.id, title: listingsTable.title, views: listingsTable.views })
    .from(listingsTable)
    .where(eq(listingsTable.id, id));
} else {
  rows = await db
    .select({ id: listingsTable.id, title: listingsTable.title, views: listingsTable.views })
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
  .set({ views: sql`${listingsTable.views} + ${add}` })
  .where(eq(listingsTable.id, row.id))
  .returning({ id: listingsTable.id, title: listingsTable.title, views: listingsTable.views });

console.log(JSON.stringify({ before: row.views, add, after: updated?.views, id: updated?.id, title: updated?.title }, null, 2));
process.exit(0);
