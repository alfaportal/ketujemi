import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

const SESSION_PREFIX = "kj-shop-view:";

function sessionKey(shopId: number): string {
  return `${SESSION_PREFIX}${shopId}`;
}

/** Count one view per shop per browser tab session (guests and logged-in users). */
export async function recordShopView(
  shopId: number,
  onViews?: (views: number) => void,
): Promise<number | null> {
  if (!Number.isFinite(shopId) || shopId <= 0) return null;

  try {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(sessionKey(shopId))) {
      return null;
    }
  } catch {
    /* private mode */
  }

  try {
    const res = await fetchWithTimeout(`/api/shops/${shopId}/view`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;

    const data = (await res.json().catch(() => ({}))) as { views?: number };
    const views = typeof data.views === "number" ? data.views : null;

    try {
      sessionStorage.setItem(sessionKey(shopId), "1");
    } catch {
      /* ignore */
    }

    if (views != null) onViews?.(views);

    return views;
  } catch {
    return null;
  }
}
