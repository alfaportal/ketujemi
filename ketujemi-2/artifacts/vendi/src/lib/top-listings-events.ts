/** Dispatched after a TOP package payment succeeds so the home carousel refetches. */
export const TOP_LISTINGS_REFRESH_EVENT = "ketujemi:top-listings-refresh";

export function notifyTopListingsRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOP_LISTINGS_REFRESH_EVENT));
}

export type TopListingCarouselItem = {
  id: number;
  title: string;
  price: number;
  location?: string | null;
  image_url?: string | null;
  primary_image_url?: string | null;
  top_until?: string | null;
  category_name?: string | null;
};

export async function fetchTopListings(limit = 24): Promise<TopListingCarouselItem[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const r = await fetch(`/api/listings/top?${params}`, { credentials: "include" });
  if (!r.ok) return [];
  const data = (await r.json()) as TopListingCarouselItem[] | { listings?: TopListingCarouselItem[] };
  if (Array.isArray(data)) return data;
  return Array.isArray(data.listings) ? data.listings : [];
}
