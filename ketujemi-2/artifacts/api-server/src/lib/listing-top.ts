import { db, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const TOP_LISTING_PRICE_EUR = 1;

/** Days added to top_until per €1 TOP purchase. */
export const TOP_LISTING_DAYS = 7;

/** Phase 2: TOP payments + public TOP checkout (off until traffic). */
export function isPhase2Enabled(): boolean {
  return process.env.FEATURE_PHASE_2 === "true";
}

export function isTopActive(row: {
  is_top: boolean;
  top_until: Date | null;
}): boolean {
  return !!(row.is_top && row.top_until && new Date(row.top_until) > new Date());
}

/** Drizzle order: TOP first, then normal by listed_at (newest first among normals). */
export const listingFeedOrderBy = [
  sql`(CASE WHEN ${listingsTable.is_top} = true AND ${listingsTable.top_until} > NOW() THEN 0 ELSE 1 END)`,
  sql`${listingsTable.top_until} DESC NULLS LAST`,
  sql`${listingsTable.listed_at} DESC`,
];

export async function applyTopBoostToListing(listingId: number): Promise<void> {
  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row) return;

  const base =
    row.top_until && new Date(row.top_until) > new Date()
      ? new Date(row.top_until)
      : new Date();
  const until = new Date(base);
  until.setDate(until.getDate() + TOP_LISTING_DAYS);

  await db
    .update(listingsTable)
    .set({
      is_top: true,
      top_count: (row.top_count ?? 0) + 1,
      top_until: until,
    })
    .where(eq(listingsTable.id, listingId));
}
