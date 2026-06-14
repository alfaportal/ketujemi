import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  announcementLocaleFromPhoneDigits,
  parseAnnouncementLocale,
  unsubscribePageCopy,
} from "../lib/announcement-email-i18n.js";
import { parseMarketingUnsubscribeToken } from "../lib/marketing-unsubscribe-token.js";

const router = Router();

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unsubscribeHtmlPage(opts: {
  title: string;
  message: string;
  locale: string;
}): string {
  return `<!DOCTYPE html>
<html lang="${escapeHtml(opts.locale)}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(opts.title)} — KetuJemi</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; color: #111; max-width: 28rem; margin: 3rem auto; padding: 0 1rem; }
    h1 { font-size: 1.35rem; margin-bottom: 0.75rem; }
    p { color: #374151; }
    a { color: #1A56A0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(opts.title)}</h1>
  <p>${escapeHtml(opts.message)}</p>
  <p><a href="https://ketujemi.com/">KetuJemi.com</a></p>
</body>
</html>`;
}

function resolvePageLocale(req: {
  query: { lang?: string };
  headers: { "accept-language"?: string };
}): ReturnType<typeof parseAnnouncementLocale> {
  const q = typeof req.query.lang === "string" ? req.query.lang : null;
  if (q) return parseAnnouncementLocale(q);
  const accept = req.headers["accept-language"]?.split(",")[0]?.trim();
  return parseAnnouncementLocale(accept);
}

router.get("/email/unsubscribe", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const locale = resolvePageLocale(req);
  const copy = unsubscribePageCopy(locale);

  const parsed = parseMarketingUnsubscribeToken(token);
  if (!parsed) {
    res.status(400).type("html").send(
      unsubscribeHtmlPage({
        title: copy.invalid,
        message: copy.invalid,
        locale,
      }),
    );
    return;
  }

  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      marketing_email_opt_out: usersTable.marketing_email_opt_out,
      phone_e164_digits: usersTable.phone_e164_digits,
    })
    .from(usersTable)
    .where(eq(usersTable.id, parsed.userId))
    .limit(1);

  const userEmail = user?.email?.trim().toLowerCase() ?? "";
  if (!user || userEmail !== parsed.email) {
    res.status(400).type("html").send(
      unsubscribeHtmlPage({
        title: copy.invalid,
        message: copy.invalid,
        locale,
      }),
    );
    return;
  }

  const userLocale = announcementLocaleFromPhoneDigits(user.phone_e164_digits);
  const userCopy = unsubscribePageCopy(userLocale);

  if (user.marketing_email_opt_out) {
    res.type("html").send(
      unsubscribeHtmlPage({
        title: userCopy.already,
        message: userCopy.already,
        locale: userLocale,
      }),
    );
    return;
  }

  await db
    .update(usersTable)
    .set({ marketing_email_opt_out: true })
    .where(eq(usersTable.id, parsed.userId));

  res.type("html").send(
    unsubscribeHtmlPage({
      title: userCopy.title,
      message: userCopy.body,
      locale: userLocale,
    }),
  );
});

export default router;
