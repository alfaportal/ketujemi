import { isListingFlowPath } from "@/lib/listing-post-path";

const STABLE_ONCE_KEY = "vendi_listing_flow_sw_cleared_v1";

async function clearStaleCaches(): Promise<void> {
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if ("caches" in window) {
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
  }
}

/** Drop stale service workers on listing post/detail/edit — prevents white-screen reload loops. */
export async function stabilizeListingFlowPage(): Promise<void> {
  if (!import.meta.env.PROD || typeof window === "undefined") return;
  if (!isListingFlowPath(window.location.pathname)) return;
  try {
    if (sessionStorage.getItem(STABLE_ONCE_KEY) === "1") return;
    await clearStaleCaches();
    sessionStorage.setItem(STABLE_ONCE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** @deprecated Use stabilizeListingFlowPage */
export async function stabilizeListingPostPage(): Promise<void> {
  return stabilizeListingFlowPage();
}
