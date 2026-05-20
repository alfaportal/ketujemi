import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { gt, gte } from "drizzle-orm";
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

/** Block create/update/repost when title+description duplicate rules hit. */
export async function assertNoDuplicateListing(
  user: User,
  title: string,
  description: string,
  excludeListingId?: number,
): Promise<void> {
  const dup24 = await findSpamDuplicateListing24h(user, title, description, excludeListingId);
  if (dup24 == null) return;

  const err = new Error("DUPLICATE_LISTING") as Error & {
    duplicateListingId: number;
    publicMessage: string;
  };
  err.duplicateListingId = dup24;
  err.publicMessage =
    "Ky njoftim ka të njëjtin titull dhe të njëjtin përshkrim si një postim tjetër i juaj nga 24 orët e fundit (kopjuar shkronjë për shkronjë). Titulli i njëjtë vetëm nuk mjafton për ta ndalur — ndryshoni përshkrimin me një detaj të ri (p.sh. shasi, ngjyrë ose kilometra) që të dallohet malli.";
  throw err;
}
