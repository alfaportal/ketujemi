import { db, usersTable, userViolationsTable, sellerComplaintsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { eq, and, gte, count } from "drizzle-orm";
import { STRIKE_SUSPEND_DAYS, COMPLAINT_WARN_THRESHOLD, COMPLAINT_SUSPEND_THRESHOLD } from "./business-rules";

export type ViolationCode =
  | "generic_ad"
  | "no_price"
  | "off_platform"
  | "duplicate"
  | "stock_photo"
  | "fake_product"
  | "no_response"
  | "other";

/** Record a strike and apply automatic consequences per BUSINESS_RULES.md. */
export async function recordUserViolation(
  userId: number,
  code: ViolationCode,
  notes?: string,
): Promise<{ strikeCount: number; action: string }> {
  await db.insert(userViolationsTable).values({
    user_id: userId,
    violation_code: code,
    notes: notes ?? null,
  });

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    return { strikeCount: 0, action: "user_not_found" };
  }

  const strikeCount = (user.strike_count ?? 0) + 1;
  let action = "warning_email";

  if (strikeCount === 1) {
    await db
      .update(usersTable)
      .set({ strike_count: strikeCount })
      .where(eq(usersTable.id, userId));
    action = "warning_email";
  } else if (strikeCount === 2) {
    await db
      .update(usersTable)
      .set({ strike_count: strikeCount })
      .where(eq(usersTable.id, userId));
    action = "remove_listing";
  } else if (strikeCount === 3) {
    const until = new Date();
    until.setDate(until.getDate() + STRIKE_SUSPEND_DAYS);
    await db
      .update(usersTable)
      .set({ strike_count: strikeCount, suspended_until: until })
      .where(eq(usersTable.id, userId));
    action = "suspend_30d";
  } else {
    await db
      .update(usersTable)
      .set({
        strike_count: strikeCount,
        banned_at: new Date(),
        ban_reason: "Shkelje të përsëritura të rregullores së biznesit",
      })
      .where(eq(usersTable.id, userId));
    action = "permanent_ban";
  }

  return { strikeCount, action };
}

const COMPLAINT_WINDOW_DAYS = 90;

export async function countRecentNoResponseComplaints(sellerUserId: number): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - COMPLAINT_WINDOW_DAYS);

  const [row] = await db
    .select({ n: count() })
    .from(sellerComplaintsTable)
    .where(
      and(
        eq(sellerComplaintsTable.seller_user_id, sellerUserId),
        eq(sellerComplaintsTable.complaint_type, "no_response"),
        gte(sellerComplaintsTable.created_at, since),
      ),
    );

  return Number(row?.n ?? 0);
}

/** After a no-response complaint: warn at 3, suspend at 5. */
export async function handleSellerComplaint(
  sellerUserId: number,
  listingId: number | null,
  reason?: string,
  reporterContact?: string,
): Promise<{ total: number; action: string }> {
  await db.insert(sellerComplaintsTable).values({
    seller_user_id: sellerUserId,
    listing_id: listingId,
    complaint_type: "no_response",
    reason: reason ?? null,
    reporter_contact: reporterContact ?? null,
  });

  const total = await countRecentNoResponseComplaints(sellerUserId);
  let action = "logged";

  if (total >= COMPLAINT_SUSPEND_THRESHOLD) {
    const until = new Date();
    until.setDate(until.getDate() + STRIKE_SUSPEND_DAYS);
    await db
      .update(usersTable)
      .set({
        suspended_until: until,
        ban_reason: "5 ankesa për mospërgjigje (rregullorja e biznesit)",
      })
      .where(eq(usersTable.id, sellerUserId));
    action = "suspend";
  } else if (total >= COMPLAINT_WARN_THRESHOLD) {
    action = "warning_email";
    // Email dispatch: wire to send-email when template exists
  }

  return { total, action };
}

export function isUserSuspended(user: Pick<User, "suspended_until" | "banned_at">): boolean {
  if (user.banned_at) return true;
  if (!user.suspended_until) return false;
  return new Date(user.suspended_until) > new Date();
}
