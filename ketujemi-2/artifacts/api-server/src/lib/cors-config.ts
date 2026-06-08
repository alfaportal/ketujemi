const LOCAL_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const KETUJEMI_ORIGIN_RE = /^https:\/\/(www\.)?ketujemi\.com$/i;
const RAILWAY_ORIGIN_RE = /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/i;

function extraOriginsFromEnv(): string[] {
  const raw = process.env.CORS_ALLOWED_ORIGINS?.trim() ?? "";
  if (!raw) return [];
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

/** Allowed browser origins for credentialed API requests. */
export function isCorsOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  const appOrigin = process.env.PUBLIC_APP_ORIGIN?.trim().replace(/\/$/, "");
  if (appOrigin && origin === appOrigin) return true;
  if (LOCAL_ORIGIN_RE.test(origin)) return true;
  if (KETUJEMI_ORIGIN_RE.test(origin)) return true;
  if (RAILWAY_ORIGIN_RE.test(origin)) return true;
  return extraOriginsFromEnv().includes(origin);
}
