import cron from "node-cron";
import { runListingReelPost } from "./listing-reel-job";
import { logger } from "./logger";

/** Daily at 12:00 Europe/Belgrade — slideshow Reel to Instagram + TikTok. */
const CRON_SCHEDULE = "0 12 * * *";
const DEFAULT_TZ = "Europe/Belgrade";

let runInFlight = false;

function isListingReelCronEnabled(): boolean {
  const flag = process.env.LISTING_REEL_CRON_ENABLED?.trim().toLowerCase();
  return flag !== "false" && flag !== "0" && flag !== "no";
}

export async function runListingReelPostNow(): Promise<
  Awaited<ReturnType<typeof runListingReelPost>> & { reason?: string }
> {
  if (runInFlight) {
    logger.warn("listing reel cron: previous run still in flight, skipping");
    return { posted: false, reason: "in_flight" };
  }

  runInFlight = true;
  try {
    return await runListingReelPost();
  } catch (err) {
    logger.error({ err }, "listing reel cron failed");
    const message = err instanceof Error ? err.message : String(err);
    return { posted: false, reason: "exception", error: message };
  } finally {
    runInFlight = false;
  }
}

export function startListingReelCron(): void {
  if (!isListingReelCronEnabled()) {
    logger.info("listing reel cron disabled (LISTING_REEL_CRON_ENABLED=false)");
    return;
  }

  const timezone =
    process.env.LISTING_REEL_CRON_TZ?.trim() ||
    process.env.FB_CRON_TZ?.trim() ||
    DEFAULT_TZ;

  cron.schedule(
    CRON_SCHEDULE,
    () => {
      void runListingReelPostNow();
    },
    { timezone },
  );

  logger.info(
    { schedule: CRON_SCHEDULE, timezone, time: "12:00" },
    "listing reel cron started (Instagram Reels + TikTok)",
  );
}
