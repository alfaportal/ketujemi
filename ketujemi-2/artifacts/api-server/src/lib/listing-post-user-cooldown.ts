import type { User } from "@workspace/db";

/** Seconds between successful listing creates/reposts for the same account (double-submit / rage clicks). */
function cooldownMs(): number {
  const raw =
    process.env.LISTING_POST_USER_COOLDOWN_SECONDS ??
    process.env.LISTING_POST_IP_COOLDOWN_SECONDS ??
    "30";
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) * 1000 : 30_000;
}

const lastSuccessfulListingPostAtByUserId = new Map<number, number>();

export function assertListingPostUserCooldown(user: User): void {
  const ms = cooldownMs();
  if (ms <= 0) return;

  const last = lastSuccessfulListingPostAtByUserId.get(user.id) ?? 0;
  const elapsed = Date.now() - last;
  if (elapsed < ms) {
    const sec = Math.ceil((ms - elapsed) / 1000);
    const err = new Error("LISTING_POST_COOLDOWN") as Error & {
      publicMessage: string;
      retryAfterSeconds: number;
    };
    err.publicMessage = `Ki pak durim, prisni ${sec} sekonda për postimin tjetër.`;
    err.retryAfterSeconds = sec;
    throw err;
  }
}

/** Call after a listing is successfully created or republished for this user. */
export function recordListingPostSuccessForUser(user: User): void {
  if (cooldownMs() <= 0) return;
  lastSuccessfulListingPostAtByUserId.set(user.id, Date.now());
}
