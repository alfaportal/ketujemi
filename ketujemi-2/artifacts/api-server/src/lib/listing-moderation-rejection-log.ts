import { db, listingModerationRejectionsTable } from "@workspace/db";

export async function logListingModerationRejection(opts: {
  title: string;
  reason: string;
  categoryId?: number | null;
  userId?: number | null;
}): Promise<void> {
  const title = opts.title.trim().slice(0, 500);
  const reason = opts.reason.trim().slice(0, 1000);
  if (!title || !reason) return;

  await db.insert(listingModerationRejectionsTable).values({
    title,
    reason,
    category_id: opts.categoryId ?? null,
    user_id: opts.userId ?? null,
  });
}