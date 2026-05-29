/** Dispatched after a TOP package payment succeeds so the home carousel refetches. */
export const TOP_LISTINGS_REFRESH_EVENT = "ketujemi:top-listings-refresh";

const STALE_KEY = "ketujemi:top-listings-stale";
const PENDING_ID_KEY = "ketujemi:top-listings-pending-id";
const BC_NAME = "ketujemi-top-listings";

export type TopListingsRefreshDetail = {
  listingId?: number;
  at: number;
};

export function notifyTopListingsRefresh(listingId?: number): void {
  if (typeof window === "undefined") return;
  const at = Date.now();
  try {
    sessionStorage.setItem(STALE_KEY, String(at));
    if (listingId != null && listingId > 0) {
      sessionStorage.setItem(PENDING_ID_KEY, String(listingId));
    } else {
      sessionStorage.removeItem(PENDING_ID_KEY);
    }
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent<TopListingsRefreshDetail>(TOP_LISTINGS_REFRESH_EVENT, {
      detail: { listingId, at },
    }),
  );
  try {
    const bc = new BroadcastChannel(BC_NAME);
    bc.postMessage({ type: "refresh", listingId, at });
    bc.close();
  } catch {
    /* ignore */
  }
}

export function consumeTopListingsPendingId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_ID_KEY);
    if (!raw) return null;
    const id = parseInt(raw, 10);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export function clearTopListingsPendingId(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_ID_KEY);
  } catch {
    /* ignore */
  }
}

export function subscribeTopListingsRefresh(
  cb: (detail: TopListingsRefreshDetail) => void,
): () => void {
  const onEvent = (e: Event) => {
    const ce = e as CustomEvent<TopListingsRefreshDetail>;
    cb(ce.detail ?? { at: Date.now() });
  };
  window.addEventListener(TOP_LISTINGS_REFRESH_EVENT, onEvent);

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(BC_NAME);
    bc.onmessage = (msg: MessageEvent<{ type?: string; listingId?: number; at?: number }>) => {
      if (msg.data?.type === "refresh") {
        cb({ listingId: msg.data.listingId, at: msg.data.at ?? Date.now() });
      }
    };
  } catch {
    /* ignore */
  }

  return () => {
    window.removeEventListener(TOP_LISTINGS_REFRESH_EVENT, onEvent);
    bc?.close();
  };
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

/** Fetch every active paid TOP listing — no row limit. */
export async function fetchTopListings(): Promise<TopListingCarouselItem[]> {
  const r = await fetch("/api/listings/top", {
    credentials: "include",
    cache: "no-store",
  });
  if (!r.ok) return [];
  const data = (await r.json()) as TopListingCarouselItem[] | { listings?: TopListingCarouselItem[] };
  if (Array.isArray(data)) return data;
  return Array.isArray(data.listings) ? data.listings : [];
}
