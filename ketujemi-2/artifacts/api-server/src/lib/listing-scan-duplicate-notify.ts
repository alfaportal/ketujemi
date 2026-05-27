import { db, listingScanDuplicateAlertsTable, usersTable, type User } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getPublicAppOrigin } from "./listing-expiry-reminders";
import { logger } from "./logger";
import { sendTransactionalEmail } from "./send-transactional-email";
import { normalizeSmsPhoneDigits, vonageSendSms } from "./vonage-sms";

export const SCAN_REMOVED_NOTIFY_MESSAGE =
  "Kemi gjetur dhe hequr një shpallje të njëjtë nga llogaria jote. Shpallja origjinale është aktive.";

const SCAN_REMOVED_SMS =
  "KetuJemi: Kemi hequr nje shpallje te njejte nga llogaria jote. Shpallja origjinale eshte aktive.";

export async function loadUserById(userId: number): Promise<User | null> {
  const [row] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return row ?? null;
}

async function scanAlertAlreadySent(userId: number, keptListingId: number): Promise<boolean> {
  const [row] = await db
    .select({ user_id: listingScanDuplicateAlertsTable.user_id })
    .from(listingScanDuplicateAlertsTable)
    .where(
      and(
        eq(listingScanDuplicateAlertsTable.user_id, userId),
        eq(listingScanDuplicateAlertsTable.kept_listing_id, keptListingId),
      ),
    )
    .limit(1);
  return !!row;
}

async function markScanAlertSent(userId: number, keptListingId: number): Promise<void> {
  await db
    .insert(listingScanDuplicateAlertsTable)
    .values({ user_id: userId, kept_listing_id: keptListingId })
    .onConflictDoNothing();
}

/** Email/SMS once per (user, kept listing) after periodic scan removes duplicates. */
export async function notifyScanDuplicateRemovedOnce(
  user: User,
  keptListingId: number,
): Promise<boolean> {
  if (await scanAlertAlreadySent(user.id, keptListingId)) return false;

  const displayName = user.display_name?.trim() || "Përdorues";
  const url = `${getPublicAppOrigin()}/listings/${keptListingId}`;

  const phone =
    normalizeSmsPhoneDigits(user.phone_e164_digits) ??
    normalizeSmsPhoneDigits(user.contact_phone);

  if (phone) {
    try {
      await vonageSendSms(phone, SCAN_REMOVED_SMS);
    } catch (err) {
      logger.error({ err, userId: user.id, keptListingId }, "scan-duplicate sms failed");
    }
  }

  const email = user.email?.trim();
  if (email && user.email_verified_at) {
    try {
      await sendTransactionalEmail({
        to: email,
        subject: "Shpallje e dyfishtë u hoq — KetuJemi",
        text: [
          `Përshëndetje ${displayName},`,
          "",
          SCAN_REMOVED_NOTIFY_MESSAGE,
          "",
          `Shpallja origjinale: ${url}`,
          "",
          "KetuJemi është platformë serioze — mos postoni të njëjtat sende disa herë.",
          "",
          "KetuJemi",
        ].join("\n"),
        html: `
          <p>Përshëndetje <strong>${displayName}</strong>,</p>
          <p><strong>${SCAN_REMOVED_NOTIFY_MESSAGE}</strong></p>
          <p><a href="${url}">Shiko shpalljen origjinale</a></p>
          <p style="color:#666;font-size:13px">KetuJemi është platformë serioze — mos postoni të njëjtat sende disa herë.</p>
        `,
      });
    } catch (err) {
      logger.error({ err, userId: user.id, keptListingId }, "scan-duplicate email failed");
    }
  }

  await markScanAlertSent(user.id, keptListingId);
  return true;
}
