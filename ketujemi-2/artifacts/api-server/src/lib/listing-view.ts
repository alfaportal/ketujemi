import { db, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/** Increment view counter for an active, non-expired listing. */
export async function incrementListingView(
  listingId: number,
): Promise<{ ok: true; views: number } | { ok: false; status: 404 | 400 }> {
  if (!Number.isFinite(listingId) || listingId <= 0) {
    return { ok: false, status: 400 };
  }

  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row) return { ok: false, status: 404 };

  const isExpired = !!(row.expires_at && new Date(row.expires_at) < new Date());
  if (isExpired || row.status !== "active") {
    return { ok: false, status: 404 };
  }

  const [updated] = await db
    .update(listingsTable)
    .set({ views: row.views + 1 })
    .where(eq(listingsTable.id, listingId))
    .returning({ views: listingsTable.views });

  return { ok: true, views: updated?.views ?? row.views + 1 };
}
