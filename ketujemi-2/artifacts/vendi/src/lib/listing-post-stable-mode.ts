import { isListingFlowPath } from "@/lib/listing-post-path";

const STABLE_ONCE_KEY = "vendi_listing_flow_sw_cleared_v1";

/** Drop stale service workers on listing post/detail/edit — prevents white-screen reload loops. */
export async function stabilizeListingFlowPage(): Promise<void> {
  if (!import.meta.env.PROD || typeof window === "undefined") return;
  if (!isListingFlowPath(window.location.pathname)) return;
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

/** @deprecated Use stabilizeListingFlowPage */
export async function stabilizeListingPostPage(): Promise<void> {
  return stabilizeListingFlowPage();
}
