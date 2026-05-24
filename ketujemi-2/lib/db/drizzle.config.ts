import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";
import { applyDatabaseUrlFromEnv } from "./src/normalize-database-url.ts";

const dbDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dbDir, "..", "..");

if (!process.env.DATABASE_URL?.trim()) {
  loadEnv({ path: path.join(rootDir, ".env") });
}
applyDatabaseUrlFromEnv();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: [
    "./src/schema/categories.ts",
    "./src/schema/car-models.ts",
    "./src/schema/truck-models.ts",
    "./src/schema/motor-models.ts",
    "./src/schema/listings.ts",
    "./src/schema/admin.ts",
    "./src/schema/users.ts",
    "./src/schema/phone_verify.ts",
    "./src/schema/email_verify.ts",
    "./src/schema/business.ts",
    "./src/schema/business_payments.ts",
    "./src/schema/partners.ts",
    "./src/schema/listing_package_purchases.ts",
    "./src/schema/wallet_transactions.ts",
    "./src/schema/fiscal_receipts.ts",
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
