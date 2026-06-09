/**
 * When INLINE_CRONS_ENABLED=false, scheduled jobs do not run inside the web API process.
 * Use Railway cron / one-off scripts (run-facebook-scheduled-post, run-social-scheduled-posts, etc.)
 * on a separate service instead.
 */
export function inlineCronsEnabled(): boolean {
  const flag = process.env.INLINE_CRONS_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return true;
}
