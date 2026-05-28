import app from "./app";
import {
  ensureFiscalSchema,
  ensureHomepagePartnersSchema,
  ensureListingUserSchema,
  ensureOAuthSchema,
  ensureWalletSchema,
  pool,
} from "@workspace/db";
import { logger } from "./lib/logger";
import { logPaymentStackReadiness } from "./lib/payment-policy";
import { twilioConfigSummary } from "./lib/twilio-auth";
import { startExpiredListingsScheduler } from "./lib/expire-listings-job";
import { startExpiryReminderScheduler } from "./lib/listing-expiry-reminders";
import { startPartnerUnpaidReminderScheduler } from "./lib/partner-unpaid-reminders";
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
    logger.info("OAuth schema verified (facebook_user_id, instagram_user_id)");
    await ensureListingUserSchema(pool);
    logger.info("Listing user_id + self-duplicate alerts schema verified");
    await ensureHomepagePartnersSchema(pool);
    logger.info("Homepage partners schema verified (homepage_partners)");
    await purgeInvalidListingImagesOnStartup();
    logPaymentStackReadiness(logger);
    logger.info(twilioConfigSummary(), "twilio config (masked)");
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
    startPartnerUnpaidReminderScheduler();
    startSystemMonitor();
  });
}

void startServer();
