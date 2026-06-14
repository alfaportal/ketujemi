import { listingsTable } from "@workspace/db";
import { and, gte, lt, not, type SQL } from "drizzle-orm";
import {
  VIEWS_TRIM_LISTING_DAY_END,
  VIEWS_TRIM_LISTING_DAY_START,
  VIEWS_TRIM_LISTING_MONTH,
  VIEWS_TRIM_LISTING_YEAR,
} from "./views-constants.js";

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Midnight Belgrade (CEST +02:00 in June) through end of the last trim day. */
export function viewsTrimListingRangeBounds(): { start: Date; endExclusive: Date } {
  const y = VIEWS_TRIM_LISTING_YEAR;
  const m = pad2(VIEWS_TRIM_LISTING_MONTH);
  const dStart = pad2(VIEWS_TRIM_LISTING_DAY_START);
  const endDay = VIEWS_TRIM_LISTING_DAY_END + 1;
  const start = new Date(`${y}-${m}-${dStart}T00:00:00+02:00`);
  const endExclusive = new Date(`${y}-${m}-${pad2(endDay)}T00:00:00+02:00`);
  return { start, endExclusive };
}

/** Listings posted (created_at) on 13–14.06 — these get views lowered, not boosted. */
export function listingCreatedInTrimWindow(): SQL {
  const { start, endExclusive } = viewsTrimListingRangeBounds();
  return and(gte(listingsTable.created_at, start), lt(listingsTable.created_at, endExclusive))!;
}

export function listingCreatedOutsideTrimWindow(): SQL {
  return not(listingCreatedInTrimWindow());
}
