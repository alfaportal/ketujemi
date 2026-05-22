import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { db, partnersTable, usersTable } from "@workspace/db";
import type { PartnerApplication } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  generatePartnerActivationCode,
  partnerPackageLabel,
  type PartnerLinkType,
} from "./business-partner";
import { sendPartnerActivationEmail } from "./send-email";
import { getPublicAppOrigin } from "./listing-expiry-reminders";
import { logger } from "./logger";

function randomPassword(): string {
  return randomBytes(12).toString("base64url").slice(0, 16);
}

export async function ensurePartnerUserAccount(
  partner: Pick<
    PartnerApplication,
    | "id"
    | "email"
    | "phone"
    | "business_name"
    | "package"
    | "logo_url"
    | "link_url"
    | "link_type"
    | "contact_name"
    | "user_id"
  >,
): Promise<number> {
  if (partner.user_id) return partner.user_id;

  const email = partner.email.trim().toLowerCase();
  const phoneDigits = partner.phone.replace(/\D/g, "").slice(0, 20);
  const tier = partner.package === "vip" ? "vip" : "standard";
  const linkType = (partner.link_type?.trim() || "website") as PartnerLinkType;

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(usersTable)
      .set({
        account_type: "business",
        business_name: partner.business_name.slice(0, 200),
        business_tier: tier,
        business_status: "pending",
        contact_phone: phoneDigits || existing.contact_phone,
        partner_logo_url: partner.logo_url ?? existing.partner_logo_url,
        partner_link_url: partner.link_url,
        partner_link_type: linkType,
        display_name: partner.contact_name.slice(0, 120) || existing.display_name,
        ...(existing.phone_e164_digits ? {} : { phone_e164_digits: phoneDigits || null }),
      })
      .where(eq(usersTable.id, existing.id))
      .returning({ id: usersTable.id });

    await db
      .update(partnersTable)
      .set({ user_id: updated!.id })
      .where(eq(partnersTable.id, partner.id));

    return updated!.id;
  }

  const password = randomPassword();
  const hash = await bcrypt.hash(password, 10);

  const [created] = await db
    .insert(usersTable)
    .values({
      email,
      phone_e164_digits: phoneDigits || null,
      password_hash: hash,
      display_name: partner.contact_name.slice(0, 120),
      contact_phone: phoneDigits || null,
      account_type: "business",
      business_name: partner.business_name.slice(0, 200),
      business_tier: tier,
      business_status: "pending",
      partner_logo_url: partner.logo_url,
      partner_link_url: partner.link_url,
      partner_link_type: linkType,
      email_verified_at: new Date(),
    })
    .returning({ id: usersTable.id });

  await db
    .update(partnersTable)
    .set({ user_id: created!.id })
    .where(eq(partnersTable.id, partner.id));

  return created!.id;
}

export type ActivatePartnerResult = {
  partnerId: number;
  userId: number;
  activationCode: string;
  emailSent: boolean;
  temporaryPassword?: string;
};

/** After Stripe payment (or dev bypass): activate partner + user, send login email. */
export async function activatePartnerFromPayment(partnerId: number): Promise<ActivatePartnerResult | null> {
  const [partner] = await db
    .select()
    .from(partnersTable)
    .where(eq(partnersTable.id, partnerId))
    .limit(1);

  if (!partner) return null;
  if (partner.status === "rejected") return null;
  if (partner.status === "active" && partner.payment_status === "paid") {
    return {
      partnerId: partner.id,
      userId: partner.user_id ?? 0,
      activationCode: "",
      emailSent: false,
    };
  }

  const userId = await ensurePartnerUserAccount(partner);
  const tier = partner.package === "vip" ? "vip" : "standard";
  const activationCode = generatePartnerActivationCode();
  const now = new Date();
  const vipUntil = new Date();
  vipUntil.setDate(vipUntil.getDate() + 30);

  await db
    .update(partnersTable)
    .set({
      status: "active",
      payment_status: "paid",
      last_payment_at: now,
      user_id: userId,
      suspended_at: null,
      rejected_at: null,
      rejected_reason: null,
    })
    .where(eq(partnersTable.id, partnerId));

  const userPatch: Partial<typeof usersTable.$inferInsert> = {
    business_status: "active",
    business_tier: tier,
    business_name: partner.business_name,
    partner_logo_url: partner.logo_url,
    partner_link_url: partner.link_url,
    partner_link_type: partner.link_type,
    partner_activation_code: activationCode,
    partner_activation_sent_at: now,
    banned_at: null,
    ban_reason: null,
    suspended_until: null,
  };
  if (tier === "vip") {
    userPatch.vip_expires_at = vipUntil;
  }

  const [user] = await db
    .update(usersTable)
    .set(userPatch)
    .where(eq(usersTable.id, userId))
    .returning();

  let emailSent = false;
  let temporaryPassword: string | undefined;
  if (user?.email) {
    try {
      await sendPartnerActivationEmail({
        to: user.email,
        businessName: partner.business_name,
        activationCode,
        packageLabel: partnerPackageLabel(tier),
        profileUrl: `${getPublicAppOrigin()}/login`,
      });
      emailSent = true;
    } catch (err) {
      logger.error({ err, partnerId, userId }, "partner auto-activation email failed");
    }
  }

  return { partnerId, userId, activationCode, emailSent, temporaryPassword };
}

export async function syncPartnerStatusToUser(
  partnerId: number,
  status: "pending" | "active" | "suspended" | "rejected",
): Promise<void> {
  const [partner] = await db
    .select()
    .from(partnersTable)
    .where(eq(partnersTable.id, partnerId))
    .limit(1);
  if (!partner?.user_id) return;

  if (status === "active") {
    await db
      .update(usersTable)
      .set({ business_status: "active", banned_at: null, ban_reason: null, suspended_until: null })
      .where(eq(usersTable.id, partner.user_id));
  } else if (status === "suspended") {
    await db
      .update(usersTable)
      .set({ business_status: "blocked", ban_reason: "Partner i pezulluar" })
      .where(eq(usersTable.id, partner.user_id));
  } else if (status === "rejected") {
    await db
      .update(usersTable)
      .set({ business_status: "blocked", ban_reason: partner.rejected_reason ?? "Refuzuar" })
      .where(eq(usersTable.id, partner.user_id));
  } else {
    await db
      .update(usersTable)
      .set({ business_status: "pending" })
      .where(eq(usersTable.id, partner.user_id));
  }
}
