import { listingsTable } from "@workspace/db";
import { and, eq, gt, or, isNull } from "drizzle-orm";

type ListingVisibilityRow = Pick<
  typeof listingsTable.$inferSelect,
  "status" | "moderation_status" | "expires_at"
>;

export function isListingStatusActive(status: string | null | undefined): boolean {
  return !status || status === "active";
}

export function isListingModerationApproved(
  moderationStatus: string | null | undefined,
): boolean {
  return !moderationStatus || moderationStatus === "approved";
}

export function isListingExpired(
  expiresAt: Date | string | null | undefined,
  now = new Date(),
): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < now;
}

/** Same rules as the public listings feed — list and detail must agree. */
export function isListingPubliclyVisible(
  row: ListingVisibilityRow,
  now = new Date(),
): boolean {
  return (
    isListingStatusActive(row.status)
    && isListingModerationApproved(row.moderation_status)
    && !isListingExpired(row.expires_at, now)
  );
}

/** Drizzle WHERE fragment shared by list feed, similar listings, and duplicate scans. */
export function activeListingSqlCondition(now = new Date()) {
  return and(
    or(eq(listingsTable.status, "active"), isNull(listingsTable.status)),
    or(isNull(listingsTable.expires_at), gt(listingsTable.expires_at, now)),
    or(eq(listingsTable.moderation_status, "approved"), isNull(listingsTable.moderation_status)),
  );
}

/** Public marketplace feed — excludes listings tied to a shop (those live on /dyqani/:id). */
export function marketplaceListingSqlCondition(now = new Date()) {
  return and(activeListingSqlCondition(now), isNull(listingsTable.shop_id));
}
