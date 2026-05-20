import { db, listingsTable, categoriesTable } from "@workspace/db";
import { and, desc, eq, gt, ne } from "drizzle-orm";
import { claudeJsonCompletion, isClaudeConfigured } from "./claude-client";

export type SimilarListingCard = {
  id: number;
  title: string;
  price: number;
  image_url: string | null;
  location: string;
};

async function fetchCategoryCandidates(
  categoryId: number,
  excludeId: number,
  limit = 20,
): Promise<SimilarListingCard[]> {
  const rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      price: listingsTable.price,
      image_url: listingsTable.image_url,
      location: listingsTable.location,
    })
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.category_id, categoryId),
        eq(listingsTable.status, "active"),
        ne(listingsTable.id, excludeId),
        gt(listingsTable.expires_at, new Date()),
      ),
    )
    .orderBy(desc(listingsTable.created_at))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    price: Number(r.price),
    image_url: r.image_url,
    location: r.location,
  }));
}

function pickByPriceProximity(
  current: SimilarListingCard,
  candidates: SimilarListingCard[],
  n = 3,
): SimilarListingCard[] {
  return [...candidates]
    .sort((a, b) => Math.abs(a.price - current.price) - Math.abs(b.price - current.price))
    .slice(0, n);
}

export async function getSimilarListingsForListing(listingId: number): Promise<SimilarListingCard[]> {
  const [current] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!current) return [];

  const candidates = await fetchCategoryCandidates(current.category_id, listingId);
  if (candidates.length === 0) return [];

  const currentCard: SimilarListingCard = {
    id: current.id,
    title: current.title,
    price: Number(current.price),
    image_url: current.image_url,
    location: current.location,
  };

  if (!isClaudeConfigured() || candidates.length <= 3) {
    return pickByPriceProximity(currentCard, candidates);
  }

  try {
    const parsed = await claudeJsonCompletion<{ ids: number[] }>({
      system: `Pick the 3 most similar classified listings by title and price.
Reply ONLY JSON: {"ids":[number,number,number]} using only IDs from the candidate list.`,
      user: JSON.stringify({
        current: { id: current.id, title: current.title, price: Number(current.price) },
        candidates: candidates.map((c) => ({ id: c.id, title: c.title, price: c.price })),
      }),
      maxTokens: 256,
    });

    if (!parsed?.ids?.length) {
      return pickByPriceProximity(currentCard, candidates);
    }

    const byId = new Map(candidates.map((c) => [c.id, c]));
    const picked: SimilarListingCard[] = [];
    for (const id of parsed.ids) {
      const row = byId.get(id);
      if (row) picked.push(row);
      if (picked.length >= 3) break;
    }
    return picked.length > 0 ? picked : pickByPriceProximity(currentCard, candidates);
  } catch {
    return pickByPriceProximity(currentCard, candidates);
  }
}

export async function getCategoryName(categoryId: number): Promise<string | null> {
  const [cat] = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, categoryId))
    .limit(1);
  return cat?.name ?? null;
}
