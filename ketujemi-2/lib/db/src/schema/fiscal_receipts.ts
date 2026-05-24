import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/** Kosovo fiscal coupon / tax invoice issued for platform payments (e.g. wallet top-up). */
export const fiscalReceiptsTable = pgTable("fiscal_receipts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  /** Idempotency — matches business_payments.token / Stripe client_reference_id */
  payment_token: text("payment_token").notNull(),
  purpose: text("purpose").notNull(),
  amount_cents: integer("amount_cents").notNull(),
  /** fiscal_coupon | tax_invoice */
  receipt_type: text("receipt_type").notNull().default("fiscal_coupon"),
  /** pending | issued | failed | skipped */
  status: text("status").notNull().default("pending"),
  fiscal_number: text("fiscal_number"),
  qr_payload: text("qr_payload"),
  pdf_url: text("pdf_url"),
  /** placeholder | enternet | … */
  provider: text("provider"),
  provider_ref: text("provider_ref"),
  error_message: text("error_message"),
  customer_email: text("customer_email"),
  issued_at: timestamp("issued_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type FiscalReceipt = typeof fiscalReceiptsTable.$inferSelect;
