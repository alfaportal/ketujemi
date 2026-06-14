/** Automatic baseline (daily cron + boost) never pushes above this — only real visits go higher. */
export const VIEWS_DAILY_INCREMENT_CAP = 124;

/** Only this fraction of listings/shops get the automatic daily bump each day (stagger by id). */
export const VIEWS_DAILY_STAGGER_BUCKETS = 7;

/** One-time trim: subtract this from rows that received an artificial boost (views still low). */
export const VIEWS_BOOST_TRIM_AMOUNT = 20;

/** Only trim rows at or above this — leaves organic low counts untouched. */
export const VIEWS_BOOST_TRIM_MIN_VIEWS = 20;
