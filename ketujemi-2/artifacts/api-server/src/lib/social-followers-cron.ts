import cron from "node-cron";
import { runInstagramFollowersSync } from "./social-followers-sync.js";
import { logger } from "./logger.js";

/** Daily at 06:00 Europe/Belgrade */
const CRON_SCHEDULE = "0 6 * * *";
const DEFAULT_TZ = "Europe/Belgrade";

let runInFlight = false;

function isFollowersSyncEnabled(): boolean {
  const flag = process.env.SOCIAL_FOLLOWERS_SYNC_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return true;
}

async function tick(): Promise<void> {
  if (runInFlight) {
    logger.warn("social followers sync: previous run still in flight, skipping");
    return;
  }

  runInFlight = true;
  try {
    const result = await runInstagramFollowersSync();
    logger.info(result, "social followers daily sync finished");
  } catch (err) {
    logger.error({ err }, "social followers daily sync failed");
  } finally {
    runInFlight = false;
  }
}

export function startSocialFollowersCron(): void {
  if (!isFollowersSyncEnabled()) {
    logger.info("social followers cron disabled (SOCIAL_FOLLOWERS_SYNC_ENABLED=false)");
    return;
  }

  const igUserId =
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim() ||
    process.env.IG_BUSINESS_ACCOUNT_ID?.trim();
  const token =
    process.env.FB_PAGE_ACCESS_TOKEN?.trim() || process.env.PAGE_ACCESS_TOKEN?.trim();

  if (!igUserId || !token) {
    logger.warn(
      "social followers cron skipped: set INSTAGRAM_BUSINESS_ACCOUNT_ID and FB_PAGE_ACCESS_TOKEN",
    );
    return;
  }

  const timezone =
    process.env.SOCIAL_FOLLOWERS_CRON_TZ?.trim() ||
    process.env.FB_CRON_TZ?.trim() ||
    DEFAULT_TZ;

  cron.schedule(CRON_SCHEDULE, () => void tick(), { timezone });

  logger.info(
    { schedule: CRON_SCHEDULE, timezone, time: "06:00" },
    "social followers cron started (Instagram daily sync)",
  );
}
