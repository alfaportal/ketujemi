import {
  db,
  listingsTable,
  userNotificationsTable,
  usersTable,
  type User,
  type UserNotificationType,
} from "@workspace/db";
import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { sendFcmToUser } from "./fcm-push";
import { defaultEngagementLocale, engagementEmailCopy } from "./engagement-email-i18n";
import { sendListingFirstViewEmail, sendSocialFollowPromptEmail } from "./send-engagement-email";

export type NotificationPayload = {
  listingId?: number;
  listingTitle?: string;
};

function serializePayload(payload: NotificationPayload | null): string | null {
  if (!payload) return null;
  return JSON.stringify(payload);
}

function parsePayload(raw: string | null): NotificationPayload {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as NotificationPayload;
  } catch {
    return {};
  }
}

export async function userListingCount(userId: number): Promise<number> {
  const [row] = await db
    .select({ c: count() })
    .from(listingsTable)
    .where(eq(listingsTable.user_id, userId));
  return Number(row?.c ?? 0);
}

export async function markFirstListingPosted(userId: number): Promise<void> {
  await db
    .update(usersTable)
    .set({ first_listing_posted: true })
    .where(eq(usersTable.id, userId));
}

async function insertUserNotification(opts: {
  userId: number;
  type: UserNotificationType;
  payload?: NotificationPayload;
  requiresAction?: boolean;
  pushTitle?: string;
  pushBody?: string;
}): Promise<void> {
  const [row] = await db
    .insert(userNotificationsTable)
    .values({
      user_id: opts.userId,
      type: opts.type,
      payload: serializePayload(opts.payload ?? null),
      requires_action: opts.requiresAction ?? false,
    })
    .returning({ id: userNotificationsTable.id });

  if (opts.pushTitle && opts.pushBody) {
    void sendFcmToUser(opts.userId, {
      title: opts.pushTitle,
      body: opts.pushBody,
      data: {
        notificationId: String(row?.id ?? ""),
        type: opts.type,
      },
    }).catch(() => undefined);
  }
}

/** Notify listing owner on first external view; optionally send one-time social follow prompt. */
export async function handleListingExternalView(opts: {
  listingId: number;
  viewer: User | null;
}): Promise<void> {
  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, opts.listingId))
    .limit(1);

  if (!listing?.user_id) return;
  if (listing.first_external_view_notified) return;

  const viewerId = opts.viewer?.id ?? null;
  if (viewerId != null && viewerId === listing.user_id) return;

  const [updated] = await db
    .update(listingsTable)
    .set({ first_external_view_notified: true })
    .where(
      and(
        eq(listingsTable.id, opts.listingId),
        eq(listingsTable.first_external_view_notified, false),
      ),
    )
    .returning({ id: listingsTable.id });

  if (!updated) return;

  const [owner] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, listing.user_id))
    .limit(1);

  if (!owner) return;

  const locale = defaultEngagementLocale();
  const emailCopy = engagementEmailCopy(locale);
  const title = listing.title.trim();

  await insertUserNotification({
    userId: listing.user_id,
    type: "listing_first_external_view",
    payload: { listingId: listing.id, listingTitle: title },
    pushTitle: "KetuJemi",
    pushBody: emailCopy.listingFirstView(title),
  });

  void sendListingFirstViewEmail(owner, title, locale);

  if (owner.social_follow_notif_sent || owner.social_follow_notif_preference === "opted_out") {
    return;
  }

  await db
    .update(usersTable)
    .set({ social_follow_notif_sent: true })
    .where(eq(usersTable.id, owner.id));

  await insertUserNotification({
    userId: owner.id,
    type: "social_follow_prompt",
    requiresAction: true,
    pushTitle: "KetuJemi",
    pushBody:
      "🔥 Shpallja juaj po tërheq vëmendjen! Na ndiqni për të na ndihmuar të promovojmë shpalljet tuaja edhe më shumë.",
  });

  void sendSocialFollowPromptEmail(owner, locale);
}

export async function listUserNotifications(userId: number) {
  const rows = await db
    .select()
    .from(userNotificationsTable)
    .where(eq(userNotificationsTable.user_id, userId))
    .orderBy(desc(userNotificationsTable.created_at))
    .limit(50);

  const unread = rows.filter((r) => r.read_at == null).length;

  return {
    notifications: rows.map((r) => ({
      id: r.id,
      type: r.type,
      payload: parsePayload(r.payload),
      read_at: r.read_at ? r.read_at.toISOString() : null,
      requires_action: r.requires_action,
      created_at: r.created_at.toISOString(),
    })),
    unread_count: unread,
  };
}

export async function markNotificationsRead(userId: number, ids: number[]): Promise<void> {
  if (!ids.length) return;
  const now = new Date();
  await db
    .update(userNotificationsTable)
    .set({ read_at: now })
    .where(
      and(
        eq(userNotificationsTable.user_id, userId),
        inArray(userNotificationsTable.id, ids),
        isNull(userNotificationsTable.read_at),
      ),
    );
}

export async function setSocialFollowPreference(
  userId: number,
  preference: "opted_in" | "opted_out",
): Promise<void> {
  const now = new Date();
  await db
    .update(usersTable)
    .set({ social_follow_notif_preference: preference })
    .where(eq(usersTable.id, userId));

  await db
    .update(userNotificationsTable)
    .set({ read_at: now, requires_action: false })
    .where(
      and(
        eq(userNotificationsTable.user_id, userId),
        eq(userNotificationsTable.type, "social_follow_prompt"),
        isNull(userNotificationsTable.read_at),
      ),
    );
}
