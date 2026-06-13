import type { listingsTable } from "@workspace/db";

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
