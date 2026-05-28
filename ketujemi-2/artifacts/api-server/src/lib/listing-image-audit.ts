import { db, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { listingImageUrlNeedsPurge } from "./listing-images.js";

export type ListingImageAuditResult = {
  scanned: number;
  invalidCount: number;
  sampleIds: number[];
  samples: { id: number; image_url: string }[];
};

/** Dry-run: find active listings with stock/external image_url (no DB writes). */
export async function auditInvalidListingImages(opts?: {
  activeOnly?: boolean;
}): Promise<ListingImageAuditResult> {
  const activeOnly = opts?.activeOnly !== false;

  const rows = activeOnly
    ? await db
        .select({
          id: listingsTable.id,
          image_url: listingsTable.image_url,
        })
        .from(listingsTable)
        .where(eq(listingsTable.status, "active"))
    : await db
        .select({
          id: listingsTable.id,
          image_url: listingsTable.image_url,
        })
        .from(listingsTable);

  const samples: { id: number; image_url: string }[] = [];
  const sampleIds: number[] = [];
  let invalidCount = 0;

  for (const row of rows) {
    if (!listingImageUrlNeedsPurge(row.image_url)) continue;
    invalidCount += 1;
    if (sampleIds.length < 15) {
      sampleIds.push(row.id);
      samples.push({
        id: row.id,
        image_url: (row.image_url ?? "").slice(0, 120),
      });
    }
  }

  return { scanned: rows.length, invalidCount, sampleIds, samples };
}
