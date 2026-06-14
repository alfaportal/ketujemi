import type { QueryClient } from "@tanstack/react-query";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { getGetListingQueryKey } from "@workspace/api-client-react";

const SESSION_PREFIX = "kj-listing-view:";

function sessionKey(listingId: number): string {
  return `${SESSION_PREFIX}${listingId}`;
}

/** Count one view per listing per browser tab session (avoids duplicate counts on refetch). */
export async function recordListingView(
  listingId: number,
  queryClient?: QueryClient,
): Promise<number | null> {
  if (!Number.isFinite(listingId) || listingId <= 0) return null;

  try {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(sessionKey(listingId))) {
      return null;
    }
  } catch {
    /* private mode */
  }

  try {
    const res = await fetchWithTimeout(`/api/listings/${listingId}/view`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;

    const data = (await res.json().catch(() => ({}))) as { views?: number };
    const views = typeof data.views === "number" ? data.views : null;

    try {
      sessionStorage.setItem(sessionKey(listingId), "1");
    } catch {
      /* ignore */
    }

    if (queryClient && views != null) {
      queryClient.setQueriesData(
        { queryKey: getGetListingQueryKey(listingId) },
        (old: { views?: number } | undefined) => (old ? { ...old, views } : old),
      );
    }

    return views;
  } catch {
    return null;
  }
}
