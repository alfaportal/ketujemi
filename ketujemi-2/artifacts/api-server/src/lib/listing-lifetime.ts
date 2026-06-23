/** Max time a listing stays public before automatic removal (not the per-category post limit). */
export const LISTING_ACTIVE_LIFETIME_DAYS = 90;

export function expiresAtAfterListingLifetime(): Date {
  const d = new Date();
  d.setDate(d.getDate() + LISTING_ACTIVE_LIFETIME_DAYS);
  return d;
}

/** Operator/admin posts stay public far longer than normal seller listings. */
export const ADMIN_LISTING_ACTIVE_LIFETIME_DAYS = 3650;

export function expiresAtForAdminOperator(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ADMIN_LISTING_ACTIVE_LIFETIME_DAYS);
  return d;
}
