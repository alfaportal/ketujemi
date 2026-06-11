import { isListingPostPath } from "@/lib/listing-post-path";

/** Drop service worker control on the posting form — stale SW shells cause white-screen reloads. */
export async function stabilizeListingPostPage(): Promise<void> {
  if (!import.meta.env.PROD || typeof window === "undefined") return;
  if (!isListingPostPath(window.location.pathname)) return;
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  } catch {
    /* ignore */
  }
}
