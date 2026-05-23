import {
  db,
  categoriesTable,
  listingDeletionLogTable,
  listingReportsTable,
  listingsTable,
  usersTable,
} from "@workspace/db";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { claudeTextCompletion, isClaudeConfigured } from "./claude-client";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

export type AdminAiDailySnapshot = {
  date: string;
  new_listings_today: {
    id: number;
    title: string;
    category: string;
    price_eur: number;
    moderation: string;
  }[];
  deleted_listings_today: {
    listing_id: number;
    title: string;
    category: string;
    price_eur: number | null;
    source: string;
  }[];
  new_users_today: {
    id: number;
    email: string | null;
    account_type: string;
    display_name: string | null;
  }[];
  open_reports: {
    id: number;
    listing_id: number;
    listing_title: string;
    reason: string;
    reporter_name: string;
    created_at: string;
  }[];
  top_categories_today: {
    category_id: number;
    category: string;
    new_listings: number;
  }[];
  totals: {
    new_listings: number;
    deleted_listings: number;
    new_users: number;
    open_reports: number;
  };
};

const AI_REPORT_SYSTEM = `Je analist i platformës së njoftimeve KetuJemi.com.
Merr një snapshot JSON me të dhëna të ditës dhe shkruaj raportin ADMINISTRATIV në shqip.

Formati i përgjigjes (markdown, vetëm këto 3 seksione me tituj saktë):

## Çfarë ka ndodhur sot
(bullet points — numra, kategori, trende)

## Çfarë është e dyshimtë
(bullet points — raportime, çmime, tituj, shitës të shumtë, etj.; nëse asgjë: "Asgjë e veçantë.")

## Çfarë veprime rekomandon
(bullet points — veprime konkrete me ID njoftimi/përdoruesi kur ka kuptim)

Rregulla:
- Shkruaj vetëm në shqip, qartë dhe profesionalisht.
- Mos shpik të dhëna që nuk janë në JSON.
- Përdor numra nga snapshot-i.
- Mos përmend Claude ose AI.`;

export async function gatherAdminAiDailySnapshot(): Promise<AdminAiDailySnapshot> {
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
      moderation_status: listingsTable.moderation_status,
    })
    .from(listingsTable)
    .where(and(gte(listingsTable.created_at, todayStart), lt(listingsTable.created_at, todayEnd)))
    .orderBy(desc(listingsTable.created_at))
    .limit(200);

  const deletedRows = await db
    .select()
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
      account_type: usersTable.account_type,
      display_name: usersTable.display_name,
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
    .limit(50);

  const listingTitles = await db
    .select({ id: listingsTable.id, title: listingsTable.title })
    .from(listingsTable);
  const listingTitleMap = new Map(listingTitles.map((l) => [l.id, l.title]));

  const topCatRows = await db
    .select({
      category_id: listingsTable.category_id,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(listingsTable)
    .where(and(gte(listingsTable.created_at, todayStart), lt(listingsTable.created_at, todayEnd)))
    .groupBy(listingsTable.category_id)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const new_listings_today = newListingsRows.map((l) => ({
    id: l.id,
    title: l.title,
    category: catMap.get(l.category_id) ?? "E panjohur",
    price_eur: Number(l.price),
    moderation: l.moderation_status === "rejected" ? "refuzuar" : "aprovuar",
  }));

  const deleted_listings_today = deletedRows.map((d) => ({
    listing_id: d.listing_id,
    title: d.title,
    category: d.category_id != null ? (catMap.get(d.category_id) ?? "E panjohur") : "—",
    price_eur: d.price != null ? Number(d.price) : null,
    source: d.source,
  }));

  const new_users_today = newUsersRows.map((u) => ({
    id: u.id,
    email: u.email,
    account_type: u.account_type,
    display_name: u.display_name,
  }));

  const open_reports = openReportsRows.map((r) => ({
    id: r.id,
    listing_id: r.listing_id,
    listing_title: listingTitleMap.get(r.listing_id) ?? "(fshirë ose i panjohur)",
    reason: r.reason,
    reporter_name: r.reporter_name,
    created_at: r.created_at.toISOString(),
  }));

  const top_categories_today = topCatRows.map((r) => ({
    category_id: r.category_id,
    category: catMap.get(r.category_id) ?? "E panjohur",
    new_listings: r.count,
  }));

  return {
    date: dateLabel,
    new_listings_today,
    deleted_listings_today,
    new_users_today,
    open_reports,
    top_categories_today,
    totals: {
      new_listings: new_listings_today.length,
      deleted_listings: deleted_listings_today.length,
      new_users: new_users_today.length,
      open_reports: open_reports.length,
    },
  };
}

export async function generateAdminAiDailyReport(): Promise<{
  snapshot: AdminAiDailySnapshot;
  report: string;
  ai_configured: boolean;
}> {
  const snapshot = await gatherAdminAiDailySnapshot();

  if (!isClaudeConfigured()) {
    return {
      snapshot,
      ai_configured: false,
      report:
        "ANTHROPIC_API_KEY nuk është konfiguruar. Shiko fushat `snapshot` për të dhënat e ditës.",
    };
  }

  const report = await claudeTextCompletion({
    system: AI_REPORT_SYSTEM,
    user: JSON.stringify(snapshot, null, 2),
    maxTokens: 2048,
  });

  return {
    snapshot,
    ai_configured: true,
    report: report || "Nuk u gjenerua raport.",
  };
}
