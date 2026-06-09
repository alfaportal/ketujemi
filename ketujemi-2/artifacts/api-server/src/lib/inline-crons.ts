function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function envOptIn(name: string): boolean {
  const flag = process.env[name]?.trim().toLowerCase();
  return flag === "true" || flag === "1" || flag === "yes";
}

function envOptOut(name: string): boolean {
  const flag = process.env[name]?.trim().toLowerCase();
  return flag === "false" || flag === "0" || flag === "no";
}

/**
 * Master switch — INLINE_CRONS_ENABLED=false disables all in-process schedulers.
 * Use Railway cron + CRON_SECRET HTTP triggers on a separate worker when possible.
 */
export function inlineCronsEnabled(): boolean {
  if (envOptOut("INLINE_CRONS_ENABLED")) return false;
  return true;
}

/**
 * Lightweight jobs: purge expired listings + expiry reminder emails.
 * Default ON (even in production) so the marketplace stays clean without manual work.
 */
export function inlineMaintenanceCronsEnabled(): boolean {
  if (!inlineCronsEnabled()) return false;
  if (envOptOut("INLINE_MAINTENANCE_CRONS_ENABLED")) return false;
  return true;
}

/**
 * Heavy jobs: social auto-post, reels, followers sync, shop enrich, system monitor.
 * Default OFF in production — keeps the web API responsive under traffic spikes.
 * Set INLINE_HEAVY_CRONS_ENABLED=true only on a dedicated worker dyno.
 */
export function inlineHeavyCronsEnabled(): boolean {
  if (!inlineCronsEnabled()) return false;
  if (envOptIn("INLINE_HEAVY_CRONS_ENABLED")) return true;
  if (isProduction()) return false;
  return true;
}
