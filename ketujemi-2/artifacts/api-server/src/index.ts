import app from "./app";
import { ensureWalletSchema, pool } from "@workspace/db";
import { logger } from "./lib/logger";
import { startExpiredListingsScheduler } from "./lib/expire-listings-job";
import { startExpiryReminderScheduler } from "./lib/listing-expiry-reminders";
import { startPartnerUnpaidReminderScheduler } from "./lib/partner-unpaid-reminders";

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
  } catch (err) {
    logger.error({ err }, "Wallet schema migration failed — auth will break until fixed");
    process.exit(1);
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
  });
}

void startServer();
