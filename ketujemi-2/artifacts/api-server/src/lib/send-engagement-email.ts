import type { User } from "@workspace/db";
import { deliverEmail, isTransactionalEmailConfigured } from "./send-transactional-email";
import { logger } from "./logger";
import {
  defaultEngagementLocale,
  engagementEmailCopy,
  type EngagementLocale,
} from "./engagement-email-i18n";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ownerEmail(user: User): string | null {
  const email = user.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) return null;
  return email;
}

function textToHtml(text: string): string {
  const lines = text.split("\n");
  const parts: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      parts.push("<br/>");
      continue;
    }
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      parts.push(`<p><a href="${escapeHtml(trimmed)}">${escapeHtml(trimmed)}</a></p>`);
      continue;
    }
    parts.push(`<p>${escapeHtml(line)}</p>`);
  }
  return parts.join("\n");
}

async function sendToOwner(
  owner: User,
  locale: EngagementLocale,
  subject: string,
  text: string,
): Promise<void> {
  const to = ownerEmail(owner);
  if (!to) return;

  if (!isTransactionalEmailConfigured()) {
    logger.warn({ userId: owner.id, subject }, "engagement email skipped — email not configured");
    return;
  }

  try {
    await deliverEmail({
      to,
      subject,
      text,
      html: textToHtml(text),
    });
  } catch (err) {
    logger.error({ err, userId: owner.id, subject }, "engagement email failed");
  }
}

export async function sendListingFirstViewEmail(
  owner: User,
  listingTitle: string,
  locale: EngagementLocale = defaultEngagementLocale(),
): Promise<void> {
  const copy = engagementEmailCopy(locale);
  const text = copy.listingFirstView(listingTitle.trim());
  await sendToOwner(owner, locale, copy.listingFirstViewSubject, text);
}

export async function sendSocialFollowPromptEmail(
  owner: User,
  locale: EngagementLocale = defaultEngagementLocale(),
): Promise<void> {
  const copy = engagementEmailCopy(locale);
  await sendToOwner(owner, locale, copy.socialFollowSubject, copy.socialFollowText);
}
