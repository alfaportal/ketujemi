import cron from "node-cron";
import {
  initializeFacebookPageAccessToken,
  isFacebookAutoPostConfigured,
} from "../services/socialMedia.js";
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
  await runFacebookScheduledPostNow();
}

/** Manual / admin trigger — same logic as the cron tick, with a result payload. */
export async function runFacebookScheduledPostNow(): Promise<
  Awaited<ReturnType<typeof runFacebookScheduledPost>> & { reason?: string }
> {
  if (runInFlight) {
    logger.warn("facebook scheduled post: previous run still in flight, skipping");
    return { posted: false, reason: "in_flight" };
  }

  runInFlight = true;
  try {
    await initializeFacebookPageAccessToken();
    return await runFacebookScheduledPost();
  } catch (err) {
    logger.error({ err }, "facebook scheduled post cron failed");
    const message = err instanceof Error ? err.message : String(err);
    return { posted: false, reason: "exception", graphError: message };
  } finally {
    runInFlight = false;
  }
}

export function startFacebookScheduledPostCron(): void {
  if (!isScheduledPostEnabled()) {
    logger.info("facebook scheduled post cron disabled (FB_SCHEDULED_POST_ENABLED=false)");
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

  const configured = isFacebookAutoPostConfigured();
  logger.info(
    {
      schedule: CRON_SCHEDULE,
      timezone,
      times: ["10:00", "14:00", "19:00", "22:00"],
      configured,
    },
    configured
      ? "facebook scheduled photo post cron started"
      : "facebook scheduled photo post cron armed (waiting for FB_PAGE_ACCESS_TOKEN)",
  );
}
