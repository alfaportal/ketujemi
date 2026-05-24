import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/** Ledger for wallet top-ups and per-listing debits. */
export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  /** topup | listing_debit */
  type: text("type").notNull(),
  /** Positive = credit, negative = debit */
  amount_cents: integer("amount_cents").notNull(),
  balance_after_cents: integer("balance_after_cents").notNull(),
  listing_id: integer("listing_id"),
  payment_token: text("payment_token"),
  note: text("note"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
