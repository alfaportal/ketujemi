import crypto from "node:crypto";

function secret(): string {
  const s = process.env.SESSION_SECRET?.trim();
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET must be set (min 16 chars) for unsubscribe tokens");
  }
  return s;
}

function sign(userId: number, email: string): string {
  const normalized = email.trim().toLowerCase();
  return crypto.createHmac("sha256", secret()).update(`${userId}:${normalized}`).digest("base64url");
}

function timingSafeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/** Signed token for one-click marketing email unsubscribe (user id + email). */
export function createMarketingUnsubscribeToken(userId: number, email: string): string {
  const normalized = email.trim().toLowerCase();
  const payload = Buffer.from(`${userId}:${normalized}`, "utf8").toString("base64url");
  return `${payload}.${sign(userId, normalized)}`;
}

export function parseMarketingUnsubscribeToken(
  token: string,
): { userId: number; email: string } | null {
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) return null;

  const payloadB64 = trimmed.slice(0, dot);
  const sig = trimmed.slice(dot + 1);

  try {
    const decoded = Buffer.from(payloadB64, "base64url").toString("utf8");
    const colon = decoded.indexOf(":");
    if (colon <= 0) return null;

    const userId = Number(decoded.slice(0, colon));
    const email = decoded.slice(colon + 1).trim().toLowerCase();
    if (!Number.isFinite(userId) || userId <= 0 || !email.includes("@")) return null;

    const expected = sign(userId, email);
    if (!timingSafeEqualString(sig, expected)) return null;

    return { userId, email };
  } catch {
    return null;
  }
}
