import { db, phoneVerifyChallengesTable } from "@workspace/db";
import { and, eq, gte } from "drizzle-orm";

/** Kosovo, Albania, North Macedonia, Montenegro — reduces SMS fraud cost. */
export const SMS_LOCAL_DIAL_CODES = ["383", "355", "389", "382"] as const;

export function isLocalSmsCountry(phoneDigits: string): boolean {
  return SMS_LOCAL_DIAL_CODES.some((d) => phoneDigits.startsWith(d));
}

function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const COOLDOWN_MS = () => envInt("SMS_COOLDOWN_SECONDS", 60) * 1000;
const MAX_PER_PHONE_DAY = () => envInt("SMS_MAX_PER_PHONE_DAY", 3);
const MAX_PER_IP_HOUR = () => envInt("SMS_MAX_PER_IP_HOUR", 5);
const MAX_PER_IP_DAY = () => envInt("SMS_MAX_PER_IP_DAY", 15);

type IpHit = { ts: number };

const ipHits = new Map<string, IpHit[]>();

export function clientIp(req: { ip?: string; headers: Record<string, unknown> }): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.ip ?? "unknown";
}

function pruneOld(hits: IpHit[], windowMs: number): IpHit[] {
  const cutoff = Date.now() - windowMs;
  return hits.filter((h) => h.ts >= cutoff);
}

function assertIpLimits(ip: string): void {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;

  const prev = ipHits.get(ip) ?? [];
  const inHour = pruneOld(prev, hourMs);
  const inDay = pruneOld(prev, dayMs);

  if (inHour.length >= MAX_PER_IP_HOUR()) {
    const err = new Error("SMS_RATE_IP_HOUR") as Error & { publicMessage: string };
    err.publicMessage =
      "Shumë kërkesa SMS nga kjo lidhje. Provoni përsëri pas një ore ose përdorni email.";
    throw err;
  }

  if (inDay.length >= MAX_PER_IP_DAY()) {
    const err = new Error("SMS_RATE_IP_DAY") as Error & { publicMessage: string };
    err.publicMessage =
      "Kufiri ditor i SMS-ve u arrit. Provoni nesër ose regjistrohuni me email.";
    throw err;
  }

  inDay.push({ ts: now });
  ipHits.set(ip, inDay);
}

async function assertPhoneLimits(phone: string): Promise<void> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const cooldownSince = new Date(Date.now() - COOLDOWN_MS());

  const recent = await db
    .select({ created_at: phoneVerifyChallengesTable.created_at })
    .from(phoneVerifyChallengesTable)
    .where(
      and(
        eq(phoneVerifyChallengesTable.phone_e164_digits, phone),
        gte(phoneVerifyChallengesTable.created_at, dayAgo),
      ),
    )
    .orderBy(phoneVerifyChallengesTable.created_at);

  if (recent.length >= MAX_PER_PHONE_DAY()) {
    const err = new Error("SMS_RATE_PHONE_DAY") as Error & { publicMessage: string };
    err.publicMessage =
      "Për këtë numër keni kërkuar shumë kode SMS sot. Provoni nesër ose përdorni email.";
    throw err;
  }

  const last = recent[recent.length - 1];
  if (last && last.created_at > cooldownSince) {
    const err = new Error("SMS_COOLDOWN") as Error & { publicMessage: string };
    err.publicMessage = `Prisni ${envInt("SMS_COOLDOWN_SECONDS", 60)} sekonda para se të kërkoni kod të ri.`;
    throw err;
  }
}

export function assertLocalSmsCountry(phone: string): void {
  if (process.env.SMS_ALLOW_INTERNATIONAL === "true") return;
  if (isLocalSmsCountry(phone)) return;

  const err = new Error("SMS_COUNTRY_NOT_ALLOWED") as Error & { publicMessage: string };
  err.publicMessage =
    "SMS verifikimi është vetëm për numrat e Kosovës (+383), Shqipërisë (+355), Maqedonisë (+389) dhe Malit të Zi (+382). Për numra të tjerë përdorni regjistrimin me email.";
  throw err;
}

/** Block SMS spam / random international numbers before Vonage is called. */
export async function assertSmsStartAllowed(
  req: { ip?: string; headers: Record<string, unknown> },
  phone: string,
): Promise<void> {
  assertLocalSmsCountry(phone);
  assertIpLimits(clientIp(req));
  await assertPhoneLimits(phone);
}
