import { isListingPostPath } from "@/lib/listing-post-path";

const STABLE_ONCE_KEY = "vendi_listing_post_sw_cleared_v1";

/** Drop service worker control on the posting form — stale SW shells cause white-screen reloads. */
export async function stabilizeListingPostPage(): Promise<void> {
  if (!import.meta.env.PROD || typeof window === "undefined") return;
  if (!isListingPostPath(window.location.pathname)) return;
  if (!("serviceWorker" in navigator)) return;
  try {
    if (sessionStorage.getItem(STABLE_ONCE_KEY) === "1") return;
    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length === 0) {
      sessionStorage.setItem(STABLE_ONCE_KEY, "1");
      return;
    }
    await Promise.all(regs.map((r) => r.unregister()));
    sessionStorage.setItem(STABLE_ONCE_KEY, "1");
  } catch {
    /* ignore */
  }
}
