import cron from "node-cron";
import { isFacebookAutoPostConfigured } from "../services/socialMedia.js";
import { runFacebookScheduledPost } from "./facebook-scheduled-post-job";
import { logger } from "./logger";

/** 10:00, 14:00, 19:00, 22:00 Europe/Belgrade — four posts per day. */
const CRON_SCHEDULE = "0 10,14,19,22 * * *";
const DEFAULT_TZ = "Europe/Belgrade";

let runInFlight = false;

function isScheduledPostEnabled(): boolean {
  const flag = process.env.FB_SCHEDULED_POST_ENABLED?.trim().toLowerCase();
  return flag !== "false" && flag !== "0" && flag !== "no";
}

async function tick(): Promise<void> {
  if (runInFlight) {
    logger.warn("facebook scheduled post: previous run still in flight, skipping");
    return;
  }

  runInFlight = true;
  try {
    await runFacebookScheduledPost();
  } catch (err) {
    logger.error({ err }, "facebook scheduled post cron failed");
  } finally {
    runInFlight = false;
  }
}

export function startFacebookScheduledPostCron(): void {
  if (!isScheduledPostEnabled()) {
    logger.info("facebook scheduled post cron disabled (FB_SCHEDULED_POST_ENABLED=false)");
    return;
  }

  if (!isFacebookAutoPostConfigured()) {
    logger.warn(
      "facebook scheduled post cron skipped: set FB_PAGE_ID (or PAGE_ID) and FB_PAGE_ACCESS_TOKEN (or PAGE_ACCESS_TOKEN)",
    );
    return;
  }

  const timezone = process.env.FB_CRON_TZ?.trim() || DEFAULT_TZ;

  cron.schedule(
    CRON_SCHEDULE,
    () => {
      void tick();
    },
    { timezone },
  );

  logger.info(
    { schedule: CRON_SCHEDULE, timezone, times: ["10:00", "14:00", "19:00", "22:00"] },
    "facebook scheduled post cron started",
  );
}
