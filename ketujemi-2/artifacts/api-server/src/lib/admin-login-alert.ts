import { getAdminEmail, monitorEmailHtml, sendAdminMonitorEmail } from "./admin-monitor-email.js";
import { logger } from "./logger.js";
import { hasVonageSmsCreds } from "./vonage-sms.js";
import { vonageSendSms } from "./vonage-sms.js";

const failAlertDebounceMs = 5 * 60 * 1000;
const lastFailAlertByIp = new Map<string, number>();

export function adminLoginClientIp(req: {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}): string {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) {
    return xf.split(",")[0]?.trim() || "unknown";
  }
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).trim();
  return req.ip?.trim() || "unknown";
}

function adminAlertPhone(): string | null {
  const raw =
    process.env.ADMIN_ALERT_PHONE?.trim() ||
    process.env.EMAIL_ADMIN_PHONE?.trim() ||
    null;
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

async function sendAdminSms(text: string): Promise<void> {
  const phone = adminAlertPhone();
  if (!phone || !hasVonageSmsCreds()) return;
  try {
    await vonageSendSms(phone, text);
  } catch (err) {
    logger.warn({ err }, "admin login alert sms failed");
  }
}

async function deliverAdminSecurityAlert(opts: {
  subject: string;
  lines: string[];
  sms?: string;
  force?: boolean;
  ip: string;
}): Promise<void> {
  if (!getAdminEmail()) {
    logger.warn("admin login alert skipped — set EMAIL_ADMIN in Railway");
    return;
  }

  const text = opts.lines.join("\n");
  void sendAdminMonitorEmail({
    subject: opts.subject,
    text,
    html: monitorEmailHtml(opts.subject, opts.lines),
  }).catch((err) => logger.warn({ err }, "admin login alert email failed"));

  if (opts.sms) {
    void sendAdminSms(opts.sms);
  }
}

/** Wrong password — debounced per IP (max 1 email / 5 min per IP). */
export function notifyAdminLoginFailed(req: {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}): void {
  const ip = adminLoginClientIp(req);
  const now = Date.now();
  const last = lastFailAlertByIp.get(ip) ?? 0;
  if (now - last < failAlertDebounceMs) return;
  lastFailAlertByIp.set(ip, now);

  const ua = String(req.headers["user-agent"] ?? "unknown").slice(0, 200);
  const at = new Date().toISOString();

  void deliverAdminSecurityAlert({
    ip,
    subject: "⚠️ KetuJemi — përpjekje e dështuar hyrjeje në Admin",
    lines: [
      "Dikush provoi të hyjë në panelin e adminit me fjalëkalim të gabuar.",
      `Koha (UTC): ${at}`,
      `IP: ${ip}`,
      `Pajisja: ${ua}`,
      "Nëse ishe ti, kontrollo fjalëkalimin. Nëse jo, dikush po provon të hyjë.",
    ],
    sms: `KetuJemi Admin: përpjekje e dështuar hyrjeje. IP ${ip}. Nëse nuk ishe ti, ndrysho fjalëkalimin në Railway.`,
  });
}

/** Rate limit hit — always alert immediately. */
export function notifyAdminLoginRateLimited(req: {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}): void {
  const ip = adminLoginClientIp(req);
  const ua = String(req.headers["user-agent"] ?? "unknown").slice(0, 200);
  const at = new Date().toISOString();

  void deliverAdminSecurityAlert({
    ip,
    subject: "🚨 KetuJemi — Admin login BLLLOKUAR (shumë përpjekje)",
    lines: [
      "IP-ja u bllokua për 15 minuta pas 5 përpjekjeve të gabuara për hyrje në admin.",
      `Koha (UTC): ${at}`,
      `IP: ${ip}`,
      `Pajisja: ${ua}`,
      "Mund të jetë dikush që po provon të marrë fjalëkalimin. Kontrollo dhe ndrysho ADMIN_PANEL_PASSWORD në Railway nëse nuk ishe ti.",
    ],
    sms: `KetuJemi URGJENT: admin login bllokuar (5 përpjekje). IP ${ip}. Shiko emailin.`,
  });
}
