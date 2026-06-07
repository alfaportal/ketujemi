import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { shopsTable } from "./shops";

export type ShopSocialPlatform = "instagram" | "tiktok";

export const shopSocialProfileEnrichmentsTable = pgTable(
  "shop_social_profile_enrichments",
  {
    id: serial("id").primaryKey(),
    shop_id: integer("shop_id")
      .notNull()
      .references(() => shopsTable.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    source_url: text("source_url"),
    handle: text("handle").notNull(),
    display_name: text("display_name"),
    avatar_url: text("avatar_url"),
    follower_count: integer("follower_count"),
    profile_url: text("profile_url"),
    fetch_status: text("fetch_status").notNull().default("pending"),
    link_valid: boolean("link_valid").notNull().default(false),
    oauth_verified: boolean("oauth_verified").notNull().default(false),
    verification_method: text("verification_method"),
    fetched_at: timestamp("fetched_at"),
    next_fetch_at: timestamp("next_fetch_at"),
    raw_json: text("raw_json"),
  },
  (t) => ({
    shopPlatformIdx: uniqueIndex("shop_social_profile_shop_platform_idx").on(t.shop_id, t.platform),
  }),
);

export type ShopSocialProfileEnrichment = typeof shopSocialProfileEnrichmentsTable.$inferSelect;
