import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

/** Debounce DB writes — at most one update per user per 90s. */
const TOUCH_DEBOUNCE_MS = 90_000;

/** Seller shows "Online" when active within this window. */
export const SELLER_ONLINE_WINDOW_MS = 5 * 60_000;

const recentTouchByUserId = new Map<number, number>();

export function isSellerOnline(lastActiveAt: Date | null | undefined, nowMs = Date.now()): boolean {
  if (!lastActiveAt) return false;
  return nowMs - lastActiveAt.getTime() < SELLER_ONLINE_WINDOW_MS;
}

function shouldSkipTouch(userId: number, lastActiveAt: Date | null | undefined, nowMs: number): boolean {
  const mem = recentTouchByUserId.get(userId);
  if (mem != null && nowMs - mem < TOUCH_DEBOUNCE_MS) return true;
  if (lastActiveAt != null && nowMs - lastActiveAt.getTime() < TOUCH_DEBOUNCE_MS) {
    recentTouchByUserId.set(userId, nowMs);
    return true;
  }
  return false;
}

/** Fire-and-forget from request handlers — never block the response on this. */
export function touchUserLastActive(userId: number, lastActiveAt?: Date | null): void {
  const nowMs = Date.now();
  if (shouldSkipTouch(userId, lastActiveAt ?? null, nowMs)) return;
  recentTouchByUserId.set(userId, nowMs);
  void db
    .update(usersTable)
    .set({ last_active_at: new Date(nowMs) })
    .where(eq(usersTable.id, userId))
    .then(() => {})
    .catch(() => {
      recentTouchByUserId.delete(userId);
    });
}
