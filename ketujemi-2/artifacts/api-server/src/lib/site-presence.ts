/** Browser tab considered “on site” within this window. */
export const SITE_PRESENCE_WINDOW_MS = 5 * 60_000;

const lastSeenByVisitorId = new Map<string, number>();

export function touchSitePresence(visitorId: string, nowMs = Date.now()): void {
  if (!visitorId.trim()) return;
  lastSeenByVisitorId.set(visitorId.trim(), nowMs);
}

function pruneStalePresence(nowMs: number): void {
  const cutoff = nowMs - SITE_PRESENCE_WINDOW_MS;
  for (const [id, seen] of lastSeenByVisitorId) {
    if (seen < cutoff) lastSeenByVisitorId.delete(id);
  }
}

/** Active browser sessions (guests + logged-in) in the last 5 minutes. */
export function countSitePresenceNow(nowMs = Date.now()): number {
  pruneStalePresence(nowMs);
  const cutoff = nowMs - SITE_PRESENCE_WINDOW_MS;
  let total = 0;
  for (const seen of lastSeenByVisitorId.values()) {
    if (seen >= cutoff) total += 1;
  }
  return total;
}
