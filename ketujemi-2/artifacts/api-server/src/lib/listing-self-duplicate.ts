import {
  db,
  listingSelfDuplicateAlertsTable,
  listingsTable,
  type User,
} from "@workspace/db";
import { and, eq, gt, isNull } from "drizzle-orm";
import { canonListingPair, pairsEqual } from "./listing-duplicate-guard";
import { listingImagesMatch } from "./listing-image-url-compare";
import { userOwnsListing } from "./listing-ownership";
import { isSelfDuplicateListingMatch } from "./listing-text-similarity";
import { logger } from "./logger";
import { sendTransactionalEmail } from "./send-transactional-email";
import { getPublicAppOrigin } from "./listing-expiry-reminders";
import { normalizeSmsPhoneDigits, vonageSendSms } from "./vonage-sms";

export const SELF_DUPLICATE_SCREEN_MESSAGE =
  "Ke tentuar të postosh të njëjtën shpallje dy herë. Shpallja jote është aktive tashmë. KetuJemi është platformë serioze — mos riposto të njëjtat sende.";

const SELF_DUPLICATE_SMS =
  "KetuJemi: Ke tentuar te postosh te njejten shpallje dy here. Platforma eshte serioze - mos riposto te njejtat sende.";

function activeListingCondition() {
  return and(eq(listingsTable.status, "active"), gt(listingsTable.expires_at, new Date()));
}

export type SelfDuplicateLookupOpts = {
  categoryId?: number;
  imageUrl?: string | null;
};

function rowMatchesSelfDuplicate(
  title: string,
  description: string,
  opts: SelfDuplicateLookupOpts,
  row: {
    title: string;
    description: string;
    category_id: number | null;
    image_url: string | null;
  },
): boolean {
  const incoming = canonListingPair(title, description);
  const existing = canonListingPair(row.title, row.description);
  if (pairsEqual(incoming, existing)) return true;

  if (listingImagesMatch(opts.imageUrl, row.image_url)) return true;

  return isSelfDuplicateListingMatch(
    { title, description, categoryId: opts.categoryId },
    { title: row.title, description: row.description, categoryId: row.category_id },
  );
}

/**
 * Active listing by this user with identical or near-duplicate content.
 * Falls back to phone/email ownership for legacy rows without user_id.
 */
export async function findSelfDuplicateActiveListingId(
  userId: number,
  user: User,
  title: string,
  description: string,
  opts: SelfDuplicateLookupOpts = {},
): Promise<number | null> {
  const ownedByUserId = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      category_id: listingsTable.category_id,
      image_url: listingsTable.image_url,
    })
    .from(listingsTable)
    .where(and(eq(listingsTable.user_id, userId), activeListingCondition()));

  for (const row of ownedByUserId) {
    if (rowMatchesSelfDuplicate(title, description, opts, row)) {
      return row.id;
    }
  }

  const legacyRows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      category_id: listingsTable.category_id,
      image_url: listingsTable.image_url,
      seller_phone: listingsTable.seller_phone,
    })
    .from(listingsTable)
    .where(and(isNull(listingsTable.user_id), activeListingCondition()));

  for (const row of legacyRows) {
    if (!userOwnsListing(user, row)) continue;
    if (rowMatchesSelfDuplicate(title, description, opts, row)) {
      return row.id;
    }
  }

  return null;
}

async function alreadyNotifiedSelfDuplicate(userId: number, listingId: number): Promise<boolean> {
  const [row] = await db
    .select({ user_id: listingSelfDuplicateAlertsTable.user_id })
    .from(listingSelfDuplicateAlertsTable)
    .where(
      and(
        eq(listingSelfDuplicateAlertsTable.user_id, userId),
        eq(listingSelfDuplicateAlertsTable.listing_id, listingId),
      ),
    )
    .limit(1);
  return !!row;
}

async function markSelfDuplicateNotified(userId: number, listingId: number): Promise<void> {
  await db
    .insert(listingSelfDuplicateAlertsTable)
    .values({ user_id: userId, listing_id: listingId })
    .onConflictDoNothing();
}

async function sendSelfDuplicateNotifyOnce(user: User, listingId: number): Promise<void> {
  const displayName = user.display_name?.trim() || "Përdorues";
  const url = `${getPublicAppOrigin()}/listings/${listingId}`;

  const phone =
    normalizeSmsPhoneDigits(user.phone_e164_digits) ??
    normalizeSmsPhoneDigits(user.contact_phone);

  if (phone) {
    try {
      await vonageSendSms(phone, SELF_DUPLICATE_SMS);
    } catch (err) {
      logger.error({ err, userId: user.id, listingId }, "self-duplicate sms failed");
    }
  }

  const email = user.email?.trim();
  if (email && user.email_verified_at) {
    const text = [
      `Përshëndetje ${displayName},`,
      "",
      SELF_DUPLICATE_SCREEN_MESSAGE,
      "",
      `Shiko shpalljen: ${url}`,
      "",
      "KetuJemi është platformë serioze — çdo përdorues duhet të respektojë rregullat.",
      "",
      "KetuJemi",
    ].join("\n");

    const html = `
      <p>Përshëndetje <strong>${displayName}</strong>,</p>
      <p><strong>${SELF_DUPLICATE_SCREEN_MESSAGE}</strong></p>
      <p><a href="${url}">Shiko shpalljen tënde aktive</a></p>
      <p style="color:#666;font-size:13px">KetuJemi është platformë serioze — mos ripostoni të njëjtat sende.</p>
    `;

    try {
      await sendTransactionalEmail({
        to: email,
        subject: "Shpallja jote është aktive — KetuJemi",
        text,
        html,
      });
    } catch (err) {
      logger.error({ err, userId: user.id, listingId }, "self-duplicate email failed");
    }
  }
}

export type SelfDuplicateBlockResult = {
  blocked: true;
  existingListingId: number;
  message: string;
};

/**
 * Block repost of identical or near-duplicate active listing by same user.
 * SMS/email at most once per (user, existing listing).
 */
export async function blockSelfDuplicateListingIfNeeded(
  user: User,
  title: string,
  description: string,
  opts: SelfDuplicateLookupOpts = {},
): Promise<SelfDuplicateBlockResult | null> {
  const existingId = await findSelfDuplicateActiveListingId(user.id, user, title, description, opts);
  if (existingId == null) return null;

  const notified = await alreadyNotifiedSelfDuplicate(user.id, existingId);
  if (!notified) {
    await sendSelfDuplicateNotifyOnce(user, existingId);
    await markSelfDuplicateNotified(user.id, existingId);
  }

  return {
    blocked: true,
    existingListingId: existingId,
    message: SELF_DUPLICATE_SCREEN_MESSAGE,
  };
}
