import cron from "node-cron";
import { isFacebookAutoPostConfigured } from "../services/socialMedia.js";
import { runFacebookScheduledPost } from "./facebook-scheduled-post-job";
import { logger } from "./logger";

/** 09:00, 13:00, 18:00, 21:00 — four posts per day (~6h apart). */
const CRON_SCHEDULE = "0 9,13,18,21 * * *";
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
    { schedule: CRON_SCHEDULE, timezone, times: ["09:00", "13:00", "18:00", "21:00"] },
    "facebook scheduled post cron started",
  );
}
