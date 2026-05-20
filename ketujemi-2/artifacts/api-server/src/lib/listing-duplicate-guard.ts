import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { gt, gte } from "drizzle-orm";
import { deleteListingCascade } from "./delete-listing-cascade";
import { userOwnsListing } from "./listing-ownership";

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Normalize so two copies paste identical compare equal (trim, line endings, NFC). */
export function canonListingPair(title: string, description: string): { title: string; description: string } {
  const norm = (s: string) =>
    s
      .trim()
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .normalize("NFC");

  return { title: norm(title), description: norm(description) };
}

function pairsEqual(
  a: { title: string; description: string },
  b: { title: string; description: string },
): boolean {
  return a.title === b.title && a.description === b.description;
}

/**
 * Another listing by same user, created in last 24h, with identical title AND description (spam duplicate).
 */
export async function findSpamDuplicateListing24h(
  user: User,
  title: string,
  description: string,
  excludeListingId?: number,
): Promise<number | null> {
  const incoming = canonListingPair(title, description);
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);

  const rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      seller_phone: listingsTable.seller_phone,
      created_at: listingsTable.created_at,
    })
    .from(listingsTable)
    .where(gte(listingsTable.created_at, since));

  for (const row of rows) {
    if (excludeListingId != null && row.id === excludeListingId) continue;
    if (!userOwnsListing(user, row)) continue;
    const existing = canonListingPair(row.title, row.description);
    if (pairsEqual(incoming, existing)) return row.id;
  }

  return null;
}

/**
 * Active listing (not expired) by same user with identical title AND description — blocks repost overlap.
 */
export async function findDuplicateActiveListingFullMatch(
  user: User,
  title: string,
  description: string,
  excludeListingId?: number,
): Promise<number | null> {
  const incoming = canonListingPair(title, description);
  const now = new Date();

  const rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      seller_phone: listingsTable.seller_phone,
      expires_at: listingsTable.expires_at,
    })
    .from(listingsTable)
    .where(gt(listingsTable.expires_at, now));

  for (const row of rows) {
    if (excludeListingId != null && row.id === excludeListingId) continue;
    if (!userOwnsListing(user, row)) continue;
    const existing = canonListingPair(row.title, row.description);
    if (pairsEqual(incoming, existing)) return row.id;
  }

  return null;
}

/** All listings by same user with identical title + description (for replace-on-post). */
export async function findUserDuplicateListingIds(
  user: User,
  title: string,
  description: string,
  excludeListingId?: number,
): Promise<number[]> {
  const incoming = canonListingPair(title, description);
  const rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      seller_phone: listingsTable.seller_phone,
    })
    .from(listingsTable);

  const ids: number[] = [];
  for (const row of rows) {
    if (excludeListingId != null && row.id === excludeListingId) continue;
    if (!userOwnsListing(user, row)) continue;
    const existing = canonListingPair(row.title, row.description);
    if (pairsEqual(incoming, existing)) ids.push(row.id);
  }
  return ids;
}

/**
 * Before a new post (or repost), remove older duplicates with the same title + description
 * so the fresh listing is the only one kept.
 */
export async function removeUserDuplicateListingsForPost(
  user: User,
  title: string,
  description: string,
  excludeListingId?: number,
): Promise<number[]> {
  const ids = await findUserDuplicateListingIds(user, title, description, excludeListingId);
  for (const id of ids) {
    await deleteListingCascade(id);
  }
  return ids;
}

/** @deprecated Use removeUserDuplicateListingsForPost — kept for callers not yet migrated. */
export async function assertNoDuplicateListing(
  user: User,
  title: string,
  description: string,
  excludeListingId?: number,
): Promise<void> {
  await removeUserDuplicateListingsForPost(user, title, description, excludeListingId);
}
