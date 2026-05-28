import { isTransactionalEmailConfigured, sendTransactionalEmail } from "./send-transactional-email.js";
import { logger } from "./logger.js";

export function getAdminEmail(): string | null {
  const admin = process.env.EMAIL_ADMIN?.trim();
  if (admin) return admin;
  const inbox = process.env.CONTACT_INBOX?.trim();
  return inbox || null;
}

export async function sendAdminMonitorEmail(opts: {
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  const to = getAdminEmail();
  if (!to) {
    logger.warn("EMAIL_ADMIN not set — monitor email skipped");
    return false;
  }
  if (!isTransactionalEmailConfigured()) {
    logger.warn({ to }, "Email not configured — monitor email skipped");
    return false;
  }
  return sendTransactionalEmail({ to, subject: opts.subject, text: opts.text, html: opts.html });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function monitorEmailHtml(title: string, bodyLines: string[]): string {
  const body = bodyLines.map((l) => `<p>${escapeHtml(l)}</p>`).join("");
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;line-height:1.5;color:#111">
<h2>${escapeHtml(title)}</h2>
${body}
<hr><p style="color:#666;font-size:12px">KetuJemi monitor automatik</p>
</body></html>`;
}
