import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { userOwnsListing } from "./listing-ownership";
import { removeUserDuplicateListingsForPost } from "./listing-duplicate-guard";
import { assertFreeListingQuota } from "./category-quota";
import { expiresAtAfterListingLifetime } from "./listing-lifetime";

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

  if (!userOwnsListing(user, row)) {
    return { ok: false, error: "FORBIDDEN", message: "Nuk keni leje." };
  }

  const expired = row.expires_at && new Date(row.expires_at) < new Date();
  if (!expired && row.status === "active") {
    return {
      ok: false,
      error: "NOT_EXPIRED",
      message: "Ky njoftim është ende aktiv.",
    };
  }

  try {
    await assertFreeListingQuota(user, row.category_id);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FREE_QUOTA_EXCEEDED") {
      const e = err as Error & { publicMessage?: string };
      return {
        ok: false,
        error: "FREE_QUOTA_EXCEEDED",
        message:
          e.publicMessage ??
          "Nuk keni kuotë falas për rifreskim. Përdorni portofolin ose prisni muajin tjetër.",
      };
    }
    throw err;
  }

  await removeUserDuplicateListingsForPost(user, row.title, row.description, listingId);

  const now = new Date();
  await db
    .update(listingsTable)
    .set({
      status: "active",
      moderation_status: "approved",
      moderation_reason: null,
      expires_at: expiresAtAfterListingLifetime(),
      listed_at: now,
      created_at: now,
    })
    .where(eq(listingsTable.id, listingId));

  return { ok: true };
}
