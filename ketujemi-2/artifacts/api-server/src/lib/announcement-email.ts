import {
  announcementEmailShell,
  type AnnouncementLocale,
} from "./announcement-email-i18n.js";
import { createMarketingUnsubscribeToken } from "./marketing-unsubscribe-token.js";
import { getPublicAppOrigin } from "./listing-expiry-reminders.js";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain text with newlines → simple HTML paragraphs (same idea as send-engagement-email). */
export function announcementBodyToHtml(body: string): string {
  const lines = body.split("\n");
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

export function buildAnnouncementEmailHtml(opts: {
  locale: AnnouncementLocale;
  subject: string;
  bodyHtml: string;
  userId: number;
  email: string;
}): { html: string; text: string } {
  const shell = announcementEmailShell(opts.locale);
  const origin = getPublicAppOrigin();
  const token = createMarketingUnsubscribeToken(opts.userId, opts.email);
  const unsubscribeUrl = `${origin}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;

  const html = `<!DOCTYPE html>
<html lang="${opts.locale}">
<body style="font-family:sans-serif;line-height:1.55;color:#111;max-width:36rem;margin:0 auto;padding:1rem">
<p>${escapeHtml(shell.greeting)}</p>
${opts.bodyHtml}
<hr style="border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0"/>
<p style="font-size:12px;color:#6b7280">${escapeHtml(shell.footerBrand)}</p>
<p style="font-size:12px;color:#6b7280">
  <a href="${escapeHtml(unsubscribeUrl)}">${escapeHtml(shell.unsubscribeLabel)}</a>
</p>
</body>
</html>`;

  const text = [
    shell.greeting,
    "",
    opts.bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    "",
    shell.footerBrand,
    `${shell.unsubscribeLabel}: ${unsubscribeUrl}`,
  ].join("\n");

  return { html, text };
}
