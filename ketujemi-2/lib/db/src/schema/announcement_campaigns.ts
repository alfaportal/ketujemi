import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type AnnouncementCampaignStatus = "draft" | "sending" | "sent" | "failed";
export type AnnouncementRecipientMode = "all" | "selected";

export const announcementCampaignsTable = pgTable("announcement_campaigns", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  body_html: text("body_html").notNull(),
  sent_by_admin_id: integer("sent_by_admin_id"),
  recipient_count: integer("recipient_count").notNull().default(0),
  /** all = every eligible verified user; selected = explicit recipient_user_ids */
  recipient_mode: text("recipient_mode").notNull().default("all"),
  status: text("status").notNull().default("draft"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type AnnouncementCampaign = typeof announcementCampaignsTable.$inferSelect;
