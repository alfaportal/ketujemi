import cron from "node-cron";
import {
  initializeFacebookPageAccessToken,
  isFacebookAutoPostConfigured,
} from "../services/socialMedia.js";
import { runFacebookScheduledPost } from "./facebook-scheduled-post-job";
import { logger } from "./logger";
import { isFacebookScheduledPostEnabled } from "./social-post-flags";

/** 10:00, 14:00, 19:00, 22:00 Europe/Belgrade — four posts per day. */
const CRON_SCHEDULE = "0 10,14,19,22 * * *";
const DEFAULT_TZ = "Europe/Belgrade";

let runInFlight = false;

async function tick(): Promise<void> {
  await runFacebookScheduledPostNow();
}

/** Manual / admin trigger — same logic as the cron tick, with a result payload. */
export async function runFacebookScheduledPostNow(): Promise<
  Awaited<ReturnType<typeof runFacebookScheduledPost>> & { reason?: string }
> {
  if (!isFacebookScheduledPostEnabled()) {
    logger.info("facebook scheduled post skipped (FB_SCHEDULED_POST_ENABLED is not true)");
    return { posted: false, reason: "disabled" };
  }

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
  if (!isFacebookScheduledPostEnabled()) {
    logger.info(
      "facebook scheduled post cron disabled (set FB_SCHEDULED_POST_ENABLED=true to enable)",
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
