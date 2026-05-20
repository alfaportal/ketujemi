import { db, partnerLogoStatsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { fetchTrustedVipPartners } from "./trusted-partners";

export function currentStatsMonth(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

async function incrementStat(
  userId: number,
  field: "views" | "clicks",
  amount: number,
): Promise<void> {
  if (amount <= 0) return;
  const month = currentStatsMonth();
  const col = field === "views" ? "views" : "clicks";

  await db
    .insert(partnerLogoStatsTable)
    .values({
      user_id: userId,
      month,
      views: field === "views" ? amount : 0,
      clicks: field === "clicks" ? amount : 0,
    })
    .onConflictDoUpdate({
      target: [partnerLogoStatsTable.user_id, partnerLogoStatsTable.month],
      set:
        field === "views"
          ? { views: sql`${partnerLogoStatsTable.views} + ${amount}` }
          : { clicks: sql`${partnerLogoStatsTable.clicks} + ${amount}` },
    });
}

/** Only count stats for active VIP partners shown in the trusted strip. */
export async function filterTrustedPartnerIds(ids: number[]): Promise<number[]> {
  const trusted = await fetchTrustedVipPartners();
  const allowed = new Set(trusted.map((u) => u.id));
  return [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0 && allowed.has(id)))];
}

export async function recordPartnerLogoViews(partnerIds: number[]): Promise<void> {
  const ids = await filterTrustedPartnerIds(partnerIds);
  await Promise.all(ids.map((id) => incrementStat(id, "views", 1)));
}

export async function recordPartnerLogoClick(partnerId: number): Promise<void> {
  const [id] = await filterTrustedPartnerIds([partnerId]);
  if (!id) return;
  await incrementStat(id, "clicks", 1);
}

export async function getPartnerLogoStatsForUser(userId: number): Promise<{
  month: string;
  views: number;
  clicks: number;
}> {
  const month = currentStatsMonth();
  const [row] = await db
    .select()
    .from(partnerLogoStatsTable)
    .where(
      and(
        eq(partnerLogoStatsTable.user_id, userId),
        eq(partnerLogoStatsTable.month, month),
      ),
    )
    .limit(1);

  return {
    month,
    views: row?.views ?? 0,
    clicks: row?.clicks ?? 0,
  };
}
