import { logger } from "./logger";

function getCreds(): { apiKey: string; apiSecret: string } | null {
  const apiKey = process.env.VONAGE_API_KEY?.trim();
  const apiSecret = process.env.VONAGE_API_SECRET?.trim();
  if (!apiKey || !apiSecret) return null;
  return { apiKey, apiSecret };
}

/** E.164 digits only (no +), e.g. 38344901234 */
export function normalizeSmsPhoneDigits(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

/**
 * Transactional SMS via Vonage SMS API (same credentials as Verify).
 * Returns true if at least one message was accepted by Vonage.
 */
export async function vonageSendSms(phoneDigits: string, text: string): Promise<boolean> {
  const creds = getCreds();
  if (!creds) {
    logger.warn({ phoneDigits: phoneDigits.slice(-4) }, "vonage sms skipped (no VONAGE creds)");
    return false;
  }

  const from = process.env.VONAGE_SMS_FROM?.trim() || "KetuJemi";
  const body = new URLSearchParams({
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
    to: phoneDigits,
    from,
    text: text.slice(0, 320),
  });

  const res = await fetch("https://rest.nexmo.com/sms/json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as {
    messages?: Array<{ status?: string; "error-text"?: string }>;
  };

  const msg = data.messages?.[0];
  if (msg && String(msg.status) === "0") {
    return true;
  }

  const errText = msg?.["error-text"] ?? "unknown";
  logger.error({ phoneDigits: phoneDigits.slice(-4), errText }, "vonage sms failed");
  return false;
}

export function buildListingPackageActivationSms(activationCode: string): string {
  return `KetuJemi: Paketa juaj u aktivizua! Kodi: ${activationCode}. Tani mund të postoni.`;
}
