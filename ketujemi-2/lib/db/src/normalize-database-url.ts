/** Normalize Neon/Railway DATABASE_URL (shell-safe, valid hostname). */
export function normalizeDatabaseUrl(raw: string | undefined | null): string {
  if (raw == null) return "";
  let url = String(raw).trim();
  if (!url) return "";

  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  const orphanChannel = process.env.channel_binding?.trim();
  if (
    orphanChannel &&
    !url.includes("channel_binding=") &&
    url.startsWith("postgres")
  ) {
    url = `${url}&channel_binding=${orphanChannel}`;
  }

  url = url.replace(/[&?]channel_binding=[^&]*/gi, "");
  url = url.replace(/\?&/, "?").replace(/&&/g, "&").replace(/[?&]$/, "");

  if (url.startsWith("postgres") && !/[?&]sslmode=/.test(url)) {
    url += url.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }

  return url;
}

export function applyDatabaseUrlFromEnv(): string {
  const normalized = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (normalized) {
    process.env.DATABASE_URL = normalized;
  }
  return normalized;
}
