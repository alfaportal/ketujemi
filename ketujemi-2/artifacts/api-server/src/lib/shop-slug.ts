import { db, shopsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

export function slugifyShopName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "dyqan";
}

export async function generateUniqueShopSlug(shopName: string, excludeShopId?: number): Promise<string> {
  const base = slugifyShopName(shopName);
  let candidate = base;
  let n = 0;

  while (true) {
    const [row] = await db
      .select({ id: shopsTable.id })
      .from(shopsTable)
      .where(
        excludeShopId
          ? sql`lower(${shopsTable.slug}) = ${candidate.toLowerCase()} AND ${shopsTable.id} <> ${excludeShopId}`
          : sql`lower(${shopsTable.slug}) = ${candidate.toLowerCase()}`,
      )
      .limit(1);
    if (!row) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
    if (n > 200) return `${base}-${Date.now().toString(36)}`;
  }
}

export async function ensureShopSlug(shopId: number, shopName: string): Promise<string> {
  const [shop] = await db
    .select({ id: shopsTable.id, slug: shopsTable.slug, shop_name: shopsTable.shop_name })
    .from(shopsTable)
    .where(eq(shopsTable.id, shopId))
    .limit(1);
  if (!shop) throw new Error("Shop not found");
  const existing = shop.slug?.trim();
  if (existing) return existing;

  const slug = await generateUniqueShopSlug(shopName || shop.shop_name, shopId);
  await db.update(shopsTable).set({ slug }).where(eq(shopsTable.id, shopId));
  return slug;
}

export async function backfillMissingShopSlugs(): Promise<number> {
  const rows = await db
    .select({ id: shopsTable.id, shop_name: shopsTable.shop_name })
    .from(shopsTable)
    .where(sql`(${shopsTable.slug} IS NULL OR TRIM(${shopsTable.slug}) = '') AND ${shopsTable.deleted_at} IS NULL`);

  let count = 0;
  for (const row of rows) {
    await ensureShopSlug(row.id, row.shop_name);
    count += 1;
  }
  return count;
}

export function shopPublicPath(slug: string | null | undefined, shopId: number): string {
  const s = slug?.trim();
  return s ? `/dyqani/${s}` : `/dyqani/${shopId}`;
}

export async function resolveShopByIdOrSlug(raw: string): Promise<typeof shopsTable.$inferSelect | null> {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const numericId = Number(trimmed);
  if (Number.isFinite(numericId) && numericId >= 1 && String(numericId) === trimmed) {
    const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, numericId)).limit(1);
    return shop ?? null;
  }

  const [shop] = await db
    .select()
    .from(shopsTable)
    .where(sql`lower(${shopsTable.slug}) = ${trimmed.toLowerCase()}`)
    .limit(1);
  return shop ?? null;
}
