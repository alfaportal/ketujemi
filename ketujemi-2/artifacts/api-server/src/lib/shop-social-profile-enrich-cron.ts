import cron from "node-cron";
import { runShopSocialEnrichDailySync } from "./shop-social-enrich.js";
import { logger } from "./logger.js";

/** Daily at 06:30 Europe/Belgrade — after KetuJemi brand follower sync */
const CRON_SCHEDULE = "30 6 * * *";
const DEFAULT_TZ = "Europe/Belgrade";

let runInFlight = false;

function isEnabled(): boolean {
  const flag = process.env.SOCIAL_PROFILE_ENRICH_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return true;
}

async function tick(): Promise<void> {
  if (runInFlight) {
    logger.warn("shop social profile enrich: previous run still in flight, skipping");
    return;
  }
  runInFlight = true;
  try {
    const result = await runShopSocialEnrichDailySync();
    logger.info(
      { ...result },
      `shop social profile enrich daily sync finished (${result.processed}/${result.total})`,
    );
  } catch (err) {
    logger.error({ err }, "shop social profile enrich daily sync failed");
  } finally {
    runInFlight = false;
  }
}

export function startShopSocialProfileEnrichCron(): void {
  if (!isEnabled()) {
    logger.info("shop social profile enrich cron disabled (SOCIAL_PROFILE_ENRICH_ENABLED=false)");
    return;
  }

  cron.schedule(CRON_SCHEDULE, () => void tick(), { timezone: DEFAULT_TZ });
  logger.info({ schedule: CRON_SCHEDULE, tz: DEFAULT_TZ }, "shop social profile enrich cron started");
}

export async function runShopSocialProfileEnrichNow(): Promise<{
  processed: number;
  errors: number;
}> {
  return runShopSocialEnrichDailySync();
}
