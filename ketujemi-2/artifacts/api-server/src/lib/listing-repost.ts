import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { listingBelongsToUser } from "./listing-ownership";
import { removeUserDuplicateListingsForPost } from "./listing-duplicate-guard";
import { expiresAtAfterListingLifetime } from "./listing-lifetime";
import { assertAccountActive } from "./user-ban";
import {
  blockIfPriorModerationRejection,
  MODERATION_REPOST_BLOCK_MESSAGE,
} from "./listing-moderation-repost-guard";
import { getApprovedShopIdForUser, backfillShopListingsForShop } from "./shop-listing-lookup.js";
import { runTwoLayerModeration } from "./listing-two-layer-moderation";
import { logListingModerationRejection } from "./listing-moderation-rejection-log";

const ACCOUNT_BANNED_MESSAGE =
  "Llogaria ose numri i telefonit është i bllokuar. Nuk mund të postoni derisa të zgjidhet me mbështetjen.";

/**
 * Republish an expired listing: fresh 3-month window, listed_at = now.
 */
export async function repostListing(
  user: User,
  listingId: number,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row) {
    return { ok: false, error: "NOT_FOUND", message: "Njoftimi nuk u gjet." };
  }

  if (!listingBelongsToUser(user.id, user, row)) {
    return { ok: false, error: "FORBIDDEN", message: "Nuk keni leje." };
  }

  if (row.moderation_status === "rejected") {
    return {
      ok: false,
      error: "MODERATION_REJECTED",
      message: MODERATION_REPOST_BLOCK_MESSAGE,
    };
  }

  try {
    await assertAccountActive(user, row.seller_phone);
  } catch {
    return { ok: false, error: "ACCOUNT_BANNED", message: ACCOUNT_BANNED_MESSAGE };
  }

  const expired = row.expires_at && new Date(row.expires_at) < new Date();
  if (!expired && row.status === "active") {
    return {
      ok: false,
      error: "NOT_EXPIRED",
      message: "Ky njoftim është ende aktiv.",
    };
  }

  const priorRejection = await blockIfPriorModerationRejection(
    user.id,
    row.title,
    row.description,
    row.category_id,
  );
  if (priorRejection) {
    return {
      ok: false,
      error: "MODERATION_REPOST_BLOCKED",
      message: priorRejection.message,
    };
  }

  const twoLayer = await runTwoLayerModeration({
    userId: user.id,
    user,
    title: row.title,
    description: row.description,
    sellerPhone: row.seller_phone ?? "",
    categoryId: row.category_id,
    imageUrl: row.image_url,
  });
  if (!twoLayer.ok) {
    void logListingModerationRejection({
      title: row.title,
      reason: twoLayer.reason,
      categoryId: row.category_id,
      userId: user.id,
    }).catch(() => undefined);
    return {
      ok: false,
      error: twoLayer.code,
      message: twoLayer.message,
    };
  }

  await removeUserDuplicateListingsForPost(user, row.title, row.description, listingId);

  const shopId = await getApprovedShopIdForUser(user.id);
  const now = new Date();
  const repostPatch: Partial<typeof listingsTable.$inferInsert> = {
    status: "active",
    moderation_status: "approved",
    moderation_reason: null,
    expires_at: expiresAtAfterListingLifetime(),
    listed_at: now,
    created_at: now,
  };
  if (shopId && row.shop_id == null) {
    repostPatch.shop_id = shopId;
  }

  await db
    .update(listingsTable)
    .set(repostPatch)
    .where(eq(listingsTable.id, listingId));

  if (shopId) {
    const [shopRow] = await db
      .select({
        id: shopsTable.id,
        user_id: shopsTable.user_id,
        phone: shopsTable.phone,
        email: shopsTable.email,
      })
      .from(shopsTable)
      .where(eq(shopsTable.id, shopId))
      .limit(1);
    if (shopRow) {
      await backfillShopListingsForShop(shopRow).catch(() => undefined);
    }
  }

  return { ok: true };
}
