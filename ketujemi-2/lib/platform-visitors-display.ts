/** Local platform hours for visitor display (Kosovo / CET). */
const DISPLAY_TZ = "Europe/Belgrade";

/** Active window when the counter may rise toward peak traffic. */
const ACTIVE_HOUR_START = 8;
const ACTIVE_HOUR_END = 23;

/** How often the displayed count may step (ms). */
const TICK_MS = 3 * 60_000;

type DisplayBand = { min: number; max: number };

function localHourMinute(now: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DISPLAY_TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return { hour, minute };
}

function isActiveDisplayWindow(hour: number): boolean {
  return hour >= ACTIVE_HOUR_START && hour < ACTIVE_HOUR_END;
}

function displayBand(hour: number): DisplayBand {
  if (isActiveDisplayWindow(hour)) return { min: 6, max: 10 };
  return { min: 4, max: 5 };
}

/** Small deterministic hash — same slot → same value for all visitors. */
function slotHash(slot: number, salt: number): number {
  let h = slot ^ salt;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Social-proof visitor count for the home stats widget.
 * Outside 08–23 shows 4–5; during the day drifts between 6–10.
 * Never below the real logged-in active count when that is higher.
 */
export function computeDisplayUsersOnlineNow(
  nowMs = Date.now(),
  realActiveCount = 0,
): number {
  const now = new Date(nowMs);
  const { hour } = localHourMinute(now);
  const { min, max } = displayBand(hour);
  const span = max - min;

  const slot = Math.floor(nowMs / TICK_MS);
  const hash = slotHash(slot, isActiveDisplayWindow(hour) ? 11 : 3);
  const simulated = min + (hash % (span + 1));

  return Math.max(realActiveCount, simulated);
}
