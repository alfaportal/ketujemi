import cron from "node-cron";
import { isInstagramAutoPostConfigured } from "../services/socialMedia.js";
import { runInstagramScheduledPost } from "./instagram-scheduled-post-job";
import { logger } from "./logger";

/** 30 min after Facebook: 10:30, 14:30, 19:30, 22:30 Europe/Belgrade. */
const CRON_SCHEDULE = "30 10,14,19,22 * * *";
const DEFAULT_TZ = "Europe/Belgrade";

let runInFlight = false;

function isInstagramScheduledPostEnabled(): boolean {
  const flag = process.env.INSTAGRAM_AUTO_POST_ENABLED?.trim().toLowerCase();
  return flag !== "false" && flag !== "0" && flag !== "no";
}

async function tick(): Promise<void> {
  await runInstagramScheduledPostNow();
}

/** Manual / admin trigger — same logic as the cron tick, with a result payload. */
export async function runInstagramScheduledPostNow(): Promise<
  Awaited<ReturnType<typeof runInstagramScheduledPost>> & { reason?: string }
> {
  if (runInFlight) {
    logger.warn("instagram scheduled post: previous run still in flight, skipping");
    return { posted: false, reason: "in_flight" };
  }

  runInFlight = true;
  try {
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
    logger.info("instagram scheduled post cron disabled (INSTAGRAM_AUTO_POST_ENABLED=false)");
    return;
  }

  if (!isInstagramAutoPostConfigured()) {
    logger.warn(
      "instagram scheduled post cron skipped: link @ketujemi.ks to Facebook Page or set INSTAGRAM_BUSINESS_ACCOUNT_ID",
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

  logger.info(
    {
      schedule: CRON_SCHEDULE,
      timezone,
      times: ["10:30", "14:30", "19:30", "22:30"],
      note: "30 minutes after Facebook cron",
    },
    "instagram scheduled post cron started",
  );
}
