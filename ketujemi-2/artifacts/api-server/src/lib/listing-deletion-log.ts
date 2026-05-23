import { db, listingDeletionLogTable } from "@workspace/db";

export type ListingDeletionSource = "admin" | "owner" | "expiry" | "system";

export async function logListingDeletion(opts: {
  listingId: number;
  title: string;
  categoryId?: number | null;
  price?: string | number | null;
  source: ListingDeletionSource;
}): Promise<void> {
  await db.insert(listingDeletionLogTable).values({
    listing_id: opts.listingId,
    title: opts.title.slice(0, 500),
    category_id: opts.categoryId ?? null,
    price: opts.price != null ? String(opts.price) : null,
    source: opts.source,
  });
}
