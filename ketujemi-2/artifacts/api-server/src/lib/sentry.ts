import * as Sentry from "@sentry/node";

function cleanEnv(name: string): string | null {
  const raw = process.env[name];
  if (!raw) return null;
  const v = raw.trim();
  return v ? v : null;
}

export function sentryDsn(): string | null {
  return cleanEnv("API_SENTRY_DSN") ?? cleanEnv("SENTRY_DSN");
}

export function isSentryEnabled(): boolean {
  return Boolean(sentryDsn());
}

export function initServerSentry(): void {
  const dsn = sentryDsn();
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    sendDefaultPii: false,
  });
}

export { Sentry };
