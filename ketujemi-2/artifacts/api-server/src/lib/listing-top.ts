import { db, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export type TopPackageId = "s" | "m" | "l";

export type TopListingPurpose = "top_listing_s" | "top_listing_m" | "top_listing_l";

export type TopPackage = {
  id: TopPackageId;
  purpose: TopListingPurpose;
  priceEur: number;
  days: number;
  stripeName: string;
  stripeDescription: string;
};

export const TOP_PACKAGES: Record<TopPackageId, TopPackage> = {
  s: {
    id: "s",
    purpose: "top_listing_s",
    priceEur: 2,
    days: 4,
    stripeName: "KetuJemi TOP — 4 ditë",
    stripeDescription: "Njoftimi shfaqet në krye të listës për 4 ditë.",
  },
  m: {
    id: "m",
    purpose: "top_listing_m",
    priceEur: 5,
    days: 15,
    stripeName: "KetuJemi TOP — 15 ditë",
    stripeDescription: "Njoftimi shfaqet në krye të listës për 15 ditë.",
  },
  l: {
    id: "l",
    purpose: "top_listing_l",
    priceEur: 8,
    days: 30,
    stripeName: "KetuJemi TOP — 30 ditë",
    stripeDescription: "Njoftimi shfaqet në krye të listës për 30 ditë.",
  },
};

export const TOP_PACKAGE_LIST: TopPackage[] = [TOP_PACKAGES.s, TOP_PACKAGES.m, TOP_PACKAGES.l];

/** Phase 2: TOP payments + public TOP checkout (off until traffic). */
export function isPhase2Enabled(): boolean {
  return process.env.FEATURE_PHASE_2 === "true";
}

export function isTopListingPurpose(purpose: string): purpose is TopListingPurpose {
  return purpose === "top_listing_s" || purpose === "top_listing_m" || purpose === "top_listing_l";
}

export function topPackageByPurpose(purpose: string): TopPackage | null {
  if (!isTopListingPurpose(purpose)) return null;
  return TOP_PACKAGE_LIST.find((p) => p.purpose === purpose) ?? null;
}

export function topDaysForPurpose(purpose: string): number | null {
  return topPackageByPurpose(purpose)?.days ?? null;
}

export function isTopActive(row: {
  is_top: boolean;
  top_until: Date | null;
}): boolean {
  return !!(row.is_top && row.top_until && new Date(row.top_until) > new Date());
}

/** Drizzle order: TOP first, then normal by listed_at (newest first among normals). */
export const listingFeedOrderBy = [
  sql`(CASE WHEN ${listingsTable.is_top} = true AND ${listingsTable.top_until} > NOW() THEN 0 ELSE 1 END)`,
  sql`${listingsTable.top_until} DESC NULLS LAST`,
  sql`${listingsTable.listed_at} DESC`,
];

export async function applyTopBoostToListing(listingId: number, days: number): Promise<void> {
  const capDays = Math.max(1, Math.min(90, Math.floor(days)));
  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row) return;

  const base =
    row.top_until && new Date(row.top_until) > new Date()
      ? new Date(row.top_until)
      : new Date();
  const until = new Date(base);
  until.setDate(until.getDate() + capDays);

  await db
    .update(listingsTable)
    .set({
      is_top: true,
      top_count: (row.top_count ?? 0) + 1,
      top_until: until,
    })
    .where(eq(listingsTable.id, listingId));
}
