import { pool } from "@workspace/db";

const KEY_PREFIX = "fb_page:";

function tokenKey(pageId: string): string {
  return `${KEY_PREFIX}${pageId}`;
}

export type PersistedFacebookPageToken = {
  accessToken: string;
  expiresAt: string | null;
  updatedAt: string;
};

export async function loadPersistedFacebookPageToken(
  pageId: string,
): Promise<PersistedFacebookPageToken | null> {
  const key = tokenKey(pageId);
  const { rows } = await pool.query<{
    access_token: string;
    expires_at: Date | string | null;
    updated_at: Date | string;
  }>(
    `SELECT access_token, expires_at, updated_at
     FROM social_platform_tokens
     WHERE token_key = $1
     LIMIT 1`,
    [key],
  );
  const row = rows[0];
  if (!row?.access_token?.trim()) return null;
  return {
    accessToken: row.access_token.trim(),
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function savePersistedFacebookPageToken(
  pageId: string,
  accessToken: string,
  expiresAt: string | null,
  meta?: Record<string, unknown>,
): Promise<void> {
  const key = tokenKey(pageId);
  await pool.query(
    `INSERT INTO social_platform_tokens (token_key, access_token, expires_at, meta, updated_at)
     VALUES ($1, $2, $3::timestamptz, $4::jsonb, NOW())
     ON CONFLICT (token_key) DO UPDATE SET
       access_token = EXCLUDED.access_token,
       expires_at = EXCLUDED.expires_at,
       meta = EXCLUDED.meta,
       updated_at = NOW()`,
    [key, accessToken, expiresAt, meta ? JSON.stringify(meta) : null],
  );
}
