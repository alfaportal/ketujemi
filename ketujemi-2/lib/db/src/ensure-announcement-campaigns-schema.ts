import type pg from "pg";

const SQL = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_email_opt_out boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS announcement_campaigns (
  id serial PRIMARY KEY,
  subject text NOT NULL,
  body_html text NOT NULL,
  sent_by_admin_id integer REFERENCES users(id) ON DELETE SET NULL,
  recipient_count integer NOT NULL DEFAULT 0,
  recipient_mode text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp NOT NULL DEFAULT now()
);

ALTER TABLE announcement_campaigns
  ADD COLUMN IF NOT EXISTS recipient_mode text NOT NULL DEFAULT 'all';

CREATE INDEX IF NOT EXISTS announcement_campaigns_created_idx
  ON announcement_campaigns (created_at DESC);
`;

export async function ensureAnnouncementCampaignsSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SQL);
}
