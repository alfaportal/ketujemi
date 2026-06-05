import app from "./app";
import {
  ensureFiscalSchema,
  ensureHomepagePartnersSchema,
  ensureListingUserSchema,
  ensureOAuthSchema,
  ensureEngagementNotificationsSchema,
  ensureShopSchema,
  ensureFemijeCategoryImages,
  ensureSportOutdoorTypeCategories,
  ensureWalletSchema,
  pool,
} from "@workspace/db";
import { logger } from "./lib/logger";
import { logPaymentStackReadiness } from "./lib/payment-policy";
import { vonageConfigSummary } from "./lib/vonage-auth";
import { startExpiredListingsScheduler } from "./lib/expire-listings-job";
import { startExpiryReminderScheduler } from "./lib/listing-expiry-reminders";
import { purgeInvalidListingImagesOnStartup } from "./lib/purge-invalid-listing-images.js";
import { startSystemMonitor } from "./lib/system-monitor.js";

const rawPort = process.env["API_PORT"] ?? process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function startServer(): Promise<void> {
  try {
    await ensureWalletSchema(pool);
    logger.info("Wallet schema verified (wallet_balance_cents)");
    await ensureFiscalSchema(pool);
    logger.info("Fiscal schema verified (fiscal_receipts)");
    await ensureOAuthSchema(pool);
    logger.info(
      "OAuth schema verified (facebook_user_id, google_user_id, instagram_user_id, tiktok_user_id)",
    );
    await ensureListingUserSchema(pool);
    logger.info("Listing user_id + self-duplicate alerts schema verified");
    await ensureEngagementNotificationsSchema(pool);
    logger.info("Engagement notifications schema verified (user_notifications, FCM tokens)");
    await ensureHomepagePartnersSchema(pool);
    logger.info("Homepage partners schema verified (homepage_partners)");
    await ensureShopSchema(pool);
    logger.info("Shop schema verified (shop_applications, shops)");
    await ensureSportOutdoorTypeCategories(pool);
    logger.info("Sport & Outdoor type subcategories verified (sport-type-*)");
    await ensureFemijeCategoryImages(pool);
    logger.info("Fëmijë category thumbnails synced (groups + leaves)");
    await purgeInvalidListingImagesOnStartup();
    logPaymentStackReadiness(logger);
    logger.info(vonageConfigSummary(), "vonage sms config (masked)");
    const { initializeFacebookPageAccessToken } = await import("./services/socialMedia.js");
    await initializeFacebookPageAccessToken();
    const { startJobQueueWorkers } = await import("./queues/jobQueue.js");
    startJobQueueWorkers();
  } catch (err) {
    logger.error({ err }, "Database schema migration failed");
    if (process.env.NODE_ENV === "production") {
      logger.warn(
        "Continuing startup so Railway health check and static files can respond. Fix DATABASE_URL if API calls fail.",
      );
    } else {
      process.exit(1);
    }
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
    startExpiredListingsScheduler();
    startExpiryReminderScheduler();
    startSystemMonitor();
  });
}

void startServer();
