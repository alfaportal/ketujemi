/** One-time per deploy: purge stale service workers and HTTP caches site-wide. */

const BOOT_VERSION = "v2";
const BOOT_KEY = `vendi_app_boot_${BOOT_VERSION}`;

declare global {
  interface Window {
    __kjBootstrapDone?: boolean;
  }
}

async function clearStaleClientCaches(): Promise<void> {
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if ("caches" in window) {
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
  }
}

/** Run synchronously before React mounts (production only). */
export async function bootstrapAppStability(): Promise<void> {
  if (!import.meta.env.PROD || typeof window === "undefined") {
    window.__kjBootstrapDone = true;
    return;
  }

  try {
    if (localStorage.getItem(BOOT_KEY) === "1") {
      window.__kjBootstrapDone = true;
      return;
    }
  } catch {
    /* private mode */
  }

  try {
    await clearStaleClientCaches();
    localStorage.setItem(BOOT_KEY, "1");
  } catch (err) {
    console.warn("[KetuJemi] app bootstrap cleanup failed", err);
  } finally {
    window.__kjBootstrapDone = true;
  }
}

export function runAppBootstrap(): void {
  void bootstrapAppStability();
}

export function isAppBootstrapComplete(): boolean {
  return typeof window !== "undefined" && window.__kjBootstrapDone === true;
}

/** @deprecated Use runAppBootstrap */
export function runListingFlowBootstrap(): void {
  runAppBootstrap();
}
