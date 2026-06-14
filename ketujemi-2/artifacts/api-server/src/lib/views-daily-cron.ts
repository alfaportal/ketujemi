import cron from "node-cron";
import { incrementDailyViewBaselines } from "./views-daily-increment.js";
import { logger } from "./logger.js";

/** Daily at 04:00 Europe/Belgrade */
const CRON_SCHEDULE = "0 4 * * *";
const DEFAULT_TZ = "Europe/Belgrade";

let runInFlight = false;

export function isViewsDailyIncrementEnabled(): boolean {
  const flag = process.env.VIEWS_DAILY_INCREMENT_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return true;
}

export async function runViewsDailyIncrementNow(): Promise<{
  listings: number;
  shops: number;
}> {
  if (runInFlight) {
    logger.warn("views daily increment: previous run still in flight, skipping");
    return { listings: 0, shops: 0 };
  }

  runInFlight = true;
  try {
    return await incrementDailyViewBaselines();
  } finally {
    runInFlight = false;
  }
}

async function tick(): Promise<void> {
  try {
    await runViewsDailyIncrementNow();
  } catch (err) {
    logger.error({ err }, "views daily increment cron failed");
  }
}

export function startViewsDailyIncrementCron(): void {
  if (!isViewsDailyIncrementEnabled()) {
    logger.info("views daily increment cron disabled (VIEWS_DAILY_INCREMENT_ENABLED=false)");
    return;
  }

  const timezone =
    process.env.VIEWS_DAILY_INCREMENT_CRON_TZ?.trim() ||
    process.env.FB_CRON_TZ?.trim() ||
    DEFAULT_TZ;

  cron.schedule(CRON_SCHEDULE, () => void tick(), { timezone });

  logger.info(
    { schedule: CRON_SCHEDULE, timezone, time: "04:00" },
    "views daily increment cron started (listings + shops +6/+7)",
  );
}
