/** Explicit opt-in — unset or false disables automatic FB/IG posting. */
function envOptIn(name: string): boolean {
  const flag = process.env[name]?.trim().toLowerCase();
  return flag === "true" || flag === "1" || flag === "yes";
}

export function isFacebookScheduledPostEnabled(): boolean {
  return envOptIn("FB_SCHEDULED_POST_ENABLED");
}

export function isInstagramScheduledPostEnabled(): boolean {
  return envOptIn("INSTAGRAM_AUTO_POST_ENABLED");
}
