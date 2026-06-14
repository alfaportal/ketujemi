/** Automatic baseline (daily cron + boost) never pushes above this — only real visits go higher. */
export const VIEWS_DAILY_INCREMENT_CAP = 124;

/** Only this fraction of listings/shops get the automatic daily bump each day (stagger by id). */
export const VIEWS_DAILY_STAGGER_BUCKETS = 7;

/** One-time trim: subtract this from rows that received an artificial boost (views still low). */
export const VIEWS_BOOST_TRIM_AMOUNT = 20;

/** Only trim rows at or above this — leaves organic low counts untouched. */
export const VIEWS_BOOST_TRIM_MIN_VIEWS = 20;

/** Active listings created on these calendar days (Europe/Belgrade) are trimmed, not boosted. */
export const VIEWS_TRIM_LISTING_YEAR = 2026;
export const VIEWS_TRIM_LISTING_MONTH = 6;
export const VIEWS_TRIM_LISTING_DAY_START = 13;
/** Inclusive end day (same month/year as start). */
export const VIEWS_TRIM_LISTING_DAY_END = 14;
