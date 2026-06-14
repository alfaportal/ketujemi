import { isListingAreaPath } from "@/lib/listing-post-path";

const BOOT_KEY = "vendi_listing_flow_boot_v1";

/** Run before React mounts on listing post/detail/edit — clears stale SW + HTTP caches. */
export async function bootstrapListingFlowStability(): Promise<void> {
  if (!import.meta.env.PROD || typeof window === "undefined") return;
  const path = window.location.pathname;
  if (!isListingAreaPath(path)) return;

  try {
    if (sessionStorage.getItem(BOOT_KEY) === path) return;
  } catch {
    /* ignore */
  }

  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  } catch (err) {
    console.warn("[KetuJemi] listing-flow bootstrap cleanup failed", err);
  }

  try {
    sessionStorage.setItem(BOOT_KEY, path);
  } catch {
    /* ignore */
  }
}

/** Fire-and-forget sync entry for main.tsx */
export function runListingFlowBootstrap(): void {
  void bootstrapListingFlowStability();
}
