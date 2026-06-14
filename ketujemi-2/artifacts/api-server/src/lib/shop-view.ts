import { db, shopsTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isShopPubliclyVisible } from "./shop-visibility.js";
import { shouldCountView, viewDedupKey } from "./view-dedup.js";

export type IncrementShopViewOptions = {
  viewer?: User | null;
  clientIp?: string;
};

/** Increment view counter for an active shop (guests and logged-in users). */
export async function incrementShopView(
  shopId: number,
  options: IncrementShopViewOptions = {},
): Promise<{ ok: true; views: number; counted: boolean } | { ok: false; status: 404 | 400 }> {
  const viewer = options.viewer ?? null;
  const clientIp = options.clientIp ?? "unknown";

  if (!Number.isFinite(shopId) || shopId <= 0) {
    return { ok: false, status: 400 };
  }

  const [row] = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.id, shopId))
    .limit(1);

  if (!row || !isShopPubliclyVisible(row)) {
    return { ok: false, status: 404 };
  }

  const dedupKey = viewDedupKey("shop", shopId, clientIp, viewer?.id);
  const counted = shouldCountView(dedupKey);

  if (!counted) {
    return { ok: true, views: row.views, counted: false };
  }

  const [updated] = await db
    .update(shopsTable)
    .set({ views: row.views + 1 })
    .where(eq(shopsTable.id, shopId))
    .returning({ views: shopsTable.views });

  return { ok: true, views: updated?.views ?? row.views + 1, counted: true };
}
