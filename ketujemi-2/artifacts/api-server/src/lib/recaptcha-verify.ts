import { logger } from "./logger";

type SiteVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export function isRecaptchaRequired(): boolean {
  return !!process.env.RECAPTCHA_SECRET_KEY?.trim();
}

/** Verify Google reCAPTCHA v2 checkbox token. */
export async function verifyRecaptchaToken(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) {
    return true;
  }

  if (!token.trim()) {
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token.trim(),
  });
  if (remoteIp && remoteIp !== "unknown") {
    body.set("remoteip", remoteIp);
  }

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as SiteVerifyResponse;

  if (data.success) {
    return true;
  }

  logger.warn({ errors: data["error-codes"] }, "recaptcha verification failed");
  return false;
}
