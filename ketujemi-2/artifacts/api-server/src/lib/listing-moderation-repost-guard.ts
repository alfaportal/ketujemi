import { db, listingModerationRejectionsTable } from "@workspace/db";
import { and, desc, eq, gte } from "drizzle-orm";
import {
  isSelfDuplicateListingMatch,
  listingTextSimilarity,
  SELF_DUPLICATE_POST_THRESHOLD,
} from "./listing-text-similarity";

/** Same window as self-duplicate repost cooldown. */
export const MODERATION_REJECTION_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export const MODERATION_REPOST_BLOCK_MESSAGE =
  "Ky përmbajtje është refuzuar ose hequr nga moderimi. Nuk mund ta ripostoni brenda 1 muaji.";

function matchesPriorRejection(
  title: string,
  description: string,
  categoryId: number | null | undefined,
  priorTitle: string,
  priorCategoryId: number | null | undefined,
): boolean {
  const similarity = listingTextSimilarity(title, description, priorTitle, "");
  if (similarity >= SELF_DUPLICATE_POST_THRESHOLD) return true;

  return isSelfDuplicateListingMatch(
    { title, description, categoryId: categoryId ?? undefined },
    { title: priorTitle, description: "", categoryId: priorCategoryId ?? undefined },
  );
}

/**
 * Block reposting content that moderation already rejected or admin removed for this user.
 */
export async function blockIfPriorModerationRejection(
  userId: number,
  title: string,
  description: string,
  categoryId?: number,
): Promise<{ blocked: true; message: string } | null> {
  const since = new Date(Date.now() - MODERATION_REJECTION_COOLDOWN_MS);
  const rows = await db
    .select({
      title: listingModerationRejectionsTable.title,
      category_id: listingModerationRejectionsTable.category_id,
    })
    .from(listingModerationRejectionsTable)
    .where(
      and(
        eq(listingModerationRejectionsTable.user_id, userId),
        gte(listingModerationRejectionsTable.created_at, since),
      ),
    )
    .orderBy(desc(listingModerationRejectionsTable.created_at))
    .limit(80);

  for (const row of rows) {
    if (matchesPriorRejection(title, description, categoryId, row.title, row.category_id)) {
      return { blocked: true, message: MODERATION_REPOST_BLOCK_MESSAGE };
    }
  }

  return null;
}
