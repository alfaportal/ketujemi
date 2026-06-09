import cron from "node-cron";
import {
  initializeFacebookPageAccessToken,
  isInstagramAutoPostConfigured,
} from "../services/socialMedia.js";
import { runInstagramScheduledPost } from "./instagram-scheduled-post-job";
import { logger } from "./logger";
import { isInstagramScheduledPostEnabled } from "./social-post-flags";

/** 30 min after Facebook: 10:30, 14:30, 19:30, 22:30 Europe/Belgrade. */
const CRON_SCHEDULE = "30 10,14,19,22 * * *";
const DEFAULT_TZ = "Europe/Belgrade";

let runInFlight = false;

async function tick(): Promise<void> {
  await runInstagramScheduledPostNow();
}

/** Manual / admin trigger — same logic as the cron tick, with a result payload. */
export async function runInstagramScheduledPostNow(): Promise<
  Awaited<ReturnType<typeof runInstagramScheduledPost>> & { reason?: string; graphError?: string }
> {
  if (!isInstagramScheduledPostEnabled()) {
    logger.info("instagram scheduled post skipped (INSTAGRAM_AUTO_POST_ENABLED is not true)");
    return { posted: false, reason: "disabled" };
  }

  if (runInFlight) {
    logger.warn("instagram scheduled post: previous run still in flight, skipping");
    return { posted: false, reason: "in_flight" };
  }

  runInFlight = true;
  try {
    await initializeFacebookPageAccessToken();
    return await runInstagramScheduledPost();
  } catch (err) {
    logger.error({ err }, "instagram scheduled post cron failed");
    const message = err instanceof Error ? err.message : String(err);
    return { posted: false, reason: "exception", graphError: message };
  } finally {
    runInFlight = false;
  }
}

export function startInstagramScheduledPostCron(): void {
  if (!isInstagramScheduledPostEnabled()) {
    logger.info(
      "instagram scheduled post cron disabled (set INSTAGRAM_AUTO_POST_ENABLED=true to enable)",
    );
    return;
  }

  const timezone = process.env.IG_CRON_TZ?.trim() || process.env.FB_CRON_TZ?.trim() || DEFAULT_TZ;

  cron.schedule(
    CRON_SCHEDULE,
    () => {
      void tick();
    },
    { timezone },
  );

  const configured = isInstagramAutoPostConfigured();
  logger.info(
    {
      schedule: CRON_SCHEDULE,
      timezone,
      times: ["10:30", "14:30", "19:30", "22:30"],
      note: "30 minutes after Facebook cron",
      configured,
    },
    configured
      ? "instagram scheduled photo post cron started"
      : "instagram scheduled photo post cron armed (waiting for Meta page/IG config)",
  );
}
