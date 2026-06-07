import {
  db,
  listingsTable,
  shopApplicationsTable,
  shopsTable,
  type Shop,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { deleteListingCascade } from "./delete-listing-cascade";
import {
  formatDeletionFeedbackForAdminEmail,
  saveDeletionFeedback,
  type DeletionSurveyPayload,
} from "./deletion-feedback";
import {
  notifyAdminDeletion,
  sendShopDeletionConfirmationEmail,
} from "./deletion-emails";

const ANON_LOGO = "/logo-icon.svg";

function anonymizedShopPatch(shopId: number): Partial<Shop> {
  return {
    is_active: false,
    deleted_at: new Date(),
    shop_name: "Dyqan i fshirë",
    description: "",
    logo_url: ANON_LOGO,
    contact_name: "—",
    phone: "—",
    email: `deleted-shop-${shopId}@deleted.ketujemi.invalid`,
    address: "",
    facebook: null,
    instagram: null,
    tiktok: null,
    whatsapp: null,
    website: null,
  };
}

export async function softDeleteShopWithFeedback(
  shopId: number,
  userId: number,
  survey: DeletionSurveyPayload,
  notifyEmail: string | null,
  opts?: { skipFeedback?: boolean },
): Promise<boolean> {
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, shopId)).limit(1);
  if (!shop || shop.user_id !== userId || shop.deleted_at) return false;

  const shopName = shop.shop_name;

  const listingRows = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(eq(listingsTable.shop_id, shopId));

  for (const row of listingRows) {
    await deleteListingCascade(row.id, "system");
  }

  await db.update(shopsTable).set(anonymizedShopPatch(shopId)).where(eq(shopsTable.id, shopId));

  if (shop.application_id) {
    await db
      .update(shopApplicationsTable)
      .set({
        shop_id: null,
        status: "rejected",
        rejected_reason: "Dyqani u fshi nga pronari",
      })
      .where(eq(shopApplicationsTable.id, shop.application_id));
  } else {
    await db
      .update(shopApplicationsTable)
      .set({ shop_id: null, status: "rejected", rejected_reason: "Dyqani u fshi nga pronari" })
      .where(eq(shopApplicationsTable.shop_id, shopId));
  }

  if (!opts?.skipFeedback) {
    await saveDeletionFeedback({
      userId,
      entityType: "shop",
      shopId,
      reason: survey.reason,
      customText: survey.custom_text,
      additionalFeedback: survey.additional_feedback,
    });

    if (notifyEmail) {
      void sendShopDeletionConfirmationEmail({ to: notifyEmail, shopName }).catch(() => {});
    }

    void notifyAdminDeletion({
      subject: `Dyqan i fshirë: ${shopName}`,
      lines: formatDeletionFeedbackForAdminEmail({
        entityType: "shop",
        userId,
        shopId,
        shopName,
        reason: survey.reason,
        customText: survey.custom_text,
        additionalFeedback: survey.additional_feedback,
      }),
    }).catch(() => {});
  }

  return true;
}
