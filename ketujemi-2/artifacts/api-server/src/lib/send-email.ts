import { logger } from "./logger";

type VerifyMailPayload = {
  to: string;
  code: string;
  verifyUrl: string;
};

export async function sendEmailVerification(payload: VerifyMailPayload): Promise<void> {
  const { to, code, verifyUrl } = payload;
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["EMAIL_FROM"] ?? "KetuJemi <onboarding@ketujemi.com>";

  const subject = "Konfirmoni llogarinë — KetuJemi";
  const text = [
    "Për të aktivizuar llogarinë, klikoni lidhjen më poshtë ose vendosni kodin.",
    "",
    `Kodi: ${code}`,
    "",
    verifyUrl,
  ].join("\n");

  if (!apiKey) {
    logger.info({ to, code, verifyUrl }, "email verification (no RESEND_API_KEY — link logged)");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html: `<p>Për të aktivizuar llogarinë:</p><p><strong>${code}</strong></p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Email send failed: ${res.status} ${body}`);
  }
}
