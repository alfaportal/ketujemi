import { db, listingsTable, moderationLogTable } from "@workspace/db";
import { count, gte, sql } from "drizzle-orm";
import { getMonitorCycleErrorsSince } from "./system-monitor-state.js";

export type DailyMonitorStats = {
  periodStart: string;
  periodEnd: string;
  newListings: number;
  duplicatesBlocked: number;
  duplicatesRemovedByScan: number;
  badImagesPurged: number;
  monitorCycleErrors: number;
  activeListings: number;
};

export async function gatherDailyMonitorStats(since: Date): Promise<DailyMonitorStats> {
  const periodStart = since.toISOString();
  const periodEnd = new Date().toISOString();

  const [newRow] = await db
    .select({ c: count() })
    .from(listingsTable)
    .where(gte(listingsTable.created_at, since));

  const [activeRow] = await db
    .select({ c: count() })
    .from(listingsTable)
    .where(sql`${listingsTable.status} = 'active'`);

  const modRows = await db
    .select({
      reason: moderationLogTable.reason,
      action: moderationLogTable.action,
      c: count(),
    })
    .from(moderationLogTable)
    .where(gte(moderationLogTable.created_at, since))
    .groupBy(moderationLogTable.reason, moderationLogTable.action);

  let duplicatesBlocked = 0;
  let duplicatesRemovedByScan = 0;
  let badImagesPurged = 0;

  for (const row of modRows) {
    const n = Number(row.c);
    const reason = row.reason ?? "";
    if (row.action === "blocked" && reason.includes("DUPLICATE")) {
      duplicatesBlocked += n;
    }
    if (row.action === "removed" && reason.includes("SCAN_SELF_DUPLICATE")) {
      duplicatesRemovedByScan += n;
    }
    if (reason.includes("MONITOR_BAD_IMAGE")) {
      badImagesPurged += n;
    }
  }

  const cycleErrors = getMonitorCycleErrorsSince(since).length;

  return {
    periodStart,
    periodEnd,
    newListings: Number(newRow?.c ?? 0),
    duplicatesBlocked,
    duplicatesRemovedByScan,
    badImagesPurged,
    monitorCycleErrors: cycleErrors,
    activeListings: Number(activeRow?.c ?? 0),
  };
}
