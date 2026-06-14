/** Do not count the same viewer hitting the same entity repeatedly within this window. */
export const VIEW_DEDUP_WINDOW_MS = 30 * 60 * 1000;

const recentViews = new Map<string, number>();

export function viewDedupKey(
  kind: "listing" | "shop",
  entityId: number,
  ip: string,
  viewerUserId?: number | null,
): string {
  if (viewerUserId != null && viewerUserId > 0) {
    return `${kind}:${entityId}:user:${viewerUserId}`;
  }
  return `${kind}:${entityId}:ip:${ip}`;
}

/** Returns true when a new view should be counted. */
export function shouldCountView(dedupKey: string, nowMs = Date.now()): boolean {
  const last = recentViews.get(dedupKey);
  if (last != null && nowMs - last < VIEW_DEDUP_WINDOW_MS) {
    return false;
  }
  recentViews.set(dedupKey, nowMs);

  if (recentViews.size > 20_000) {
    for (const [key, ts] of recentViews) {
      if (nowMs - ts >= VIEW_DEDUP_WINDOW_MS) recentViews.delete(key);
    }
  }

  return true;
}
