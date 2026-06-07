import {
  db,
  listingsTable,
  profileChangeChallengesTable,
  profileChangeTokensTable,
  shopsTable,
  usersTable,
  type User,
} from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";
import { deleteListingCascade } from "./delete-listing-cascade";
import {
  formatDeletionFeedbackForAdminEmail,
  saveDeletionFeedback,
  type DeletionSurveyPayload,
} from "./deletion-feedback";
import {
  notifyAdminDeletion,
  sendAccountDeletionConfirmationEmail,
} from "./deletion-emails";
import { softDeleteShopWithFeedback } from "./soft-delete-shop";

function anonymizedUserPatch(userId: number): Partial<User> {
  const stamp = Date.now();
  return {
    deleted_at: new Date(),
    email: `deleted_user_${userId}_${stamp}@deleted.ketujemi.invalid`,
    phone_e164_digits: null,
    password_hash: null,
    display_name: "Përdorues i fshirë",
    contact_phone: null,
    profile_photo_url: null,
    city: null,
    about_me: null,
    email_verified_at: null,
    identity_verified: false,
    identity_verified_via: null,
    business_name: null,
    partner_logo_url: null,
    business_tier: null,
    business_status: null,
    partner_link_url: null,
    partner_link_type: null,
    partner_address: null,
    partner_facebook_url: null,
    partner_instagram_url: null,
    partner_whatsapp_number: null,
    partner_tiktok_url: null,
    partner_website_url: null,
    facebook_user_id: null,
    google_user_id: null,
    instagram_user_id: null,
    tiktok_user_id: null,
    instagram_username: null,
    partner_banner_urls: null,
    partner_activation_code: null,
    partner_activation_sent_at: null,
    vip_expires_at: null,
    wallet_balance_cents: 0,
  };
}

export async function softDeleteUserAccount(
  user: User,
  survey: DeletionSurveyPayload,
): Promise<{ confirmationEmail: string | null }> {
  const confirmationEmail = user.email?.trim() || null;
  const userId = user.id;

  const ownedShops = await db
    .select({ id: shopsTable.id })
    .from(shopsTable)
    .where(and(eq(shopsTable.user_id, userId), isNull(shopsTable.deleted_at)));

  for (const shop of ownedShops) {
    await softDeleteShopWithFeedback(shop.id, userId, survey, null, { skipFeedback: true });
  }

  const personalListings = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(and(eq(listingsTable.user_id, userId), isNull(listingsTable.shop_id)));

  for (const row of personalListings) {
    await deleteListingCascade(row.id, "system");
  }

  await saveDeletionFeedback({
    userId,
    entityType: "user",
    reason: survey.reason,
    customText: survey.custom_text,
    additionalFeedback: survey.additional_feedback,
  });

  await db.delete(profileChangeChallengesTable).where(eq(profileChangeChallengesTable.user_id, userId));
  await db.delete(profileChangeTokensTable).where(eq(profileChangeTokensTable.user_id, userId));

  await db.update(usersTable).set(anonymizedUserPatch(userId)).where(eq(usersTable.id, userId));

  if (confirmationEmail) {
    void sendAccountDeletionConfirmationEmail({ to: confirmationEmail }).catch(() => {});
  }

  void notifyAdminDeletion({
    subject: `Llogari e fshirë — user #${userId}`,
    lines: formatDeletionFeedbackForAdminEmail({
      entityType: "user",
      userId,
      reason: survey.reason,
      customText: survey.custom_text,
      additionalFeedback: survey.additional_feedback,
    }),
  }).catch(() => {});

  return { confirmationEmail };
}
