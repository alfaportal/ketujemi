import { db, listingsTable, listingModerationFlagsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { gt } from "drizzle-orm";
import { userOwnsListing } from "./listing-ownership";
import {
  isBusinessAccount,
  normalizeTitleForDuplicate,
  validateBusinessListing,
} from "./business-rules";
import { assertBusinessPostingAllowed } from "./business-quota";

export async function findDuplicateActiveListing(
  user: User,
  title: string,
): Promise<number | null> {
  const norm = normalizeTitleForDuplicate(title);
  if (!norm) return null;

  const rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      seller_phone: listingsTable.seller_phone,
      description: listingsTable.description,
    })
    .from(listingsTable)
    .where(gt(listingsTable.expires_at, new Date()));

  for (const row of rows) {
    if (!userOwnsListing(user, row)) continue;
    if (normalizeTitleForDuplicate(row.title) === norm) {
      return row.id;
    }
  }
  return null;
}

export async function assertBusinessListingCreate(
  user: User,
  input: {
    title: string;
    description: string;
    price: number;
    image_url?: string | null;
  },
): Promise<void> {
  if (!isBusinessAccount(user)) return;

  const validation = validateBusinessListing(input);
  if (!validation.ok) {
    const err = new Error(validation.code) as Error & { publicMessage: string };
    err.publicMessage = validation.message;
    throw err;
  }

  await assertBusinessPostingAllowed(user);

  const dupId = await findDuplicateActiveListing(user, input.title);
  if (dupId != null) {
    await db.insert(listingModerationFlagsTable).values({
      listing_id: dupId,
      flag_type: "duplicate",
      status: "pending",
      details: `Blocked duplicate post for title: ${input.title}`,
    });
    const err = new Error("BUSINESS_DUPLICATE_LISTING") as Error & {
      duplicateListingId: number;
    };
    err.duplicateListingId = dupId;
    throw err;
  }
}
