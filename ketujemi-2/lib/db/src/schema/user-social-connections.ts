import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export type UserSocialPlatform = "instagram" | "facebook" | "tiktok";

/** Platforms a KëtuJemi user actually verified via OAuth (not all three by default). */
export const userSocialConnectionsTable = pgTable(
  "user_social_connections",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    external_user_id: text("external_user_id").notNull(),
    username: text("username"),
    verified_at: timestamp("verified_at").notNull().defaultNow(),
  },
  (t) => ({
    userPlatformIdx: uniqueIndex("user_social_connections_user_platform_idx").on(
      t.user_id,
      t.platform,
    ),
    platformIdx: index("user_social_connections_platform_idx").on(t.platform),
  }),
);

export type UserSocialConnection = typeof userSocialConnectionsTable.$inferSelect;
