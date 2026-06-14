import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import {
  db,
  usersTable,
  announcementCampaignsTable,
  type AnnouncementRecipientMode,
} from "@workspace/db";
import { getPlatformAdminUser } from "./admin-listing-on-behalf.js";
import { announcementBodyToHtml, buildAnnouncementEmailHtml } from "./announcement-email.js";
import {
  announcementLocaleFromPhoneDigits,
  type AnnouncementLocale,
} from "./announcement-email-i18n.js";
import { deliverEmail, isTransactionalEmailConfigured } from "./send-transactional-email.js";
import { enqueueEmail } from "../queues/jobQueue.js";
import { logger } from "./logger.js";

const SUBJECT_MAX = 200;
const SUBJECT_MIN = 3;
const BODY_MIN = 10;
const BODY_MAX = 50_000;

export function validateAnnouncementInput(subject: string, body: string): string | null {
  const sub = subject.trim();
  const bod = body.trim();
  if (sub.length < SUBJECT_MIN || sub.length > SUBJECT_MAX) {
    return `Subject must be ${SUBJECT_MIN}–${SUBJECT_MAX} characters`;
  }
  if (bod.length < BODY_MIN || bod.length > BODY_MAX) {
    return `Body must be ${BODY_MIN}–${BODY_MAX} characters`;
  }
  return null;
}

const recipientConditions = and(
  isNotNull(usersTable.email),
  isNotNull(usersTable.email_verified_at),
  eq(usersTable.marketing_email_opt_out, false),
  isNull(usersTable.banned_at),
  isNull(usersTable.deleted_at),
);

export async function countAnnouncementRecipients(): Promise<number> {
  const rows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(recipientConditions);
  return rows.length;
}

export type AnnouncementEligibleUser = {
  id: number;
  display_name: string | null;
  email: string;
};

export async function listAnnouncementEligibleUsers(): Promise<AnnouncementEligibleUser[]> {
  const rows = await db
    .select({
      id: usersTable.id,
      display_name: usersTable.display_name,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(recipientConditions)
    .orderBy(usersTable.display_name);

  const out: AnnouncementEligibleUser[] = [];
  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) continue;
    out.push({
      id: row.id,
      display_name: row.display_name?.trim() || null,
      email,
    });
  }
  return out;
}

export function parseAnnouncementRecipientUserIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const ids = new Set<number>();
  for (const item of raw) {
    const n = typeof item === "string" ? parseInt(item, 10) : Number(item);
    if (Number.isFinite(n) && n > 0) ids.add(Math.floor(n));
  }
  return [...ids];
}

function rowsToRecipients(
  rows: { id: number; email: string | null; phone_e164_digits: string | null }[],
): { id: number; email: string; locale: AnnouncementLocale }[] {
  const out: { id: number; email: string; locale: AnnouncementLocale }[] = [];
  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) continue;
    out.push({
      id: row.id,
      email,
      locale: announcementLocaleFromPhoneDigits(row.phone_e164_digits),
    });
  }
  return out;
}

async function listAnnouncementRecipients(): Promise<
  { id: number; email: string; locale: AnnouncementLocale }[]
> {
  const rows = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      phone_e164_digits: usersTable.phone_e164_digits,
    })
    .from(usersTable)
    .where(recipientConditions);
  return rowsToRecipients(rows);
}

async function listAnnouncementRecipientsByIds(
  userIds: number[],
): Promise<{ id: number; email: string; locale: AnnouncementLocale }[]> {
  if (userIds.length === 0) return [];
  const rows = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      phone_e164_digits: usersTable.phone_e164_digits,
    })
    .from(usersTable)
    .where(and(recipientConditions, inArray(usersTable.id, userIds)));
  return rowsToRecipients(rows);
}

async function dispatchAnnouncementEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  // One recipient per job — never batch multiple addresses in a single To: header.
  const mail = {
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  };
  if (process.env.REDIS_URL?.trim()) {
    await enqueueEmail(mail);
  } else {
    await deliverEmail(mail);
  }
}

export async function startAnnouncementCampaign(
  subject: string,
  body: string,
  recipientUserIds?: number[],
): Promise<{
  campaignId: number;
  recipientCount: number;
  recipientMode: AnnouncementRecipientMode;
  status: string;
}> {
  const err = validateAnnouncementInput(subject, body);
  if (err) throw new Error(err);

  if (!isTransactionalEmailConfigured()) {
    throw new Error("Email is not configured on the server");
  }

  const selectedIds = recipientUserIds?.filter((id) => id > 0) ?? [];
  const recipientMode: AnnouncementRecipientMode =
    selectedIds.length > 0 ? "selected" : "all";

  const recipients =
    recipientMode === "selected"
      ? await listAnnouncementRecipientsByIds(selectedIds)
      : await listAnnouncementRecipients();

  if (recipientMode === "selected" && recipients.length === 0) {
    throw new Error("No eligible recipients for the selected user IDs");
  }

  const bodyHtml = announcementBodyToHtml(body.trim());
  const adminUser = await getPlatformAdminUser();

  const [campaign] = await db
    .insert(announcementCampaignsTable)
    .values({
      subject: subject.trim(),
      body_html: bodyHtml,
      sent_by_admin_id: adminUser?.id ?? null,
      recipient_count: recipients.length,
      recipient_mode: recipientMode,
      status: "sending",
    })
    .returning();

  const campaignId = campaign!.id;

  logger.info(
    { campaignId, recipientMode, recipientCount: recipients.length },
    "announcement campaign started",
  );

  void processAnnouncementCampaign(campaignId, subject.trim(), bodyHtml, recipients).catch(
    (e) => {
      logger.error({ err: e, campaignId }, "announcement campaign background send failed");
    },
  );

  return {
    campaignId,
    recipientCount: recipients.length,
    recipientMode,
    status: "sending",
  };
}

async function processAnnouncementCampaign(
  campaignId: number,
  subject: string,
  bodyHtml: string,
  recipients: { id: number; email: string; locale: AnnouncementLocale }[],
): Promise<void> {
  try {
    for (const r of recipients) {
      const { html, text } = buildAnnouncementEmailHtml({
        locale: r.locale,
        subject,
        bodyHtml,
        userId: r.id,
        email: r.email,
      });
      await dispatchAnnouncementEmail({ to: r.email, subject, html, text });
    }

    await db
      .update(announcementCampaignsTable)
      .set({ status: "sent", recipient_count: recipients.length })
      .where(eq(announcementCampaignsTable.id, campaignId));
  } catch (err) {
    await db
      .update(announcementCampaignsTable)
      .set({ status: "failed" })
      .where(eq(announcementCampaignsTable.id, campaignId));
    throw err;
  }
}

export async function listAnnouncementCampaigns(limit = 20) {
  return db
    .select()
    .from(announcementCampaignsTable)
    .orderBy(desc(announcementCampaignsTable.created_at))
    .limit(limit);
}
