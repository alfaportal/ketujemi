import { and, eq, ne } from "drizzle-orm";
import { db, partnersTable } from "@workspace/db";
import { logger } from "./logger";
import { getPublicAppOrigin } from "./listing-expiry-reminders";
import { packageLabelFromTier } from "./partner-registration";
import { syncPartnerStatusToUser } from "./partner-activate";
import {
  sendPartnerUnpaidReminderEmail,
  sendPartnerSuspensionWarningEmail,
} from "./send-partner-registration-email";

const MS_DAY = 24 * 60 * 60 * 1000;
const REMINDER_INTERVAL_MS = 60 * 60 * 1000;

type ReminderKind = 3 | 7 | 15 | 30;

async function unpaidPartners() {
  return db
    .select()
    .from(partnersTable)
    .where(
      and(
        eq(partnersTable.status, "pending"),
        ne(partnersTable.payment_status, "paid"),
      ),
    );
}

async function processReminder(kind: ReminderKind): Promise<number> {
  const days = kind;
  const cutoff = new Date(Date.now() - days * MS_DAY);
  const rows = await unpaidPartners();
  let sent = 0;

  for (const p of rows) {
    if (p.created_at > cutoff) continue;

    const col =
      kind === 3
        ? p.reminder_3_sent_at
        : kind === 7
          ? p.reminder_7_sent_at
          : kind === 15
            ? p.reminder_15_sent_at
            : p.reminder_30_sent_at;
    if (col) continue;

    const payUrl = `${getPublicAppOrigin()}/partner?resume=${p.id}`;
    const packageLabel = packageLabelFromTier(
      p.package === "vip" ? "vip" : "standard",
    );

    if (kind === 30) {
      await db
        .update(partnersTable)
        .set({
          status: "suspended",
          suspended_at: new Date(),
          reminder_30_sent_at: new Date(),
        })
        .where(eq(partnersTable.id, p.id));
      await syncPartnerStatusToUser(p.id, "suspended");
      try {
        await sendPartnerSuspensionWarningEmail({
          to: p.email,
          businessName: p.business_name,
          packageLabel,
          payUrl,
        });
        sent++;
      } catch (err) {
        logger.error({ err, partnerId: p.id }, "partner 30d suspend email failed");
      }
      continue;
    }

    try {
      await sendPartnerUnpaidReminderEmail({
        to: p.email,
        businessName: p.business_name,
        packageLabel,
        payUrl,
        daysUnpaid: days,
      });
      const patch =
        kind === 3
          ? { reminder_3_sent_at: new Date() }
          : kind === 7
            ? { reminder_7_sent_at: new Date() }
            : { reminder_15_sent_at: new Date() };
      await db.update(partnersTable).set(patch).where(eq(partnersTable.id, p.id));
      sent++;
    } catch (err) {
      logger.error({ err, partnerId: p.id, kind }, "partner unpaid reminder failed");
    }
  }

  return sent;
}

export async function runPartnerUnpaidReminders(): Promise<void> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    logger.debug("partner unpaid reminders skipped (no RESEND_API_KEY)");
    return;
  }
  const r3 = await processReminder(3);
  const r7 = await processReminder(7);
  const r15 = await processReminder(15);
  const r30 = await processReminder(30);
  if (r3 + r7 + r15 + r30 > 0) {
    logger.info({ r3, r7, r15, r30 }, "partner unpaid reminders sent");
  }
}

export function startPartnerUnpaidReminderScheduler(): void {
  const run = () => {
    void runPartnerUnpaidReminders().catch((err) =>
      logger.error({ err }, "partner unpaid reminder job failed"),
    );
  };
  run();
  setInterval(run, REMINDER_INTERVAL_MS);
}
