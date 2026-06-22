import { pool } from "@workspace/db";

/** Copy missing directory slugs from approved applications onto shop rows. */
const SYNC_DIRECTORY_FROM_APPLICATIONS_SQL = `
UPDATE shops s
SET
  directory_category_slug = COALESCE(NULLIF(TRIM(s.directory_category_slug), ''), NULLIF(TRIM(a.directory_category_slug), '')),
  directory_subcategory_slug = COALESCE(NULLIF(TRIM(s.directory_subcategory_slug), ''), NULLIF(TRIM(a.directory_subcategory_slug), '')),
  directory_category_id = COALESCE(s.directory_category_id, a.directory_category_id),
  directory_subcategory_id = COALESCE(s.directory_subcategory_id, a.directory_subcategory_id)
FROM shop_applications a
WHERE a.shop_id = s.id
  AND a.status = 'approved'
  AND s.is_active = true
  AND s.deleted_at IS NULL
  AND (
    COALESCE(NULLIF(TRIM(s.directory_category_slug), ''), '') = ''
    OR COALESCE(NULLIF(TRIM(s.directory_subcategory_slug), ''), '') = ''
  )
  AND (
    COALESCE(NULLIF(TRIM(a.directory_category_slug), ''), '') <> ''
    OR a.directory_category_id IS NOT NULL
  );
`;

let syncPromise: Promise<void> | null = null;
let lastSyncAt = 0;
const SYNC_TTL_MS = 15_000;

export async function syncShopDirectoryFieldsFromApplications(): Promise<void> {
  const now = Date.now();
  if (syncPromise && now - lastSyncAt < SYNC_TTL_MS) {
    await syncPromise;
    return;
  }

  lastSyncAt = now;
  syncPromise = pool
    .query(SYNC_DIRECTORY_FROM_APPLICATIONS_SQL)
    .then(() => undefined)
    .catch((err) => {
      syncPromise = null;
      throw err;
    });

  await syncPromise;
}
