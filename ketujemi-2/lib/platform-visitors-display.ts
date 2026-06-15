/** How often the displayed count may step (ms). */
const TICK_MS = 3 * 60_000;

const DISPLAY_BAND = { min: 4, max: 5 } as const;

function slotHash(slot: number): number {
  let h = slot ^ 7;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Home stats “online now”: at least 4–5; rises when real visitors are on site.
 */
export function computeDisplayUsersOnlineNow(
  nowMs = Date.now(),
  realActiveCount = 0,
): number {
  const { min, max } = DISPLAY_BAND;
  const slot = Math.floor(nowMs / TICK_MS);
  const simulated = min + (slotHash(slot) % (max - min + 1));
  return Math.max(realActiveCount, simulated);
}
