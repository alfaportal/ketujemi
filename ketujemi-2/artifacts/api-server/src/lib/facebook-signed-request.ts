import { createHmac, timingSafeEqual } from "node:crypto";
import { facebookAppSecret } from "./meta-oauth-config.js";

export type FacebookSignedRequestPayload = {
  algorithm?: string;
  expires?: number;
  issued_at?: number;
  user_id?: string;
  oauth_token?: string;
};

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const rem = normalized.length % 4;
  const padded = rem === 0 ? normalized : normalized + "=".repeat(4 - rem);
  return Buffer.from(padded, "base64");
}

export function parseFacebookSignedRequest(
  signedRequest: string,
  appSecret?: string | null,
):
  | { ok: true; payload: FacebookSignedRequestPayload & { user_id: string } }
  | { ok: false; error: string } {
  const secret = appSecret ?? facebookAppSecret();
  if (!secret) {
    return { ok: false, error: "FACEBOOK_APP_SECRET_MISSING" };
  }

  const parts = signedRequest.split(".", 2);
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, error: "INVALID_FORMAT" };
  }

  const [encodedSig, encodedPayload] = parts;

  const expectedSig = createHmac("sha256", secret).update(encodedPayload).digest();

  let sig: Buffer;
  try {
    sig = base64UrlDecode(encodedSig);
  } catch {
    return { ok: false, error: "INVALID_SIGNATURE_ENCODING" };
  }

  if (sig.length !== expectedSig.length || !timingSafeEqual(sig, expectedSig)) {
    return { ok: false, error: "SIGNATURE_MISMATCH" };
  }

  let payload: FacebookSignedRequestPayload;
  try {
    const json = base64UrlDecode(encodedPayload).toString("utf8");
    payload = JSON.parse(json) as FacebookSignedRequestPayload;
  } catch {
    return { ok: false, error: "INVALID_PAYLOAD" };
  }

  if (payload.algorithm?.toUpperCase() !== "HMAC-SHA256") {
    return { ok: false, error: "UNSUPPORTED_ALGORITHM" };
  }

  if (!payload.user_id || typeof payload.user_id !== "string") {
    return { ok: false, error: "MISSING_USER_ID" };
  }

  if (typeof payload.expires === "number" && payload.expires < Math.floor(Date.now() / 1000)) {
    return { ok: false, error: "EXPIRED" };
  }

  return { ok: true, payload: { ...payload, user_id: payload.user_id } };
}
