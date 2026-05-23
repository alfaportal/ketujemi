import {
  db,
  categoriesTable,
  listingDeletionLogTable,
  listingModerationRejectionsTable,
  listingReportsTable,
  listingsTable,
  usersTable,
} from "@workspace/db";
import { and, count, desc, eq, gt, gte, lt, sql } from "drizzle-orm";

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfToday(): Date {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

/** Active = status active and not expired. */
function activeListingsCondition() {
  return and(gt(listingsTable.expires_at, new Date()), eq(listingsTable.status, "active"));
}

export type AdminOperatorContext = {
  date: string;
  new_listings_today: {
    id: number;
    title: string;
    category: string;
    price: number;
    status: string;
    created_at: string;
  }[];
  rejected_listings_today: {
    id: number;
    title: string;
    reason: string;
  }[];
  deleted_listings_today: {
    id: number;
    title: string;
  }[];
  new_users_today: {
    id: number;
    email: string | null;
    created_at: string;
  }[];
  open_reports: {
    id: number;
    listing_id: number;
    reason: string;
    count: number;
  }[];
  total_active_listings: number;
  top_categories_today: {
    category: string;
    count: number;
  }[];
};

/** Platform snapshot injected before every admin moderation command. */
export async function gatherAdminOperatorContext(): Promise<AdminOperatorContext> {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const dateLabel = todayStart.toISOString().slice(0, 10);

  const cats = await db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  const newListingsRows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      category_id: listingsTable.category_id,
      price: listingsTable.price,
      status: listingsTable.status,
      moderation_status: listingsTable.moderation_status,
      created_at: listingsTable.created_at,
    })
    .from(listingsTable)
    .where(and(gte(listingsTable.created_at, todayStart), lt(listingsTable.created_at, todayEnd)))
    .orderBy(desc(listingsTable.created_at))
    .limit(200);

  const rejectedRows = await db
    .select({
      id: listingModerationRejectionsTable.id,
      title: listingModerationRejectionsTable.title,
      reason: listingModerationRejectionsTable.reason,
    })
    .from(listingModerationRejectionsTable)
    .where(
      and(
        gte(listingModerationRejectionsTable.created_at, todayStart),
        lt(listingModerationRejectionsTable.created_at, todayEnd),
      ),
    )
    .orderBy(desc(listingModerationRejectionsTable.created_at))
    .limit(200);

  const deletedRows = await db
    .select({
      listing_id: listingDeletionLogTable.listing_id,
      title: listingDeletionLogTable.title,
    })
    .from(listingDeletionLogTable)
    .where(
      and(
        gte(listingDeletionLogTable.deleted_at, todayStart),
        lt(listingDeletionLogTable.deleted_at, todayEnd),
      ),
    )
    .orderBy(desc(listingDeletionLogTable.deleted_at))
    .limit(200);

  const newUsersRows = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      created_at: usersTable.created_at,
    })
    .from(usersTable)
    .where(and(gte(usersTable.created_at, todayStart), lt(usersTable.created_at, todayEnd)))
    .orderBy(desc(usersTable.created_at))
    .limit(100);

  const openReportsRows = await db
    .select()
    .from(listingReportsTable)
    .where(eq(listingReportsTable.status, "pending"))
    .orderBy(desc(listingReportsTable.created_at))
    .limit(100);

  const reportCountByListing = new Map<number, number>();
  for (const r of openReportsRows) {
    reportCountByListing.set(r.listing_id, (reportCountByListing.get(r.listing_id) ?? 0) + 1);
  }

  const [activeTotal] = await db
    .select({ total: count() })
    .from(listingsTable)
    .where(activeListingsCondition());

  const topCatRows = await db
    .select({
      category_id: listingsTable.category_id,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(listingsTable)
    .where(and(gte(listingsTable.created_at, todayStart), lt(listingsTable.created_at, todayEnd)))
    .groupBy(listingsTable.category_id)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  return {
    date: dateLabel,
    new_listings_today: newListingsRows.map((l) => ({
      id: l.id,
      title: l.title,
      category: catMap.get(l.category_id) ?? "E panjohur",
      price: Number(l.price),
      status: l.moderation_status === "rejected" ? "refuzuar" : l.status,
      created_at: l.created_at.toISOString(),
    })),
    rejected_listings_today: rejectedRows.map((r) => ({
      id: r.id,
      title: r.title,
      reason: r.reason,
    })),
    deleted_listings_today: deletedRows.map((d) => ({
      id: d.listing_id,
      title: d.title,
    })),
    new_users_today: newUsersRows.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at.toISOString(),
    })),
    open_reports: openReportsRows.map((r) => ({
      id: r.id,
      listing_id: r.listing_id,
      reason: r.reason,
      count: reportCountByListing.get(r.listing_id) ?? 1,
    })),
    total_active_listings: activeTotal?.total ?? 0,
    top_categories_today: topCatRows.map((r) => ({
      category: catMap.get(r.category_id) ?? "E panjohur",
      count: r.count,
    })),
  };
}
