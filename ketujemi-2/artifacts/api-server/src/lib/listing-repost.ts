import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { userOwnsListing } from "./listing-ownership";
import { removeUserDuplicateListingsForPost } from "./listing-duplicate-guard";

function expiresAt3Months(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d;
}

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

  await removeUserDuplicateListingsForPost(user, row.title, row.description, listingId);

  const now = new Date();
  await db
    .update(listingsTable)
    .set({
      status: "active",
      moderation_status: "approved",
      moderation_reason: null,
      expires_at: expiresAt3Months(),
      listed_at: now,
      created_at: now,
    })
    .where(eq(listingsTable.id, listingId));

  return { ok: true };
}
