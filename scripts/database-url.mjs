/**
 * Normalize DATABASE_URL for Railway/Neon (shell-safe, validated hostname).
 *
 * Unquoted `&channel_binding=require` in .env / platform env files is often truncated
 * at `&`, which breaks the URL and can yield bogus hosts like "base".
 */
export function normalizeDatabaseUrl(raw) {
  if (raw == null) return "";
  let url = String(raw).trim();
  if (!url) return "";

  // Strip wrapping quotes from dashboard copy-paste
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  // Rejoin if shell split DATABASE_URL at `&channel_binding=...`
  const orphanChannel = process.env.channel_binding?.trim();
  if (
    orphanChannel &&
    !url.includes("channel_binding=") &&
    url.startsWith("postgres")
  ) {
    url = `${url}&channel_binding=${orphanChannel}`;
  }

  // Neon + pg: sslmode=require is enough; channel_binding breaks many env loaders
  url = url.replace(/[&?]channel_binding=[^&]*/gi, "");
  url = url.replace(/\?&/, "?").replace(/&&/g, "&").replace(/[?&]$/, "");

  if (url.startsWith("postgres") && !/[?&]sslmode=/.test(url)) {
    url += url.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }

  return url;
}

export function databaseUrlHost(url) {
  try {
    const normalized = url
      .replace(/^postgresql:/, "https:")
      .replace(/^postgres:/, "https:");
    return new URL(normalized).hostname;
  } catch {
    return null;
  }
}

export function assertValidDatabaseUrl(url, { label = "DATABASE_URL" } = {}) {
  if (!url) {
    throw new Error(`${label} is not set`);
  }
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    throw new Error(`${label} must be a postgres:// or postgresql:// URL`);
  }

  const host = databaseUrlHost(url);
  const badHosts = new Set(["base", "channel_binding", "require", "localhost"]);
  if (!host || !host.includes(".") || badHosts.has(host)) {
    throw new Error(
      `${label} has invalid hostname "${host ?? "?"}". ` +
        "In Railway Variables paste the full Neon URL in double quotes, or remove `&channel_binding=require` " +
        "(use only `?sslmode=require`). Example host: ep-xxxx.pooler.eu-central-1.aws.neon.tech",
    );
  }

  return { host, url };
}

/** Read and normalize process.env.DATABASE_URL; sets env when valid. */
export function resolveDatabaseUrlFromEnv() {
  const normalized = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (normalized) {
    process.env.DATABASE_URL = normalized;
  }
  return normalized;
}
