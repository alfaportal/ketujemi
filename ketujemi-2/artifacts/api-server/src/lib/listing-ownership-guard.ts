import type { Request } from "express";
import { db, moderationLogTable, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAdminEmail, monitorEmailHtml, sendAdminMonitorEmail } from "./admin-monitor-email.js";
import { logger } from "./logger.js";
import {
  canonicalSellerContactForUser,
  listingContactMatchesUser,
  parseSpecsEmailFromDescription,
  phonesMatch,
} from "./listing-ownership.js";

export type OwnershipViolationContext =
  | "listing_create"
  | "listing_update"
  | "social_cron_facebook"
  | "social_cron_instagram"
  | "social_cron_reel"
  | "admin_social_post";

const alertDebounceMs = 5 * 60 * 1000;
const lastAlertByUser = new Map<number, number>();

export function userHasPostableContact(
  user: Pick<User, "display_name" | "contact_phone" | "phone_e164_digits">,
): boolean {
  const { seller_name, seller_phone } = canonicalSellerContactForUser(user);
  return seller_name.length >= 2 && seller_phone.replace(/\D/g, "").length >= 8;
}

import { normalizePersonName } from "./listing-text-normalize.js";

/** When profile lacks seller contact, persist name/phone from the listing form before posting. */
export async function syncSellerContactFromListingIfNeeded(
  user: User,
  submitted: { seller_name: string; seller_phone: string },
): Promise<User> {
  if (userHasPostableContact(user)) return user;

  const name = normalizePersonName(submitted.seller_name);
  const digits = submitted.seller_phone.replace(/\D/g, "");
  if (name.length < 2 || digits.length < 8) return user;

  const [row] = await db
    .update(usersTable)
    .set({
      display_name: name.slice(0, 120),
      contact_phone: digits.slice(0, 20),
    })
    .where(eq(usersTable.id, user.id))
    .returning();

  return row ?? user;
}

/** Sync profile name (and phone if missing) when the user edits contact on the post form. */
export async function syncSellerContactFromListingOnPost(
  user: User,
  submitted: { seller_name: string; seller_phone: string },
): Promise<User> {
  const name = normalizePersonName(submitted.seller_name);
  const digits = submitted.seller_phone.replace(/\D/g, "");
  const canonical = canonicalSellerContactForUser(user);
  const updates: { display_name?: string; contact_phone?: string } = {};

  if (name.length >= 2 && name.toLocaleLowerCase() !== canonical.seller_name.toLocaleLowerCase()) {
    updates.display_name = name.slice(0, 120);
  }
  if (digits.length >= 8 && canonical.seller_phone.replace(/\D/g, "").length < 8) {
    updates.contact_phone = digits.slice(0, 20);
  }

  if (Object.keys(updates).length === 0) return user;

  const [row] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, user.id))
    .returning();

  return row ?? user;
}

export type ContactImpersonationCheck = {
  impersonation: boolean;
  reason: string;
};

/** Detect when a client tries to post with another person's phone, name, or email. */
export function detectContactImpersonation(
  user: Pick<User, "email" | "display_name" | "contact_phone" | "phone_e164_digits">,
  submitted: { seller_name: string; seller_phone: string; description: string },
): ContactImpersonationCheck {
  const canonical = canonicalSellerContactForUser(user);

  if (!phonesMatch(canonical.seller_phone, submitted.seller_phone)) {
    return { impersonation: true, reason: "seller_phone_mismatch" };
  }

  const submittedName = submitted.seller_name?.trim() ?? "";
  const canonicalName = canonical.seller_name.trim();
  if (
    submittedName &&
    canonicalName &&
    submittedName.toLocaleLowerCase() !== canonicalName.toLocaleLowerCase()
  ) {
    return { impersonation: true, reason: "seller_name_mismatch" };
  }

  const specEmail = parseSpecsEmailFromDescription(submitted.description);
  const userEmail = user.email?.trim().toLowerCase() ?? "";
  if (specEmail) {
    if (!userEmail) {
      return { impersonation: true, reason: "foreign_email_without_account_email" };
    }
    if (specEmail !== userEmail) {
      return { impersonation: true, reason: "description_email_mismatch" };
    }
  }

  return { impersonation: false, reason: "" };
}

function replaceSpecsEmail(description: string, email: string): string {
  const sep = "\n\n";
  const idx = description.indexOf(sep);
  if (idx <= 0) return description;
  const firstLine = description.slice(0, idx);
  const rest = description.slice(idx);
  const pairs = firstLine.split(" · ").map((pair) => {
    const colon = pair.indexOf(": ");
    if (colon <= 0) return pair;
    const key = pair.slice(0, colon).trim();
    if (key === "Email") return `Email: ${email}`;
    return pair;
  });
  return pairs.join(" · ") + rest;
}

export function stripEmailFromListingDescription(description: string): string {
  return removeEmailFromSpecsLine(description);
}

function removeEmailFromSpecsLine(description: string): string {
  const sep = "\n\n";
  const idx = description.indexOf(sep);
  if (idx <= 0) return description;
  const firstLine = description.slice(0, idx);
  const rest = description.slice(idx);
  const pairs = firstLine
    .split(" · ")
    .filter((pair) => {
      const colon = pair.indexOf(": ");
      if (colon <= 0) return true;
      return pair.slice(0, colon).trim() !== "Email";
    });
  if (pairs.length === 0) return description.slice(idx + sep.length);
  return pairs.join(" · ") + rest;
}

/** Force description specs email to the account email (or strip foreign email). */
export function sanitizeListingDescriptionEmail(
  description: string,
  userEmail: string | null | undefined,
): string {
  const specEmail = parseSpecsEmailFromDescription(description);
  if (!specEmail) return description;
  const normalizedUser = userEmail?.trim().toLowerCase() ?? "";
  if (!normalizedUser) return removeEmailFromSpecsLine(description);
  if (specEmail === normalizedUser) return description;
  return replaceSpecsEmail(description, normalizedUser);
}

export function clientIp(req: {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}): string {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) {
    return xf.split(",")[0]?.trim() || "unknown";
  }
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).trim();
  return req.ip?.trim() || "unknown";
}

async function notifyAdminOwnershipViolation(opts: {
  userId: number;
  listingId?: number;
  context: OwnershipViolationContext;
  reason: string;
  ip?: string;
  submittedPhone?: string;
  submittedName?: string;
}): Promise<void> {
  const now = Date.now();
  const last = lastAlertByUser.get(opts.userId) ?? 0;
  if (now - last < alertDebounceMs) return;
  lastAlertByUser.set(opts.userId, now);

  if (!getAdminEmail()) {
    logger.warn({ userId: opts.userId }, "listing ownership alert skipped — EMAIL_ADMIN not set");
    return;
  }

  const at = new Date().toISOString();
  const lines = [
    "Përpjekje për postim me të dhëna kontakti që nuk përputhen me llogarinë e regjistruar.",
    `Koha (UTC): ${at}`,
    `Konteksti: ${opts.context}`,
    `Arsyeja: ${opts.reason}`,
    `User ID: ${opts.userId}`,
    opts.listingId != null ? `Listing ID: ${opts.listingId}` : "Listing ID: (n/a)",
    opts.ip ? `IP: ${opts.ip}` : "",
    opts.submittedPhone ? `Telefon i dërguar: ${opts.submittedPhone}` : "",
    opts.submittedName ? `Emër i dërguar: ${opts.submittedName}` : "",
    "Postimi u refuzua. Kontrollo llogarinë dhe njoftimet e fundit.",
  ].filter(Boolean);

  void sendAdminMonitorEmail({
    subject: "🚨 KetuJemi — përpjekje impersonimi në postim njoftimi",
    text: lines.join("\n"),
    html: monitorEmailHtml("Përpjekje impersonimi në postim", lines),
  }).catch((err) => logger.warn({ err }, "listing ownership alert email failed"));
}

export async function recordListingOwnershipViolation(opts: {
  userId: number;
  listingId?: number;
  context: OwnershipViolationContext;
  reason: string;
  req?: Request;
  submittedPhone?: string;
  submittedName?: string;
  alertAdmin?: boolean;
}): Promise<void> {
  logger.error(
    {
      userId: opts.userId,
      listingId: opts.listingId,
      context: opts.context,
      reason: opts.reason,
      ip: opts.req ? clientIp(opts.req) : undefined,
      submittedPhone: opts.submittedPhone,
      submittedName: opts.submittedName,
    },
    "listing ownership violation",
  );

  await db.insert(moderationLogTable).values({
    listing_id: opts.listingId ?? null,
    reason: `OWNERSHIP_VIOLATION:${opts.context}:${opts.reason}:user=${opts.userId}`,
    action: "blocked",
  });

  if (opts.alertAdmin !== false) {
    void notifyAdminOwnershipViolation({
      userId: opts.userId,
      listingId: opts.listingId,
      context: opts.context,
      reason: opts.reason,
      ip: opts.req ? clientIp(opts.req) : undefined,
      submittedPhone: opts.submittedPhone,
      submittedName: opts.submittedName,
    });
  }
}

export type ListingIntegrityRow = {
  id: number;
  user_id: number | null;
  seller_name: string;
  seller_phone: string;
  description: string;
};

/** Verify listing contact matches its stored owner before social publish. */
export async function verifyListingOwnerIntegrity(
  listing: ListingIntegrityRow,
  context: OwnershipViolationContext,
): Promise<{ ok: true; owner: User } | { ok: false; reason: string }> {
  if (listing.user_id == null) {
    return { ok: false, reason: "missing_user_id" };
  }

  const [owner] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, listing.user_id))
    .limit(1);

  if (!owner) {
    return { ok: false, reason: "owner_not_found" };
  }

  if (!listingContactMatchesUser(owner, listing)) {
    void recordListingOwnershipViolation({
      userId: listing.user_id,
      listingId: listing.id,
      context,
      reason: "listing_contact_owner_mismatch",
      alertAdmin: true,
    });
    return { ok: false, reason: "listing_contact_owner_mismatch" };
  }

  return { ok: true, owner };
}
