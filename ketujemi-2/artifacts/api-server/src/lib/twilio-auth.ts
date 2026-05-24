/**
 * Twilio HTTP Basic auth (REST fetch — no SDK).
 * Supports Account SID + Auth Token (AC…) or API Key + Secret (SK…) per Twilio docs.
 */

export function cleanTwilioEnv(name: string): string | null {
  const raw = process.env[name];
  if (raw == null) return null;
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v || null;
}

export type TwilioAuthMode = "account_token" | "api_key";

export type TwilioAuth = {
  authorization: string;
  mode: TwilioAuthMode;
  /** Account SID (AC…) — required for Messages API URL path. */
  accountSid: string | null;
};

export function getTwilioAuth(): TwilioAuth | null {
  const accountSid = cleanTwilioEnv("TWILIO_ACCOUNT_SID");
  const authToken = cleanTwilioEnv("TWILIO_AUTH_TOKEN");
  const apiKeySid = cleanTwilioEnv("TWILIO_API_KEY_SID");
  const apiKeySecret = cleanTwilioEnv("TWILIO_API_KEY_SECRET");

  if (apiKeySid?.startsWith("SK") && apiKeySecret) {
    return {
      authorization: basicAuthHeader(apiKeySid, apiKeySecret),
      mode: "api_key",
      accountSid: accountSid?.startsWith("AC") ? accountSid : null,
    };
  }

  if (accountSid?.startsWith("AC") && authToken) {
    return {
      authorization: basicAuthHeader(accountSid, authToken),
      mode: "account_token",
      accountSid,
    };
  }

  return null;
}

function basicAuthHeader(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}

/** API credentials present (Verify + Messages). Does not require a From phone number. */
export function hasTwilioApiCreds(): boolean {
  return getTwilioAuth() != null;
}

/** Messages API needs a sender number. */
export function hasTwilioSmsCreds(): boolean {
  return hasTwilioApiCreds() && Boolean(cleanTwilioEnv("TWILIO_PHONE_NUMBER"));
}

export function maskTwilioSid(value: string | null | undefined): string {
  if (!value) return "(missing)";
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

/** Safe startup / debug log — never logs secrets. */
export function twilioConfigSummary(): Record<string, string | boolean> {
  const auth = getTwilioAuth();
  const accountSid = cleanTwilioEnv("TWILIO_ACCOUNT_SID");
  const verifySid = cleanTwilioEnv("TWILIO_VERIFY_SERVICE_SID");
  return {
    apiCreds: hasTwilioApiCreds(),
    smsCreds: hasTwilioSmsCreds(),
    authMode: auth?.mode ?? "none",
    accountSid: maskTwilioSid(accountSid),
    accountSidLooksValid: Boolean(accountSid?.startsWith("AC")),
    apiKeySid: maskTwilioSid(cleanTwilioEnv("TWILIO_API_KEY_SID")),
    verifyServiceSid: maskTwilioSid(verifySid),
    verifyServiceLooksValid: Boolean(verifySid?.startsWith("VA")),
    hasPhoneNumber: Boolean(cleanTwilioEnv("TWILIO_PHONE_NUMBER")),
  };
}

export class TwilioApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly twilioCode?: number,
  ) {
    super(message);
    this.name = "TwilioApiError";
  }

  get isAuthFailure(): boolean {
    return (
      this.status === 401 ||
      this.twilioCode === 20003 ||
      /authenticate|bad credentials/i.test(this.message)
    );
  }
}

export async function parseTwilioJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
