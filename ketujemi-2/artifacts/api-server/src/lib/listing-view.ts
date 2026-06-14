import { db, listingsTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { handleListingExternalView } from "./engagement-notifications";
import { isListingPubliclyVisible } from "./listing-visibility.js";
import { isPlatformAdminUser } from "./platform-admin.js";
import { shouldCountView, viewDedupKey } from "./view-dedup.js";

export type IncrementListingViewOptions = {
  viewer?: User | null;
  clientIp?: string;
};

/** Increment view counter for an active, non-expired listing (guests and logged-in users). */
export async function incrementListingView(
  listingId: number,
  options: IncrementListingViewOptions = {},
): Promise<{ ok: true; views: number; counted: boolean } | { ok: false; status: 404 | 400 }> {
  const viewer = options.viewer ?? null;
  const clientIp = options.clientIp ?? "unknown";

  if (!Number.isFinite(listingId) || listingId <= 0) {
    return { ok: false, status: 400 };
  }

  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row) return { ok: false, status: 404 };

  if (!isListingPubliclyVisible(row)) {
    return { ok: false, status: 404 };
  }

  const dedupKey = viewDedupKey("listing", listingId, clientIp, viewer?.id);
  const counted = shouldCountView(dedupKey);

  if (!counted) {
    return { ok: true, views: row.views, counted: false };
  }

  const wasFirstExternal =
    !row.first_external_view_notified &&
    (viewer == null || viewer.id !== row.user_id);

  const skipOwnerNotify = viewer != null && isPlatformAdminUser(viewer);

  const [updated] = await db
    .update(listingsTable)
    .set({ views: row.views + 1 })
    .where(eq(listingsTable.id, listingId))
    .returning({ views: listingsTable.views });

  if (wasFirstExternal && !skipOwnerNotify) {
    void handleListingExternalView({ listingId, viewer }).catch(() => undefined);
  }

  return { ok: true, views: updated?.views ?? row.views + 1, counted: true };
}
