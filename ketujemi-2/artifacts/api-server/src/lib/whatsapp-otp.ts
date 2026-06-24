import { randomInt, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { logger } from "./logger.js";
import {
  hasWhatsAppOtpCreds,
  isWhatsAppOtpEnabled,
  whatsappAccessToken,
  whatsappGraphMessagesUrl,
  whatsappOtpTemplateLanguage,
  whatsappOtpTemplateName,
} from "./whatsapp-auth-config.js";

export const WHATSAPP_VERIFY_REQUEST_PREFIX = "whatsapp:";

export function isWhatsAppVerifyRequestId(requestId: string): boolean {
  return requestId.startsWith(WHATSAPP_VERIFY_REQUEST_PREFIX);
}

export function sixDigitOtpCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

function whatsappRecipient(phoneDigits: string): string {
  return phoneDigits.replace(/\D/g, "");
}

function buildOtpTemplateComponents(code: string): unknown[] {
  const buttonType =
    process.env.WHATSAPP_OTP_BUTTON_TYPE?.trim().toLowerCase() ?? "copy_code";
  const components: unknown[] = [
    {
      type: "body",
      parameters: [{ type: "text", text: code }],
    },
  ];
  if (buttonType === "none" || buttonType === "off") return components;
  if (buttonType === "url") {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: code }],
    });
    return components;
  }
  components.push({
    type: "button",
    sub_type: "copy_code",
    index: "0",
    parameters: [{ type: "payload", payload: code }],
  });
  return components;
}

/** Dërgon kod OTP me template WhatsApp Cloud API (Meta Business). */
export async function sendWhatsAppOtpMessage(
  phoneDigits: string,
  code: string,
): Promise<void> {
  if (!hasWhatsAppOtpCreds()) {
    throw new Error(
      "WhatsApp OTP not configured. Set WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_CLOUD_API_ACCESS_TOKEN, WHATSAPP_OTP_TEMPLATE_NAME.",
    );
  }

  const token = whatsappAccessToken()!;
  const templateName = whatsappOtpTemplateName()!;
  const to = whatsappRecipient(phoneDigits);

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: whatsappOtpTemplateLanguage() },
      components: buildOtpTemplateComponents(code),
    },
  };

  const res = await fetch(whatsappGraphMessagesUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string; code?: number; type?: string };
    messages?: { id?: string }[];
  };

  if (!res.ok) {
    const detail =
      data.error?.message ??
      (typeof data === "object" ? JSON.stringify(data).slice(0, 200) : "unknown");
    logger.error(
      { phoneTail: to.slice(-4), detail, status: res.status },
      "whatsapp otp send failed",
    );
    throw new Error(detail || `WhatsApp API error (${res.status})`);
  }

  logger.info(
    { phoneTail: to.slice(-4), messageId: data.messages?.[0]?.id },
    "whatsapp otp sent",
  );
}

export async function startWhatsAppOtpChallenge(phoneDigits: string): Promise<{
  requestId: string;
  otpCodeHash: string;
}> {
  if (!isWhatsAppOtpEnabled()) {
    throw new Error("WHATSAPP_AUTH_DISABLED");
  }

  const code = sixDigitOtpCode();
  await sendWhatsAppOtpMessage(phoneDigits, code);
  const otpCodeHash = await bcrypt.hash(code, 10);
  return {
    requestId: `${WHATSAPP_VERIFY_REQUEST_PREFIX}${randomUUID()}`,
    otpCodeHash,
  };
}

export async function verifyWhatsAppOtpCode(
  otpCodeHash: string | null | undefined,
  code: string,
): Promise<void> {
  if (!otpCodeHash?.trim()) {
    throw new Error("WhatsApp verification challenge invalid");
  }
  const ok = await bcrypt.compare(code.trim(), otpCodeHash);
  if (!ok) {
    throw new Error("Invalid or expired code");
  }
}
