import { boolean, index, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export type SocialFollowerPlatform = "instagram" | "facebook" | "tiktok";

export const socialFollowersTable = pgTable(
  "social_followers",
  {
    id: serial("id").primaryKey(),
    platform: text("platform").notNull(),
    follower_username: text("follower_username").notNull(),
    follower_id: text("follower_id"),
    followed_at: timestamp("followed_at").notNull().defaultNow(),
    unfollowed_at: timestamp("unfollowed_at"),
    is_active: boolean("is_active").notNull().default(true),
  },
  (t) => ({
    platformUsernameIdx: uniqueIndex("social_followers_platform_username_idx").on(
      t.platform,
      t.follower_username,
    ),
    platformActiveIdx: index("social_followers_platform_active_idx").on(t.platform, t.is_active),
    followedAtIdx: index("social_followers_followed_at_idx").on(t.followed_at),
    unfollowedAtIdx: index("social_followers_unfollowed_at_idx").on(t.unfollowed_at),
  }),
);

export type SocialFollower = typeof socialFollowersTable.$inferSelect;
export type InsertSocialFollower = typeof socialFollowersTable.$inferInsert;
