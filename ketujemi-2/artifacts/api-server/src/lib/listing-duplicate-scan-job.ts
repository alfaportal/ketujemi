import { db, listingsTable, moderationLogTable } from "@workspace/db";
import { and, eq, gt, isNotNull } from "drizzle-orm";
import { deleteListingCascade } from "./delete-listing-cascade";
import { logger } from "./logger";
import {
  listingsAreSimilarDuplicate,
  listingTextSimilarity,
  SELF_DUPLICATE_SCAN_THRESHOLD,
} from "./listing-text-similarity";
import { loadUserById, notifyScanDuplicateRemovedOnce } from "./listing-scan-duplicate-notify";

const SCAN_INTERVAL_MS = 24 * 60 * 60 * 1000;

type ActiveListingRow = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  created_at: Date;
};

function activeCondition() {
  return and(
    eq(listingsTable.status, "active"),
    gt(listingsTable.expires_at, new Date()),
    isNotNull(listingsTable.user_id),
  );
}

function clusterIndices(listings: ActiveListingRow[]): number[][] {
  const n = listings.length;
  if (n < 2) return [];

  const parent = Array.from({ length: n }, (_, i) => i);

  const find = (i: number): number => {
    let root = i;
    while (parent[root] !== root) {
      parent[root] = parent[parent[root]!]!;
      root = parent[root]!;
    }
    return root;
  };

  const union = (i: number, j: number) => {
    const ri = find(i);
    const rj = find(j);
    if (ri !== rj) parent[rj] = ri;
  };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (
        listingsAreSimilarDuplicate(
          listings[i]!.title,
          listings[i]!.description,
          listings[j]!.title,
          listings[j]!.description,
          SELF_DUPLICATE_SCAN_THRESHOLD,
        )
      ) {
        union(i, j);
      }
    }
  }

  const buckets = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const arr = buckets.get(root) ?? [];
    arr.push(i);
    buckets.set(root, arr);
  }

  return [...buckets.values()].filter((g) => g.length > 1);
}

async function logScanRemoval(opts: {
  removedId: number;
  keptId: number;
  userId: number;
  similarity: number;
}): Promise<void> {
  await db.insert(moderationLogTable).values({
    listing_id: opts.removedId,
    reason: `SCAN_SELF_DUPLICATE:user=${opts.userId}:kept=${opts.keptId}:sim=${opts.similarity.toFixed(2)}`,
    action: "removed",
  });
}

/**
 * Daily scan: same user_id, active listings, title+description similarity ≥80%.
 * Keeps oldest; removes newer duplicates.
 */
export async function scanAndRemoveSelfDuplicateListings(): Promise<{
  removed: number;
  notified: number;
  usersScanned: number;
}> {
  const rows = await db
    .select({
      id: listingsTable.id,
      user_id: listingsTable.user_id,
      title: listingsTable.title,
      description: listingsTable.description,
      created_at: listingsTable.created_at,
    })
    .from(listingsTable)
    .where(activeCondition());

  const typed: ActiveListingRow[] = rows
    .filter((r): r is typeof r & { user_id: number } => r.user_id != null)
    .map((r) => ({
      id: r.id,
      user_id: r.user_id,
      title: r.title,
      description: r.description,
      created_at: r.created_at,
    }));

  const byUser = new Map<number, ActiveListingRow[]>();
  for (const row of typed) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  let removed = 0;
  let notified = 0;

  for (const [userId, userListings] of byUser) {
    if (userListings.length < 2) continue;

    const sorted = [...userListings].sort(
      (a, b) => a.created_at.getTime() - b.created_at.getTime(),
    );

    const clusters = clusterIndices(sorted);

    for (const indices of clusters) {
      const members = indices.map((i) => sorted[i]!);
      members.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
      const kept = members[0]!;
      const toRemove = members.slice(1);

      for (const dup of toRemove) {
        const sim = listingTextSimilarity(
          kept.title,
          kept.description,
          dup.title,
          dup.description,
        );
        await logScanRemoval({
          removedId: dup.id,
          keptId: kept.id,
          userId,
          similarity: sim,
        });
        const ok = await deleteListingCascade(dup.id, "system");
        if (ok) removed += 1;
      }

      if (toRemove.length > 0) {
        const user = await loadUserById(userId);
        if (user) {
          const sent = await notifyScanDuplicateRemovedOnce(user, kept.id);
          if (sent) notified += 1;
        }
      }
    }
  }

  if (removed > 0) {
    logger.info({ removed, notified, usersScanned: byUser.size }, "self-duplicate scan completed");
  }

  return { removed, notified, usersScanned: byUser.size };
}

let scanInFlight = false;

export function startSelfDuplicateScanScheduler(): void {
  const run = () => {
    if (scanInFlight) return;
    scanInFlight = true;
    void scanAndRemoveSelfDuplicateListings()
      .catch((err) => {
        logger.error({ err }, "scanAndRemoveSelfDuplicateListings failed");
      })
      .finally(() => {
        scanInFlight = false;
      });
  };

  run();
  setInterval(run, SCAN_INTERVAL_MS);
}
