import { db, listingsTable, usersTable } from "@workspace/db";
import { and, gt, gte, isNotNull, isNull, lte, or, eq } from "drizzle-orm";
import type { UiLang } from "./claude-client";
import { userOwnsListing, parseSpecsEmailFromDescription } from "./listing-ownership";
import { inferUiLangFromPhoneDigits } from "./infer-user-lang";
import {
  buildExpiryReminderEmail,
  type ReminderKind,
} from "./listing-expiry-reminders-i18n";
import { isTransactionalEmailConfigured, sendTransactionalEmail } from "./send-transactional-email";
import { logger } from "./logger";

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

export function getPublicAppOrigin(): string {
  const env = process.env.PUBLIC_APP_ORIGIN?.trim();
  return (env?.replace(/\/$/, "") || "https://ketujemi.com").replace(/\/$/, "");
}

function listingUrl(listingId: number): string {
  return `${getPublicAppOrigin()}/listings/${listingId}`;
}

type OwnerRecipient = {
  email: string;
  lang: UiLang;
  userId: number;
};

async function findVerifiedOwnerForListing(listing: {
  seller_phone: string;
  description: string;
}): Promise<OwnerRecipient | null> {
  const phoneDigits = digitsOnly(listing.seller_phone);
  const specEmail = parseSpecsEmailFromDescription(listing.description)?.toLowerCase() ?? null;

  const conditions = [];
  if (phoneDigits) {
    conditions.push(eq(usersTable.phone_e164_digits, phoneDigits));
  }
  if (specEmail) {
    conditions.push(eq(usersTable.email, specEmail));
  }
  if (conditions.length === 0) return null;

  const rows = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      email_verified_at: usersTable.email_verified_at,
      phone_e164_digits: usersTable.phone_e164_digits,
      contact_phone: usersTable.contact_phone,
    })
    .from(usersTable)
    .where(
      and(
        isNotNull(usersTable.email),
        isNotNull(usersTable.email_verified_at),
        or(...conditions),
      ),
    )
    .limit(5);

  for (const user of rows) {
    if (!user.email || !user.email_verified_at) continue;
    if (!userOwnsListing(user, listing)) continue;

    const lang = inferUiLangFromPhoneDigits(
      user.phone_e164_digits ?? phoneDigits,
    );

    return { email: user.email.trim(), lang, userId: user.id };
  }

  return null;
}

async function processReminderWindow(kind: ReminderKind): Promise<number> {
  const now = new Date();
  const sentColumn =
    kind === "3d"
      ? listingsTable.expiry_reminder_3d_sent_at
      : listingsTable.expiry_reminder_1d_sent_at;

  const windowStart =
    kind === "3d"
      ? new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 0.5 * 24 * 60 * 60 * 1000);

  const windowEnd =
    kind === "3d"
      ? new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 1.5 * 24 * 60 * 60 * 1000);

  const candidates = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      seller_phone: listingsTable.seller_phone,
      description: listingsTable.description,
      expires_at: listingsTable.expires_at,
    })
    .from(listingsTable)
    .where(
      and(
        gt(listingsTable.expires_at, now),
        gte(listingsTable.expires_at, windowStart),
        lte(listingsTable.expires_at, windowEnd),
        isNull(sentColumn),
      ),
    )
    .limit(200);

  let sent = 0;

  for (const listing of candidates) {
    const owner = await findVerifiedOwnerForListing(listing);
    if (!owner) continue;

    const { subject, text, html } = buildExpiryReminderEmail({
      lang: owner.lang,
      kind,
      listingTitle: listing.title,
      listingUrl: listingUrl(listing.id),
    });

    const ok = await sendTransactionalEmail({
      to: owner.email,
      subject,
      text,
      html,
    });

    if (!ok) {
      logger.warn({ listingId: listing.id, kind }, "expiry reminder skipped — email not configured");
      return sent;
    }

    await db
      .update(listingsTable)
      .set(
        kind === "3d"
          ? { expiry_reminder_3d_sent_at: now }
          : { expiry_reminder_1d_sent_at: now },
      )
      .where(eq(listingsTable.id, listing.id));

    sent += 1;
  }

  return sent;
}

/** Send 3-day and 1-day expiry reminder emails (sq / mk / me). */
export async function sendListingExpiryReminders(): Promise<{ sent3d: number; sent1d: number }> {
  if (!isTransactionalEmailConfigured()) {
    return { sent3d: 0, sent1d: 0 };
  }

  const sent3d = await processReminderWindow("3d");
  const sent1d = await processReminderWindow("1d");

  if (sent3d > 0 || sent1d > 0) {
    logger.info({ sent3d, sent1d }, "listing expiry reminders sent");
  }

  return { sent3d, sent1d };
}

const REMINDER_INTERVAL_MS = 6 * 60 * 60 * 1000;

export function startExpiryReminderScheduler(): void {
  const run = () => {
    void sendListingExpiryReminders().catch((err) => {
      logger.error({ err }, "sendListingExpiryReminders failed");
    });
  };

  run();
  setInterval(run, REMINDER_INTERVAL_MS);
}
